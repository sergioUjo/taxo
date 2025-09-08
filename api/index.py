from dotenv import load_dotenv
load_dotenv("/Users/sergioaraujo/Personal/taxo/.env.local")

from fastapi import FastAPI
from pydantic import BaseModel

from api.taxo_agents.classify_agent import classify_referral
from api.taxo_agents.patient_extractor_agent import extract_patient_info
from api.taxo_agents.struture_agent import get_file_as_string
from api.taxo_agents.rule_processor_agent import process_rule_against_document
from api.taxo_agents.provider_extractor_agent import extract_provider_name
import asyncio
from api.convex_client import convex_client


app = FastAPI()


class Request(BaseModel):
    case_id: str



@app.post("/api/process-pdf")
async def handle_chat_data(request: Request):
    case = convex_client.query("cases:getCaseWithDocuments", {
        "caseId": request.case_id
    })
    pdf_url = case["documents"][0]["fileUrl"]
    file_content = await get_file_as_string(pdf_url)
  
    await asyncio.gather(extract_patient_info(file_content, request.case_id), classify_referral(file_content, request.case_id),extract_provider_name(file_content, request.case_id))
    convex_client.mutation("cases:updateCase", {
        "caseId": request.case_id,
        "updates": {
            "status": "new"
        }
    })
    await _process_rules(request.case_id)
    
@app.post("/api/classify-referral")
async def classify(request: Request):
    case = convex_client.query("cases:getCaseWithDocuments", {
        "caseId": request.case_id
    })
    pdf_url = case["documents"][0]["fileUrl"]
    file_content = await get_file_as_string(pdf_url)

    await classify_referral(file_content, request.case_id)
    await _process_rules(request.case_id)

@app.post("/api/process-rules")
async def process_rules(request: Request):
    await _process_rules(request.case_id)



async def _process_rules(case_id: str):
    case = convex_client.query("cases:getCaseWithDocuments", {
        "caseId": case_id
    })
    rule_checks = convex_client.query("cases:getCaseRuleChecks", {
        "caseId": case_id
    })

    pdf_url = case["documents"][0]["fileUrl"]
    file_content = await get_file_as_string(pdf_url)
    await asyncio.gather( *[process_rule(file_content, case_id, rule_check) for rule_check in rule_checks])

async def process_rule(file_content: str, case_id: str, rule_check: dict):
    """
    Process a single rule against the document content.

    Args:
        file_content: The text content of the document
        case_id: The case ID
        rule_check: The rule check object containing rule information
    """
    try:
        # Rule data is now embedded directly in the rule check
        rule_name = rule_check.get("ruleTitle", "")
        rule_description = rule_check.get("ruleDescription", "")
    
        if not rule_name or not rule_description:
            print(f"Warning: Missing rule title or description for case {case_id}")
            return

        result = await process_rule_against_document(
            file_content=file_content,
            case_id=case_id,
            rule_name=rule_name,
            rule_description=rule_description
        )

        print(f"Rule '{rule_name}' processed for case {case_id}: {result.status}")
        print(f"Reasoning: {result.reasoning}")

        if result.required_additional_info:
            print(f"Required additional info: {result.required_additional_info}")

    except Exception as e:
        print(f"Error processing rule for case {case_id}: {str(e)}")