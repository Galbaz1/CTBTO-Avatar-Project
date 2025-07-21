"""
CTBTO Document Loading Tool
==========================

Loads specific CTBTO documentation files for the knowledge agent.
Provides access to comprehensive CTBTO information including:
- Organization overview and history
- Verification system technologies  
- Conference information
- Current news and developments
"""

import os
import sys
from typing import Dict, List, Optional
from pydantic import BaseModel
from agents import function_tool

# Add project root to path for imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from logging_config import get_logger
    logger = get_logger(__name__)
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

class DocumentContent(BaseModel):
    filename: str
    title: str
    content: str
    size_kb: float

# Available CTBTO documents
AVAILABLE_DOCUMENTS = {
    "research_summary": {
        "filename": "00_Research_Summary_Index.md",
        "title": "CTBTO Research Knowledge Base - Comprehensive Summary and Index",
        "description": "Overview of all CTBTO research documents with summaries and key facts"
    },
    "overview_history": {
        "filename": "01_CTBTO_Overview_History.md", 
        "title": "CTBTO Overview, History, and Mission",
        "description": "Historical background, organizational structure, mission, treaty status, and achievements"
    },
    "verification_technologies": {
        "filename": "02_Verification_System_Technologies.md",
        "title": "Verification System and Technologies", 
        "description": "International Monitoring System, detection technologies, data processing, and capabilities"
    },
    "conference_info": {
        "filename": "03_Science_Technology_Conference_SnT2025.md",
        "title": "Science and Technology Conferences",
        "description": "SnT conference series history, SnT2025 details, themes, and conference structure"
    },
    "current_news": {
        "filename": "04_Current_News_Developments_2024-2025.md", 
        "title": "Current News and Developments",
        "description": "Recent events, scientific breakthroughs, organizational developments, and achievements"
    }
}

def _get_document_path(filename: str) -> str:
    """Get the full path to a CTBTO document."""
    return os.path.join(project_root, "data", "CTBTO", filename)

def _load_document_content(filename: str) -> str:
    """Load the content of a CTBTO document."""
    document_path = _get_document_path(filename)
    
    if not os.path.exists(document_path):
        raise FileNotFoundError(f"Document not found: {filename}")
    
    try:
        with open(document_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Get file size in KB
        size_bytes = os.path.getsize(document_path)
        size_kb = size_bytes / 1024
        
        logger.info(f"Loaded CTBTO document: {filename} ({size_kb:.1f} KB)")
        return content
        
    except Exception as e:
        logger.error(f"Error loading document {filename}: {e}")
        raise

@function_tool
def load_ctbto_document(document_key: str) -> str:
    """
    Load a specific CTBTO document for analysis.
    
    Args:
        document_key: The key identifying which document to load. Available options:
                     - "research_summary": Overview and index of all documents
                     - "overview_history": CTBTO history, mission, and organizational structure
                     - "verification_technologies": Monitoring systems and detection technologies
                     - "conference_info": SnT conference series and SnT2025 details  
                     - "current_news": Recent developments and achievements
    
    Returns:
        The full content of the requested document
    """
    if document_key not in AVAILABLE_DOCUMENTS:
        available_keys = list(AVAILABLE_DOCUMENTS.keys())
        return f"Invalid document key '{document_key}'. Available documents: {', '.join(available_keys)}"
    
    try:
        doc_info = AVAILABLE_DOCUMENTS[document_key]
        filename = doc_info["filename"]
        title = doc_info["title"]
        
        content = _load_document_content(filename)
        
        return f"""# {title}
**Source:** {filename}
**Description:** {doc_info["description"]}

---

{content}
"""
        
    except Exception as e:
        logger.error(f"Error in load_ctbto_document for {document_key}: {e}")
        return f"Sorry, I couldn't load the document '{document_key}' at this time. Error: {str(e)}"

@function_tool 
def list_available_documents() -> str:
    """
    List all available CTBTO documents that can be loaded.
    
    Returns:
        A formatted list of available documents with descriptions
    """
    doc_list = []
    doc_list.append("# Available CTBTO Documents\n")
    
    for key, info in AVAILABLE_DOCUMENTS.items():
        doc_list.append(f"**{key}**")
        doc_list.append(f"- Title: {info['title']}")
        doc_list.append(f"- File: {info['filename']}")
        doc_list.append(f"- Description: {info['description']}\n")
    
    return "\n".join(doc_list)

# Export tools for use in agents
__all__ = ['load_ctbto_document', 'list_available_documents', 'AVAILABLE_DOCUMENTS'] 