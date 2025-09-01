"""
Example usage of the PDF to Markdown parser.

This file demonstrates how to use the parse_markdown.py module
to convert PDF files to markdown format.
"""

from parse_markdown import pdf_to_markdown, pdf_to_markdown_with_options


def simple_example():
    """Simple PDF to markdown conversion."""
    try:
        # Basic conversion - just pass the PDF path
        md_text = pdf_to_markdown("input.pdf")
        print("Conversion successful!")
        print(f"Markdown length: {len(md_text)} characters")
        
        # Save to file
        md_text = pdf_to_markdown("input.pdf", "output.md")
        print("Saved to output.md")
        
    except Exception as e:
        print(f"Error: {e}")


def advanced_example():
    """Advanced PDF to markdown conversion with options."""
    try:
        # Convert with image extraction
        md_text = pdf_to_markdown_with_options(
            pdf_path="input.pdf",
            output_path="advanced_output.md",
            page_chunks=True,
            write_images=True,
            image_path="./images/"
        )
        print("Advanced conversion with images successful!")
        
    except Exception as e:
        print(f"Error: {e}")


def comparison_example():
    """Compare the markdown output with other parsing methods."""
    try:
        from parse import parse_pdf_to_text
        
        # Get text using original parser
        text_output = parse_pdf_to_text("input.pdf")
        
        # Get markdown using pymupdf4llm
        md_output = pdf_to_markdown("input.pdf")
        
        print("=== TEXT OUTPUT (Original) ===")
        print(text_output[:500] + "..." if len(text_output) > 500 else text_output)
        
        print("\n=== MARKDOWN OUTPUT (pymupdf4llm) ===")
        print(md_output[:500] + "..." if len(md_output) > 500 else md_output)
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    print("PDF to Markdown Examples")
    print("========================")
    
    # Uncomment the examples you want to run:
    
    # simple_example()
    # advanced_example()
    # comparison_example()
    
    print("\nTo run examples, uncomment the desired function calls above.")
    print("Make sure you have a PDF file named 'input.pdf' in the current directory.")
