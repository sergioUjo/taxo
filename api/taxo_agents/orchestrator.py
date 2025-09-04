from typing import List, Optional
from pydantic import BaseModel
from parse import parse_pdf_to_md
from agents import Agent


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
    You are a patient info extractor, you are given a file and a prompt you should return a list of all items you can find in the file, related to the prompt.
    It should be direct information like name, email, phone, address, identifiers, etc.
    """,
    tools=[parse_pdf_to_md],
    output_type=PatientInfo,
    model="gpt-4o-mini"
)
def extract_patient_info(file_path: str) -> PatientInfo:
    return patient_info_extractor.run(file_path)