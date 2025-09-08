import logging
from agents import Agent, Runner
from pydantic import BaseModel
from typing import List

from api.convex_client import convex_client

client = convex_client

# Import rule generator (will be used when needed)
from api.taxo_agents.rule_generator_agent import create_rules_for_procedure
INSTRUCTIONS = """
You are a clinical triage and routing assistant. Given a medical procedure requested and a description classify it.

SPECIALTY, TREATMENT, AND PROCEDURE GUIDELINES:
- Use existing specialties, treatment types, and procedures that best fit the referral content, only create a new item if it does not fit in an existing category.
- When creating new classifications, ensure they are medically accurate and follow standard clinical terminology.

Specialties examples:
Ophthalmology, Cardiology, Orthopedics, Dermatology, Neurology, Psychiatry, Gastroenterology, ENT, Pulmonology,
Nephrology, Urology, Endocrinology, Rheumatology, Oncology, Hematology, General Surgery, Plastic Surgery,
Vascular Surgery, Neurosurgery, Obstetrics and Gynecology, Pediatrics, Infectious Disease, Immunology,
Pain Medicine, Physical Medicine and Rehabilitation, Dentistry, Maxillofacial Surgery, Primary Care.

Decision rules:
- Prefer explicit codes/procedure names over symptoms; if CPT/ICD present, use them.
- If both a test and a procedure are requested, select Procedure or Surgery.
- If only assessment is requested, select Consultation.
- Therapy includes medications/physio/psychotherapy/rehab.
- Ongoing care without new request -> Follow-up or Monitoring.
- If ambiguous, use Primary Care + Consultation with low confidence and add a brief note.

Constraints:
- Use `null` (not empty string) when subtype doesn’t apply.
- Evidence items are short (3–12 words).
- Strip personal identifiers from evidence/notes.


"""
logger = logging.getLogger(__name__)

def list_specialties():
    specialties = client.query("specialties:getSpecialties")
    logger.info(specialties)
    return specialties

def list_treatment_types():
    """
    List the treatment types for a given specialty  
    Returns:
        A list of treatment types names
    """
    treatment_types = client.query("treatments:getTreatmentTypes")
    return treatment_types

def list_procedures():
    procedures = client.query("procedures:getProcedures")
    return procedures


def create_specialty(specialty_name:str,description:str):
    """
    Create a new specialty
    Args:
        specialty: The name of the specialty
        description: The description of the specialty
    """
    return client.mutation("specialties:createSpecialty", {"name": specialty_name, "description": description})

def create_treatment_type(specialty_id:str, treatment_type_name:str, description:str):
    """
    Create a new treatment type
    Args:
        specialty_id: The id of the specialty
        treatment_type: The name of the treatment type
        description: The description of the treatment type
    """
    return client.mutation("treatments:createTreatmentType", {"specialtyId": specialty_id, "name": treatment_type_name, "description": description})

def create_procedure(treatment_type_id:str, procedure_name:str, description:str):
    """
    Create a new procedure
    Args:
        treatment_type_id: The id of the treatment type
        procedure: The name of the procedure
        description: The description of the procedure
    Returns:
        The ID of the created procedure
    """
    procedure_id = client.mutation("procedures:createProcedure", {"treatmentTypeId": treatment_type_id, "name": procedure_name, "description": description})
    return procedure_id

class ClassifyOutput(BaseModel):
    specialty: str
    """The specialty of the referral"""
    specialty_description: str
    """The description of the specialty"""
    treatment_type: str
    """The treatment type of the referral"""
    treatment_type_description: str
    """The description of the treatment type"""
    procedure: str
    """The procedure of the referral"""
    procedure_description: str
    """The description of the procedure"""
    evidence: List[str]
    """The evidence for the classification"""
    notes: str
    """The notes for the classification"""
    notes: str = ""

classify_agent = Agent(
    name="Classify Agent",
    instructions=INSTRUCTIONS,
    output_type=ClassifyOutput,
    model="gpt-5-mini",
)
class ProcedureOutput(BaseModel):
    procedure_name: str
    """The name of the procedure requested"""
    description: str
    """The description of the procedure requested"""
    relevant_details: str
    """The relevant details of the procedure requested, any special code or condition, etc."""

process_extractor = Agent(
    name="Referral Request Extractor",
    instructions=(
        """
        You are a referral request extractor, you are given a medical referral examine it look and history request and patient information and return the procedure name, description, and relevant details.
"""
    ),
    output_type=ProcedureOutput,
    model="gpt-4.1-mini"
)
async def classify_referral(referral: str, case_id: str) -> ClassifyOutput:
    requested_procedure = (await Runner.run(process_extractor, input=referral)).final_output
    specialties = list_specialties()

    treatment_types = list_treatment_types()
    procedures = list_procedures()
    for specialty in specialties:
        specialty['treatmentTypes'] = []

    for treatment_type in treatment_types:
        treatment_type['procedures'] = []
        specialty = next((s for s in specialties if s['_id'] == treatment_type['specialtyId']), None)
        specialty['treatmentTypes'].append(treatment_type)

    for procedure in procedures:
        treatment_type = next((t for t in treatment_types if t['_id'] == procedure['treatmentTypeId']), None)
        treatment_type['procedures'].append(procedure)

    result_string = ""
    for specialty in specialties:
        result_string += f"{specialty['name']} - {specialty['description']}\n"
        for treatment_type in specialty['treatmentTypes']:
            result_string += f"\t{treatment_type['name']} - {treatment_type['description']}\n"
            for procedure in treatment_type['procedures']:
                result_string += f"\t\t{procedure['name']} - {procedure['description']}\n"
    result = (await Runner.run(classify_agent, 
                             f"Existing classifications: {result_string}\n"+
                             "--------------------------------\n"+
                             f"Procedure Requested:\n {requested_procedure.procedure_name}\n"
                             f"Procedure Description:\n {requested_procedure.description}\n"
                             f"Procedure Relevant Details:\n {requested_procedure.relevant_details}\n"
                             )).final_output
    
    matched_specialty = next((s for s in specialties if s['name'] == result.specialty), None)
    if matched_specialty is None:
        specialty = create_specialty(result.specialty, result.specialty_description)
        matched_specialty = specialty
    else:
        matched_specialty = matched_specialty["_id"]
    
    matched_treatment_type = next((t for t in treatment_types if t['name'] == result.treatment_type), None)
    if matched_treatment_type is None:
        treatment_type = create_treatment_type(matched_specialty, result.treatment_type, result.treatment_type_description)
        matched_treatment_type = treatment_type
    else:
        matched_treatment_type = matched_treatment_type["_id"]

    matched_procedure = next((p for p in procedures if p['name'] == result.procedure), None)
    procedure_is_new = False
    if matched_procedure is None:
        procedure_id = create_procedure(matched_treatment_type, result.procedure, result.procedure_description)
        matched_procedure = procedure_id
        procedure_is_new = True
    else:
        matched_procedure = matched_procedure["_id"]
    # Generate rules for new procedures
    if procedure_is_new:
        try:
            await create_rules_for_procedure(
                procedure_id=matched_procedure,
                procedure_name=result.procedure,
                procedure_description=result.procedure_description,
                specialty_name=result.specialty,
                treatment_type_name=result.treatment_type,
                specialty_description=result.specialty_description,
                treatment_type_description=result.treatment_type_description
            )
            logger.info(f"Successfully generated rules for new procedure: {result.procedure}")
        except Exception as exc:
            logger.error(f"Failed to generate rules for new procedure {result.procedure}: {exc}")

    convex_client.mutation("case_classifications:classifyCaseWithProcedure", {
        "caseId": case_id,
        "specialtyId": matched_specialty,
        "treatmentTypeId": matched_treatment_type,
        "procedureId": matched_procedure,
        "classifiedBy": "ai",
    })
    

    return result