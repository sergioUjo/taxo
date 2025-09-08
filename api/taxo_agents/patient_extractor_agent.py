
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from agents import Agent, Runner
from pydantic import BaseModel
from api.convex_client import convex_client

logger = logging.getLogger(__name__)

class PatientInfo(BaseModel):
    name: Optional[str] = None
    """The name of the patient"""
    date_of_birth: Optional[str] = None
    """The date of birth of the patient"""
    gender: Optional[str] = None
    """The gender of the patient"""
    email: Optional[str] = None
    """The email of the patient"""
    phone: Optional[str] = None
    """The phone number of the patient"""
    medical_record_number: Optional[str] = None
    """The medical record number of the patient"""
    insurance_provider: Optional[str] = None
    """The insurance provider of the patient"""
    insurance_member_id: Optional[str] = None
    """The insurance member ID of the patient"""
    address: Optional[str] = None
    """The address of the patient"""
    city: Optional[str] = None
    """The city of the patient"""
    state: Optional[str] = None
    """The state of the patient"""
    zip_code: Optional[str] = None
    """The zip code of the patient"""

patient_info_extractor = Agent(
    name="Patient Info Extractor",
    instructions="""
    You are a patient info extractor. You are given file content and should extract all patient-related information you can find.
    
    Extract the following information if available:
    - Patient name (full name)
    - Date of birth (in any format)
    - Gender/Sex
    - Email address
    - Phone number
    - Medical record number or patient ID
    - Insurance information (provider, member ID)
    - Address information (street, city, state, zip)
    
    Be thorough but accurate. Only extract information that is clearly identifiable as patient information.
    If information is not present or unclear, leave the field as None.
    """,
    output_type=PatientInfo,
    model="gpt-4.1-mini"
)

def find_or_create_patient(patient_info: PatientInfo) -> str:
    """
    Find an existing patient or create a new one based on the extracted patient information.
    Returns the patient ID.
    """
    try:
        # First, try to find existing patient by email check if
        if patient_info.email:
            print(f"Finding patient by email: {patient_info.email}")
            existing_patient = convex_client.query("patients:findPatientByEmail", {"email": patient_info.email})
            if existing_patient:
                logger.info(f"Found existing patient by email: {existing_patient['_id']}")
                return existing_patient["_id"]
        
        # Try to find by phone
        if patient_info.phone:
            existing_patient = convex_client.query("patients:findPatientByPhone", {"phone": patient_info.phone})
            if existing_patient:
                logger.info(f"Found existing patient by phone: {existing_patient['_id']}")
                return existing_patient["_id"]
        
        # Try to find by medical record number
        if patient_info.medical_record_number:
            existing_patient = convex_client.query("patients:findPatientByMRN", {"medicalRecordNumber": patient_info.medical_record_number})
            if existing_patient:
                logger.info(f"Found existing patient by MRN: {existing_patient['_id']}")
                return existing_patient["_id"]
        

        # Create new patient if no existing patient found
        additional_data = []
        
        # Add all extracted information to additionalData
        if patient_info.date_of_birth:
            additional_data.append({
                "name": "Date of Birth",
                "value": patient_info.date_of_birth,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.gender:
            additional_data.append({
                "name": "Gender",
                "value": patient_info.gender,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.medical_record_number:
            additional_data.append({
                "name": "Medical Record Number",
                "value": patient_info.medical_record_number,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.insurance_provider:
            additional_data.append({
                "name": "Insurance Provider",
                "value": patient_info.insurance_provider,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.insurance_member_id:
            additional_data.append({
                "name": "Insurance Member ID",
                "value": patient_info.insurance_member_id,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.address:
            additional_data.append({
                "name": "Address",
                "value": patient_info.address,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.city:
            additional_data.append({
                "name": "City",
                "value": patient_info.city,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.state:
            additional_data.append({
                "name": "State",
                "value": patient_info.state,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        if patient_info.zip_code:
            additional_data.append({
                "name": "Zip Code",
                "value": patient_info.zip_code,
                "source": "document_extraction",
                "extractedAt": datetime.now().isoformat()
            })
        
        patient={}
        if patient_info.name:
            patient["name"] = patient_info.name
        if patient_info.email:
            patient["email"] = patient_info.email
        if patient_info.phone:
            patient["phone"] = patient_info.phone
        patient["additionalData"] = additional_data

        # Create new patient
        patient_id = convex_client.mutation("patients:createPatient", patient)
        
        logger.info(f"Created new patient: {patient_id}")
        return patient_id
        
    except Exception as e:
        logger.error(f"Error finding or creating patient: {str(e)}")
        raise

def update_case_with_patient(case_id: str, patient_id: str) -> None:
    """
    Update the case with the patient ID.
    """
    try:
        convex_client.mutation("cases:updateCase", {
            "caseId": case_id,
            "updates": {
                "patientId": patient_id
            }
        })
        logger.info(f"Updated case {case_id} with patient {patient_id}")
    except Exception as e:
        logger.error(f"Error updating case with patient: {str(e)}")
        raise

async def extract_patient_info(file_content: str, case_id: str) -> PatientInfo:
    """
    Extract patient information from file content and update the case with the patient ID.
    """
    try:
        # Extract patient information using AI
        logger.info(f"Extracting patient info for case: {case_id}")
        extraction_result = await Runner.run(patient_info_extractor, file_content)
        patient_info = extraction_result.final_output
        
        logger.info(f"Extracted patient info: {patient_info}")
        
        # Find or create patient
        patient_id = find_or_create_patient(patient_info)
        
        # Update case with patient ID
        update_case_with_patient(case_id, patient_id)
        
        return patient_info
        
    except Exception as e:
        logger.error(f"Error in extract_patient_info: {str(e)}")
        raise