from typing import Any, List, Optional, Type
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

class Agent:
    """Simple Agent class for processing documents and extracting information."""
    
    def __init__(
        self, 
        name: str, 
        instructions: str, 
        tools: Optional[List] = None,
        output_type: Optional[Type[BaseModel]] = None,
        model: str = "gpt-4o-mini"
    ):
        self.name = name
        self.instructions = instructions
        self.tools = tools or []
        self.output_type = output_type
        self.model = model
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.output = None
    
    def run(self, input_data: str) -> Any:
        """Run the agent with the given input."""
        try:
            # If we have tools (like parse_pdf_to_md), use them first
            processed_data = input_data
            if self.tools:
                for tool in self.tools:
                    processed_data = tool(input_data)
            
            # Create a prompt combining instructions and data
            prompt = f"{self.instructions}\n\nData to process:\n{processed_data}"
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.instructions},
                    {"role": "user", "content": f"Process this data: {processed_data}"}
                ],
                temperature=0.1
            )
            
            result = response.choices[0].message.content
            
            # If we have an output type, try to parse it
            if self.output_type:
                try:
                    # Simple parsing - in a real implementation you'd want better JSON parsing
                    import json
                    if result.startswith('{') and result.endswith('}'):
                        data = json.loads(result)
                        self.output = self.output_type(**data)
                    else:
                        # Fallback: create a basic instance
                        self.output = self.output_type()
                except Exception as e:
                    print(f"Failed to parse output: {e}")
                    self.output = self.output_type() if self.output_type else result
            else:
                self.output = result
            
            return self.output
            
        except Exception as e:
            print(f"Error in agent {self.name}: {e}")
            if self.output_type:
                self.output = self.output_type()
            else:
                self.output = f"Error: {str(e)}"
            return self.output

class Runner:
    """Simple Runner class for async operations."""
    
    @staticmethod
    async def run(agent: Agent, input: str):
        """Run an agent asynchronously."""
        class Result:
            def __init__(self, output):
                self.final_output = output
        
        output = agent.run(input)
        return Result(output)
