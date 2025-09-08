import pymupdf4llm
import requests
from agents import Agent, Runner
from dotenv import load_dotenv
load_dotenv("/Users/sergioaraujo/Personal/taxo/.env.local")

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from api.taxo_agents.classify_agent import classify_agent, classify_referral
from api.taxo_agents.patient_extractor_agent import extract_patient_info
from api.taxo_agents.struture_agent import get_file_as_string
import asyncio


app = FastAPI()


class Request(BaseModel):
    pdf_path: str
    case_id: str



@app.post("/api/process-pdf")
async def handle_chat_data(request: Request):
    file_content = await get_file_as_string(request.pdf_path)
 
    await asyncio.gather(extract_patient_info(file_content, request.case_id), classify_referral(file_content, request.case_id))
    
@app.post("/api/classify-referral")
async def classify(request: Request):
    pdf_path = request.pdf_path 
    case_id = request.case_id
    file_content = await get_file_as_string(request.pdf_path)

    return await classify_referral(file_content, request.case_id)

