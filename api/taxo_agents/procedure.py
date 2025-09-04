from pydantic import BaseModel
from agents import Agent, Runner


class ProcedureOutput(BaseModel):
    procedure_name: str
    """The name of the procedure"""
    description: str
    """The description of the procedure"""
    relevant_details: str
    """The relevant details of the procedure, any special code or condition, etc."""

# The agent you call from your app: it can use the above tools.
process_extractor = Agent(
    name="Process Extractor",
    instructions=(
        """
        You are a process extractor, you are given a medical referral examine it look and history request and patient information and return the procedure name, description, and relevant details.
"""
    ),
    output_type=ProcedureOutput,
    model="gpt-4.1-mini"
)

async def extract_procedure(referral: str) -> ProcedureOutput:
    return (await Runner.run(process_extractor, input=referral)).final_output
