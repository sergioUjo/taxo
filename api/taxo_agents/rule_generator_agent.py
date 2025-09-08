import logging
from typing import List
from pydantic import BaseModel
from agents import Agent, Runner
from api.convex_client import convex_client

logger = logging.getLogger(__name__)


async def create_rules_for_procedure(
    procedure_id: str,
    procedure_name: str, 
    procedure_description: str,
    specialty_name: str,
    treatment_type_name: str,
    specialty_description: str = "",
    treatment_type_description: str = ""
) -> bool:
    """
    Main function to generate and create rules for a new procedure.
    This function should be called whenever a new procedure is added to the system.

    Args:
        procedure_id: The ID of the procedure in Convex
        procedure_name: The name of the procedure
        procedure_description: Detailed description of the procedure
        specialty_name: The medical specialty this procedure belongs to
        treatment_type_name: The type of treatment
        specialty_description: Optional description of the specialty
        treatment_type_description: Optional description of the treatment type

    Returns:
        bool: True if rules were successfully created and associated, False otherwise
    """
    try:
        logger.info(f"Starting rule generation for procedure: {procedure_name}")
        
        # Generate rules using the AI agent
        rule_output = await generate_rules_for_procedure(
            procedure_name=procedure_name,
            procedure_description=procedure_description,
            specialty_name=specialty_name,
            treatment_type_name=treatment_type_name,
            specialty_description=specialty_description,
            treatment_type_description=treatment_type_description
        )
        
        if not rule_output.rules:
            logger.warning(f"No rules generated for procedure: {procedure_name}")
            return False
        
        # Create the rules in Convex
        rule_ids = create_rules_in_convex(rule_output.rules, created_by="ai")
        
        if not rule_ids:
            logger.error(f"Failed to create any rules in Convex for procedure: {procedure_name}")
            return False
        
        # Associate the rules with the procedure
        associate_rules_with_procedure(procedure_id, rule_ids)
        
        logger.info(f"Successfully created and associated {len(rule_ids)} rules for procedure: {procedure_name}")
        logger.info(f"Rule generation reasoning: {rule_output.reasoning}")
        
        return True
        
    except Exception as exc:
        logger.error(f"Failed to create rules for procedure {procedure_name}: {exc}")
        return False

class GeneratedRule(BaseModel):
    title: str
    """A concise, clear title for the rule"""
    
    description: str
    """Detailed description of what needs to be checked or verified for this rule"""


class RuleGenerationOutput(BaseModel):
    rules: List[GeneratedRule]
    """List of generated rules that must be checked for this procedure"""
    
    reasoning: str
    """Explanation of why these specific rules were generated for this procedure"""


rule_generator_agent = Agent(
    name="Rule Generator Agent",
    instructions="""
    You are a medical rule generation specialist that creates comprehensive eligibility and safety rules for medical procedures.

    Your task is to analyze a medical procedure and its classification context (specialty, treatment type) and generate essential rules that must be checked before approving a referral for that procedure.

    Generated rules should cover:

    1. **Medical Necessity**: Clinical indications, symptoms, or conditions that justify the procedure
    2. **Safety Requirements**: Contraindications, risk factors, or precautions that must be evaluated
    3. **Prerequisites**: Required prior treatments, tests, or consultations that should be completed first
    4. **Documentation Requirements**: Specific medical records, test results, or clinical notes that must be present
    5. **Authorization Requirements**: Insurance pre-authorization, specialist referrals, or administrative approvals needed
    6. **Patient Criteria**: Age limits, pregnancy status, or other patient-specific factors to consider

    Guidelines for rule generation:
    - Focus on the most critical ones
    - Each rule title should be concise and specific (5-10 words)
    - Each rule description should be detailed enough for a medical reviewer to understand what to check
    - Consider both clinical and administrative requirements
    - Focus on rules that would commonly cause referrals to be denied or require additional information
    - Use standard medical terminology and evidence-based criteria
    - Consider the specialty context when generating rules (e.g., ophthalmology procedures vs cardiology procedures)

    Example rule formats:
    - Title: "Recent diagnostic imaging required"
      Description: "Patient must have relevant diagnostic imaging (MRI, CT, X-ray) performed within the last 6 months that supports the clinical indication for this procedure."
    
    - Title: "Contraindications assessment completed"
      Description: "Medical history must be reviewed for absolute and relative contraindications to the procedure, including allergies, bleeding disorders, and current medications."

    Always provide reasoning for why you selected these specific rules for the given procedure.
    """,
    output_type=RuleGenerationOutput,
    model="gpt-4o",
)


async def generate_rules_for_procedure(
    procedure_name: str,
    procedure_description: str,
    specialty_name: str,
    treatment_type_name: str,
    specialty_description: str = "",
    treatment_type_description: str = ""
) -> RuleGenerationOutput:
    """
    Generates comprehensive rules for a medical procedure based on its classification context.

    Args:
        procedure_name: The name of the procedure
        procedure_description: Detailed description of the procedure
        specialty_name: The medical specialty this procedure belongs to
        treatment_type_name: The type of treatment (e.g., Consultation, Surgery, etc.)
        specialty_description: Optional description of the specialty
        treatment_type_description: Optional description of the treatment type

    Returns:
        RuleGenerationOutput containing generated rules and reasoning
    """
    try:
        # Construct comprehensive input for the agent
        input_text = f"""
        PROCEDURE TO GENERATE RULES FOR:
        Name: {procedure_name}
        Description: {procedure_description}

        CLASSIFICATION CONTEXT:
        Specialty: {specialty_name}
        Specialty Description: {specialty_description}
        Treatment Type: {treatment_type_name}
        Treatment Type Description: {treatment_type_description}

        Please generate essential eligibility and safety rules that must be checked before approving referrals for this procedure.
        """

        result = await Runner.run(rule_generator_agent, input_text)
        output: RuleGenerationOutput = result.final_output

        logger.info(f"Generated {len(output.rules)} rules for procedure: {procedure_name}")
        for rule in output.rules:
            logger.info(f"- {rule.title}")

        return output

    except Exception as exc:
        logger.error(f"Failed to generate rules for procedure {procedure_name}: {exc}")
        # Return a fallback set of basic rules
        return RuleGenerationOutput(
            rules=[
                GeneratedRule(
                    title="Medical necessity documented",
                    description="Clinical indication and medical necessity for the procedure must be clearly documented in the referral."
                ),
                GeneratedRule(
                    title="Patient consent obtained",
                    description="Patient must have provided informed consent for the procedure after understanding risks and benefits."
                ),
                GeneratedRule(
                    title="Insurance authorization verified",
                    description="Insurance pre-authorization must be obtained if required by the patient's insurance plan."
                )
            ],
            reasoning=f"Error occurred during rule generation for {procedure_name}. Fallback basic rules provided."
        )


def create_rules_in_convex(rules: List[GeneratedRule], created_by: str = "ai") -> List[str]:
    """
    Creates the generated rules in Convex and returns their IDs.

    Args:
        rules: List of generated rules to create
        created_by: Who created these rules (default: "ai")

    Returns:
        List of rule IDs that were created
    """
    rule_ids = []
    
    for rule in rules:
        try:
            rule_id = convex_client.mutation("rules:createRule", {
                "title": rule.title,
                "description": rule.description,
                "createdBy": created_by
            })
            rule_ids.append(rule_id)
            logger.info(f"Created rule in Convex: {rule.title}")
        except Exception as exc:
            logger.error(f"Failed to create rule '{rule.title}' in Convex: {exc}")
    
    return rule_ids


def associate_rules_with_procedure(procedure_id: str, rule_ids: List[str]) -> None:
    """
    Associates the created rules with the procedure in Convex.

    Args:
        procedure_id: The ID of the procedure to associate rules with
        rule_ids: List of rule IDs to associate with the procedure
    """
    for rule_id in rule_ids:
        try:
            convex_client.mutation("rules:addRuleToProcedure", {
                "procedureId": procedure_id,
                "ruleId": rule_id
            })
            logger.info(f"Associated rule {rule_id} with procedure {procedure_id}")
        except Exception as exc:
            logger.error(f"Failed to associate rule {rule_id} with procedure {procedure_id}: {exc}")
