from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from parse import parse_pdf_to_md
from agents import Agent


class AdditionalDataItem(BaseModel):
    name: str
    """The field name (e.g., 'Date of Birth', 'Medical Record Number', 'Insurance Provider')"""
    value: str
    """The field value"""
    confidence: Optional[float] = None
    """Confidence score from AI extraction (0.0-1.0)"""
    source: Optional[str] = None
    """Source document or extraction method"""
    extractedAt: Optional[str] = None
    """When this data was extracted"""


class PatientInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    additionalData: List[AdditionalDataItem] = []
    """Flexible array for any additional patient information"""


class PatientSearchResult(BaseModel):
    found_existing: bool
    """Whether an existing patient was found"""
    patient_id: Optional[str] = None
    """The ID of the existing patient if found"""
    confidence_score: float
    """Confidence that this is the correct patient match (0.0-1.0)"""
    match_criteria: List[str]
    """List of criteria that matched (e.g., ['email', 'phone', 'name_and_dob'])"""
    extracted_info: Optional[PatientInfo] = None
    """Patient information extracted from documents if no existing patient found"""


class DuplicateCheckResult(BaseModel):
    potential_duplicates: List[dict]
    """List of potential duplicate patients with match details"""
    recommended_action: str
    """Action recommendation: 'create_new', 'use_existing', 'needs_review'"""
    confidence: float
    """Confidence in the recommendation (0.0-1.0)"""


# Patient Finder Agent - searches for existing patients
patient_finder = Agent(
    name="Patient Finder",
    instructions="""
    You are a patient finder agent. Your job is to search for existing patients in the database
    based on the provided criteria and determine if a patient already exists.
    
    When searching for patients:
    1. Use email as the strongest matching criteria (unique identifier)
    2. Use phone number as secondary strong criteria
    3. Use combination of name + date of birth as tertiary criteria
    4. Consider medical record number if available
    
    Matching confidence levels:
    - Email match: 0.95+ confidence
    - Phone match: 0.85+ confidence  
    - Name + DOB match: 0.75+ confidence
    - Name similarity + partial info: 0.5-0.7 confidence
    
    Return the search results with confidence scores and matching criteria.
    """,
    model="gpt-4o-mini",
    output_type=PatientSearchResult,
)


# Patient Info Extractor Agent - extracts patient info from documents
patient_info_extractor = Agent(
    name="Patient Info Extractor", 
    instructions="""
    You are a patient information extractor. Extract patient demographics and contact information
    from medical documents, referral forms, insurance cards, and other healthcare documents.
    
    Core fields to extract (if available):
    - Full name (first, middle, last) -> use 'name' field
    - Email address -> use 'email' field  
    - Phone number (home, mobile, work) -> use 'phone' field
    
    Additional data to extract into the additionalData array (use descriptive field names):
    - Date of Birth -> name: "Date of Birth", value: "YYYY-MM-DD"
    - Medical Record Number -> name: "Medical Record Number", value: "MRN123456"
    - Address -> name: "Address", value: "123 Main St, City, ST 12345"
    - Insurance Provider -> name: "Insurance Provider", value: "Blue Cross Blue Shield"
    - Insurance Member ID -> name: "Insurance Member ID", value: "BC123456789"
    - Insurance Group Number -> name: "Insurance Group Number", value: "GRP001"
    - Emergency Contact -> name: "Emergency Contact", value: "Jane Doe - 555-0124 (Spouse)"
    - Primary Care Physician -> name: "Primary Care Physician", value: "Dr. Smith"
    - Referring Physician -> name: "Referring Physician", value: "Dr. Johnson"
    - Chief Complaint -> name: "Chief Complaint", value: "Knee pain"
    - Diagnosis Code -> name: "Diagnosis Code", value: "M25.561"
    - Prior Authorization -> name: "Prior Authorization Number", value: "AUTH123456"
    
    For each additionalData item:
    - Use clear, human-readable field names
    - Extract dates in YYYY-MM-DD format when possible
    - Clean phone numbers to standard format
    - Provide confidence scores (0.0-1.0) based on clarity of extraction
    - Set source to the document type/name if identifiable
    
    Be careful to:
    - Distinguish between patient info and provider/facility info
    - Only extract information you're confident about
    - Use null/empty for unclear or missing information
    - Be flexible - extract any relevant patient information even if not in the examples above
    """,
    tools=[parse_pdf_to_md],
    model="gpt-4o-mini", 
    output_type=PatientInfo,
)


# Duplicate Detection Agent - analyzes potential duplicates
duplicate_detector = Agent(
    name="Duplicate Detector",
    instructions="""
    You are a duplicate detection specialist. Analyze potential patient duplicates and recommend actions.
    
    When analyzing potential duplicates:
    1. Exact email match = almost certainly same patient (use existing)
    2. Exact phone match = very likely same patient (use existing) 
    3. Same name + DOB = likely same patient (use existing)
    4. Similar name + same DOB = possible duplicate (needs review)
    5. Same name + different contact info = possible duplicate (needs review)
    
    Recommendations:
    - 'use_existing': High confidence this is the same patient
    - 'create_new': High confidence this is a different patient  
    - 'needs_review': Uncertain, requires human review
    
    Consider factors like:
    - Name variations (nicknames, maiden names)
    - Old vs new contact information
    - Data entry errors
    - Common names with different people
    """,
    model="gpt-4o-mini",
    output_type=DuplicateCheckResult,
)


class PatientManager:
    """
    Main patient management class that coordinates the various agents
    to handle patient identification and creation.
    """
    
    def __init__(self):
        self.finder = patient_finder
        self.extractor = patient_info_extractor
        self.detector = duplicate_detector
    
    async def process_new_referral(self, document_path: str, convex_client=None) -> PatientSearchResult:
        """
        Process a new referral document to either find existing patient or extract new patient info.
        
        Args:
            document_path: Path to the referral document
            convex_client: Convex client for database operations (optional for testing)
            
        Returns:
            PatientSearchResult with either existing patient info or extracted new patient info
        """
        # Step 1: Extract patient information from the document
        extracted_info = await self.extractor.run(
            f"Extract patient information from this document: {document_path}"
        )
        
        if not convex_client:
            # Return extracted info without database search (for testing)
            return PatientSearchResult(
                found_existing=False,
                confidence_score=0.0,
                match_criteria=[],
                extracted_info=extracted_info
            )
        
        # Step 2: Search for existing patients using extracted criteria
        potential_duplicates = []
        
        # Search by email
        if extracted_info.email:
            email_match = await convex_client.query("patients:findPatientByEmail", {
                "email": extracted_info.email
            })
            if email_match:
                potential_duplicates.append({
                    "patient": email_match,
                    "matchType": "email",
                    "confidence": 0.95
                })
        
        # Search by phone
        if extracted_info.phone:
            phone_match = await convex_client.query("patients:findPatientByPhone", {
                "phone": extracted_info.phone
            })
            if phone_match:
                potential_duplicates.append({
                    "patient": phone_match,
                    "matchType": "phone", 
                    "confidence": 0.85
                })
        
        # Search by MRN
        if extracted_info.medicalRecordNumber:
            mrn_match = await convex_client.query("patients:findPatientByMRN", {
                "medicalRecordNumber": extracted_info.medicalRecordNumber
            })
            if mrn_match:
                potential_duplicates.append({
                    "patient": mrn_match,
                    "matchType": "mrn",
                    "confidence": 0.90
                })
        
        # Search by name and additional data if available
        if extracted_info.name:
            name_matches = await convex_client.query("patients:searchPatientsByName", {
                "nameQuery": extracted_info.name
            })
            for match in name_matches:
                confidence = 0.6
                matchType = "name"
                
                # Check if additional data matches for higher confidence
                if extracted_info.additionalData and match.get("additionalData"):
                    matching_data_count = 0
                    total_searchable_data = 0
                    
                    for extracted_item in extracted_info.additionalData:
                        if extracted_item.name.lower() in ["date of birth", "medical record number"]:
                            total_searchable_data += 1
                            for patient_item in match["additionalData"]:
                                if (patient_item["name"].lower() == extracted_item.name.lower() and 
                                    patient_item["value"] == extracted_item.value):
                                    matching_data_count += 1
                                    break
                    
                    if total_searchable_data > 0:
                        match_ratio = matching_data_count / total_searchable_data
                        if match_ratio > 0.5:
                            confidence = 0.75 + (match_ratio * 0.15)  # Up to 0.9 confidence
                            matchType = "name_and_additional_data"
                
                potential_duplicates.append({
                    "patient": match,
                    "matchType": matchType,
                    "confidence": confidence
                })
        
        # Step 3: Analyze duplicates and make recommendation
        if potential_duplicates:
            # Get the highest confidence match
            best_match = max(potential_duplicates, key=lambda x: x["confidence"])
            
            if best_match["confidence"] >= 0.85:
                # High confidence match - use existing patient
                return PatientSearchResult(
                    found_existing=True,
                    patient_id=best_match["patient"]["_id"],
                    confidence_score=best_match["confidence"],
                    match_criteria=[best_match["matchType"]],
                    extracted_info=extracted_info
                )
            else:
                # Lower confidence - might need review, but for now create new
                return PatientSearchResult(
                    found_existing=False,
                    confidence_score=0.0,
                    match_criteria=[],
                    extracted_info=extracted_info
                )
        
        # Step 4: No matches found - return extracted info for new patient creation
        return PatientSearchResult(
            found_existing=False,
            confidence_score=0.0,
            match_criteria=[],
            extracted_info=extracted_info
        )
    
    async def create_patient_from_info(self, patient_info: PatientInfo, convex_client) -> str:
        """
        Create a new patient in the database from extracted information.
        
        Args:
            patient_info: Extracted patient information
            convex_client: Convex client for database operations
            
        Returns:
            Patient ID of the created patient
        """
        # Convert additionalData to the format expected by Convex
        additional_data_for_convex = []
        if patient_info.additionalData:
            for item in patient_info.additionalData:
                convex_item = {
                    "name": item.name,
                    "value": item.value,
                }
                if item.confidence is not None:
                    convex_item["confidence"] = item.confidence
                if item.source:
                    convex_item["source"] = item.source
                if item.extractedAt:
                    convex_item["extractedAt"] = item.extractedAt
                else:
                    convex_item["extractedAt"] = datetime.now().isoformat()
                
                additional_data_for_convex.append(convex_item)
        
        patient_data = {
            "name": patient_info.name,
            "email": patient_info.email,
            "phone": patient_info.phone,
            "additionalData": additional_data_for_convex,
        }
        
        # Remove None values (but keep empty arrays)
        patient_data = {k: v for k, v in patient_data.items() if v is not None}
        
        patient_id = await convex_client.mutation("patients:createPatient", patient_data)
        return patient_id


# Global instance
patient_manager = PatientManager()
