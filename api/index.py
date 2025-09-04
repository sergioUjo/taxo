import pymupdf4llm
import requests
from agents import Agent, Runner
from dotenv import load_dotenv
load_dotenv("/Users/sergioaraujo/Personal/taxo/.env.local")

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from api.taxo_agents.classify_agent import classify_agent, classify_referral


class ResultItem(BaseModel):
    label: str
    """The label of the item"""
    value: str
    """The value of the item"""
    confidence: float
    """The confidence score of the item"""

class AdditionalDataItem(BaseModel):
    name: str
    """The field name (e.g., 'Date of Birth', 'Medical Record Number', 'Insurance Provider')"""
    value: str
    """The field value"""


class PatientInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    additionalData: List[AdditionalDataItem] = []
    """Flexible array for any additional patient information"""


# Legacy agent for backward compatibility
patient_info_extractor = Agent(
    name="Patient Info Extractor",
    instructions="""
    You are a patient info extractor, you are given a file content and you should return a list of all items you can find in the file, related to the patient.
    It should be direct information like name, email, phone, address, identifiers, etc. 
    Do not hallucinate any information, only return the information that is directly in the file.
    File is likly in sections, you should return the information in the sections that are related to the patient.
    """,
    output_type=PatientInfo,
    model="gpt-4o"
)



app = FastAPI()


class Request(BaseModel):
    pdf_path: str



@app.post("/api/process-pdf")
async def handle_chat_data(request: Request):
    pdf_path = request.pdf_path
    import tempfile

    response = requests.get(pdf_path)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_file:
        tmp_file.write(response.content)
        tmp_pdf_path = tmp_file.name
        pdf_markdown = pymupdf4llm.to_markdown(tmp_pdf_path)
        return ( await Runner.run(patient_info_extractor, pdf_markdown)).final_output
    
@app.post("/api/classify-referral")
async def classify(request: Request):
    pdf_path = request.pdf_path
    import tempfile

    response = requests.get(pdf_path)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_file:
        tmp_file.write(response.content)
        tmp_pdf_path = tmp_file.name
        pdf_markdown = pymupdf4llm.to_markdown(tmp_pdf_path)
        return await classify_referral(pdf_markdown)