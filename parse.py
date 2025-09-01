import asyncio, json, re
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF
from pydantic import BaseModel
from agents import Runner, function_tool
import pymupdf4llm

from taxo_agents.procedure import extract_procedure

from taxo_agents.conditions import condition_check

from taxo_agents.condtion_status import condition_status
OPENAI_API_KEY="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"

# --------------------------
# 0) Canonicalization helpers
# --------------------------
def canonicalize_space(s: str) -> str:
    # single spaces, strip weird whitespace, keep original ASCII chars
    return re.sub(r"\s+", " ", s).strip()

EMAIL = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)
PHONE = re.compile(r"\+?\d[\d ()\-]{6,}")

def looks_like_email(v: str) -> bool:
    return EMAIL.fullmatch(v) is not None

def looks_like_phone(v: str) -> bool:
    return PHONE.search(v) is not None

# --------------------------
# 1) PDF → pages with text+spans


def parse_pdf_to_md(pdf_path: str) -> str:
    print(f"Parsing PDF: {pdf_path}")
    return  pymupdf4llm.to_markdown(pdf_path)


# The agent you call from your app: it can use the above tools.
# 4) Small CLI
async def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf_path")
    ap.add_argument("policy_path")
    args = ap.parse_args()
    
    print(f"Processing: {args.pdf_path}")
    referral =  parse_pdf_to_md(args.pdf_path)
    policy =  parse_pdf_to_md(args.policy_path)
    eligibility_request = await extract_procedure(referral)
    print(eligibility_request)
    print("--------------------------------")
    eligibility_request = await condition_check(eligibility_request, policy)
    print(eligibility_request)
    print("--------------------------------")
    if eligibility_request.is_eligible:
        print("Eligible")
        eligibility_request = await condition_status(referral, eligibility_request.conditions)
        for condition in eligibility_request.conditions:
            print(condition)
    else:
        print("Not Eligible")
    # Call the single end-to-end tool directly to get JSON output




if __name__ == "__main__":
    asyncio.run(main())