import logging
from typing import Optional

from pydantic import BaseModel
from agents import Agent, Runner
from api.convex_client import convex_client


logger = logging.getLogger(__name__)


class ProviderInfo(BaseModel):
    name: Optional[str] = None
    """The referring or rendering provider's full name, e.g., 'Dr. Jane Q. Smith'"""


provider_name_extractor = Agent(
    name="Provider Name Extractor",
    instructions=
    """
    You are given medical/referral document content. Extract the referring or rendering provider's full name.

    Rules:
    - Prefer explicit labels like: Referring Provider, Rendering Provider, Physician, Provider, Doctor, MD, DO, PA, NP.
    - If multiple providers appear, choose the most clearly labeled referring/provider for this case.
    - Return only the human name, without credentials or titles when possible. If the name appears only with a title,
      remove prefixes/suffixes like Dr., MD, DO, PA-C, NP, PhD. Keep middle initials if present.
    - If no provider is clearly present, return null.
    """,
    output_type=ProviderInfo,
    model="gpt-4o-mini",
)


async def extract_provider_name(file_content: str, case_id: str) -> Optional[str]:
    """
    Extracts the provider name from the given document content and updates the case.

    Args:
        file_content: The text/markdown content of the document.
        case_id: The ID of the case to update with the extracted provider name.

    Returns:
        The provider name as a string, or None if not found.
    """
    try:
        result = await Runner.run(provider_name_extractor, file_content)
        info: ProviderInfo = result.final_output
        provider_name = info.name.strip() if info and info.name else None
        logger.info(f"Extracted provider name: {provider_name}")
        if provider_name:
            try:
                convex_client.mutation("cases:updateCase", {
                    "caseId": case_id,
                    "updates": {
                        "provider": provider_name,
                    }
                })
                logger.info(f"Updated case {case_id} with provider {provider_name}")
            except Exception as update_exc:
                logger.error(f"Failed updating case {case_id} with provider: {update_exc}")
        return provider_name
    except Exception as exc:
        logger.error(f"Failed to extract provider name: {exc}")
        return None


