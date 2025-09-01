from typing import List
from pydantic import BaseModel
from agents import Agent, Runner

from taxo_agents.procedure import ProcedureOutput

class Conditions(BaseModel):
    condition: str
    """The condition the patient needs to meet to be eligible"""
    description: str
    """The description of the condition"""

class ConditionCheckOutput(BaseModel):
    is_eligible: bool
    """Whether the procedure is eligible"""
    conditions: List[Conditions]
    """The conditions the patient needs to meet to be eligible"""

# The agent you call from your app: it can use the above tools.
eligibility_agent = Agent(
    name="Eligibility Agent",
    instructions=(
        """
        You are a eligibility agent, you are given a procedure and a policy and return whether the procedure is eligible and the conditions the patient needs to meet to be eligible.
"""
    ),
    output_type=ConditionCheckOutput,
    model="gpt-4.1-mini"
)

async def condition_check(procedure: ProcedureOutput, policy: str) -> ConditionCheckOutput:
    return (await Runner.run(eligibility_agent, input=
                            f"Procedure: {procedure.procedure_name}\n"
                            f"Procedure Description: {procedure.description}\n"
                            f"ProcedureRelevant Details: {procedure.relevant_details}\n"
                            f"Policy: {policy}"
                            )).final_output
