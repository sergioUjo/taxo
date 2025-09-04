from typing import List
from pydantic import BaseModel
from agents import Agent, Runner

from taxo_agents.conditions import Conditions

class ConditionsStatus(BaseModel):
    condition: str
    """The condition the patient needs to meet to be eligible"""
    status: str 
    """The status of the condition "met" | "not met" | "requires_clarification"""
    description: str
    """The description of why the condition is met or not met or requires clarification"""

class EligibilityRequestOutput(BaseModel):
    conditions: List[ConditionsStatus]
    """The conditions the patient needs to meet to be eligible"""

# The agent you call from your app: it can use the above tools.
process_extractor = Agent(
    name="Eligibility Conditions Checker",
    instructions=(
        """
        You are a eligibility conditions checker, you are given a patient referral request and any extra context, a list of conditions and their descriptions and return the status of the conditions.
"""
    ),
    output_type=EligibilityRequestOutput,
    model="gpt-4.1-mini"
)

async def condition_status(context: str, conditions: List[Conditions]) -> EligibilityRequestOutput:
    return (await Runner.run(process_extractor, input=f"Context: {context}\nConditions: {conditions}")).final_output
