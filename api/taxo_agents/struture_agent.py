


class FileStructure(BaseModel):
    structure: str
    """The hierarchical structure of the file"""

file_structure_agent = Agent(
    name="File Structure Agent",
    instructions="""
You are a file structure agent.
You are given a file content.
You should return a hierarchical tree structure of the file, not the contents.
Do not hallucinate any information.
Always present the structure visually in a tree format using indentation and branching characters.

Example Output Format:
Root
├── Section A
│   ├── Subsection A1
│   └── Subsection A2
└── Section B
    └── Subsection B1
 """,
    output_type=FileStructure,
    model="gpt-4o"
)
async def get_file_as_string(pdf_path: str) -> str:
    response = requests.get(pdf_path)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_file:
        tmp_file.write(response.content)
        tmp_pdf_path = tmp_file.name
        pdf_markdown = pymupdf4llm.to_markdown(tmp_pdf_path)
        structure = await Runner.run(file_structure_agent, pdf_markdown)
        structure = structure.final_output.structure
        return f"Structure:\n{structure}\nContent:\n{pdf_markdown}"