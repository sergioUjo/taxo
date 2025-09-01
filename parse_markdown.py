"""
PDF to Markdown parser using pymupdf4llm.

This module provides a simple interface to convert PDF documents to markdown format
using the pymupdf4llm library, which is optimized for LLM consumption.
"""

import argparse
import asyncio
from pathlib import Path
from typing import Optional

import pymupdf4llm


def pdf_to_markdown(pdf_path: str, output_path: Optional[str] = None) -> str:
    """Convert a PDF file to markdown format.
    
    Args:
        pdf_path: Path to the input PDF file
        output_path: Optional path to save the markdown output. If None, only returns the content.
        
    Returns:
        Markdown content as a string
        
    Raises:
        FileNotFoundError: If the PDF file doesn't exist
        Exception: If there's an error during conversion
    """
    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    try:
        # Convert PDF to markdown
        md_text = pymupdf4llm.to_markdown(pdf_path)
        
        # Save to file if output path is provided
        if output_path:
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(md_text, encoding='utf-8')
            print(f"Markdown saved to: {output_path}")
        
        return md_text
        
    except Exception as e:
        raise Exception(f"Error converting PDF to markdown: {str(e)}")


def pdf_to_markdown_with_options(
    pdf_path: str,
    output_path: Optional[str] = None,
    page_chunks: bool = False,
    write_images: bool = False,
    embed_images: bool = False,
    image_path: Optional[str] = None
) -> str:
    """Convert a PDF file to markdown with additional options.
    
    Args:
        pdf_path: Path to the input PDF file
        output_path: Optional path to save the markdown output
        page_chunks: If True, return markdown in page chunks
        write_images: If True, extract and save images
        embed_images: If True, embed images as base64
        image_path: Directory to save extracted images
        
    Returns:
        Markdown content as a string
    """
    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    try:
        # Prepare options
        kwargs = {}
        if page_chunks:
            kwargs['page_chunks'] = True
        if write_images and image_path:
            kwargs['write_images'] = True
            kwargs['image_path'] = image_path
        if embed_images:
            kwargs['embed_images'] = True
            
        # Convert PDF to markdown with options
        md_text = pymupdf4llm.to_markdown(pdf_path, **kwargs)
        
        # Save to file if output path is provided
        if output_path:
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(md_text, encoding='utf-8')
            print(f"Markdown saved to: {output_path}")
        
        return md_text
        
    except Exception as e:
        raise Exception(f"Error converting PDF to markdown: {str(e)}")


def batch_convert_pdfs(input_dir: str, output_dir: str) -> None:
    """Convert all PDF files in a directory to markdown format.
    
    Args:
        input_dir: Directory containing PDF files
        output_dir: Directory to save markdown files
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    if not input_path.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    pdf_files = list(input_path.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return
    
    print(f"Found {len(pdf_files)} PDF files to convert...")
    
    for pdf_file in pdf_files:
        try:
            md_filename = pdf_file.stem + ".md"
            md_filepath = output_path / md_filename
            
            print(f"Converting: {pdf_file.name}")
            md_text = pdf_to_markdown(str(pdf_file), str(md_filepath))
            print(f"✓ Converted: {pdf_file.name} -> {md_filename}")
            
        except Exception as e:
            print(f"✗ Error converting {pdf_file.name}: {str(e)}")


async def main():
    """Command-line interface for PDF to markdown conversion."""
    parser = argparse.ArgumentParser(
        description="Convert PDF files to markdown format using pymupdf4llm"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Single file conversion
    single_parser = subparsers.add_parser('convert', help='Convert a single PDF file')
    single_parser.add_argument('pdf_path', help='Path to the PDF file')
    single_parser.add_argument('-o', '--output', help='Output markdown file path')
    single_parser.add_argument('--page-chunks', action='store_true', 
                             help='Return markdown in page chunks')
    single_parser.add_argument('--write-images', action='store_true',
                             help='Extract and save images')
    single_parser.add_argument('--embed-images', action='store_true',
                             help='Embed images as base64')
    single_parser.add_argument('--image-path', help='Directory to save extracted images')
    
    # Batch conversion
    batch_parser = subparsers.add_parser('batch', help='Convert all PDFs in a directory')
    batch_parser.add_argument('input_dir', help='Directory containing PDF files')
    batch_parser.add_argument('output_dir', help='Directory to save markdown files')
    
    args = parser.parse_args()
    
    # If no command specified, show help
    if not args.command:
        parser.print_help()
        return
    
    try:
        if args.command == 'convert':
            # Single file conversion
            md_text = pdf_to_markdown_with_options(
                pdf_path=args.pdf_path,
                output_path=args.output,
                page_chunks=args.page_chunks,
                write_images=args.write_images,
                embed_images=args.embed_images,
                image_path=args.image_path
            )
            
            if not args.output:
                print("\n=== MARKDOWN OUTPUT ===")
                print(md_text)
                
        elif args.command == 'batch':
            # Batch conversion
            batch_convert_pdfs(args.input_dir, args.output_dir)
            
        else:
            parser.print_help()
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(asyncio.run(main()))
