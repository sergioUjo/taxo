import logging
from typing import Optional
from enum import Enum

from pydantic import BaseModel
from agents import Agent, Runner
from api.convex_client import convex_client

logger = logging.getLogger(__name__)


class RuleStatus(str, Enum):
    VALID = "valid"
    NEEDS_MORE_INFO = "needs_more_information"
    DENY = "deny"


class RuleProcessingOutput(BaseModel):
    status: RuleStatus
    """The status of the rule evaluation: 'valid', 'needs_more_information', or 'deny'"""

    reasoning: str
    """Detailed explanation of why this status was chosen"""

    required_additional_info: Optional[list[str]] = None
    """List of additional information needed if status is 'needs_more_information'"""


rule_processor_agent = Agent(
    name="Rule Processor Agent",
    instructions="""
    You are a medical rule processor that evaluates referral documents against specific rules.

    Your task is to analyze the document content against a given rule and determine if the referral meets the rule criteria.

    Return one of three statuses:

    1. **valid**: The referral fully meets all rule requirements with the available information.

    2. **needs_more_information**: The referral could potentially meet the rule requirements, but additional information is needed to make a final determination, user should be asked for more documents.

    3. **deny**: The referral does not meet the rule requirements, and no additional information would change this outcome. The information in the documents is sufficient to close this case.

    Guidelines:
    - Carefully analyze all document content against the rule requirements
    - Consider medical necessity, clinical appropriateness, and compliance with the rule
    - Be specific about what additional information is needed if status is 'needs_more_information'
    - Provide clear reasoning for your decision
    - Focus on factual analysis rather than subjective judgment
    - When in doubt about having sufficient information, err towards 'needs_more_information' rather than 'deny'
    """,
    output_type=RuleProcessingOutput,
    model="gpt-5",
)


async def process_rule_against_document(
    file_content: str,
    case_id: str,
    rule_name: str,
    rule_description: str
) -> RuleProcessingOutput:
    """
    Processes a rule against document content and updates the case with the result.

    Args:
        file_content: The text/markdown content of the document.
        case_id: The ID of the case to update with the rule processing result.
        rule_name: The name/title of the rule being evaluated.
        rule_description: The detailed description of the rule requirements.

    Returns:
        The rule processing output containing status, reasoning, and any required additional info.
    """
    try:
        # Combine rule information with document content for analysis
        input_text = f"""
        RULE TO EVALUATE:
        Name: {rule_name}
        Description: {rule_description}

        DOCUMENT CONTENT:
        {file_content}
        """

        result = await Runner.run(rule_processor_agent, input_text)
        output: RuleProcessingOutput = result.final_output

        logger.info(f"Rule processing result for case {case_id}: {output.status}")

        # Update the case with the rule processing result
        try:
            convex_client.mutation("cases:updateRuleCheck", {
                "caseId": case_id,
                "ruleTitle": rule_name,
                "status": output.status,
                "reasoning": output.reasoning,
                "requiredAdditionalInfo": output.required_additional_info or [],
            })
            logger.info(f"Updated case {case_id} with rule processing result")
        except Exception as update_exc:
            logger.error(f"Failed updating case {case_id} with rule result: {update_exc}")

        return output

    except Exception as exc:
        logger.error(f"Failed to process rule for case {case_id}: {exc}")
        return RuleProcessingOutput(
            status=RuleStatus.NEEDS_MORE_INFO,
            reasoning=f"Error processing rule: {str(exc)}",
            required_additional_info=["Please review manually due to processing error"]
        )
