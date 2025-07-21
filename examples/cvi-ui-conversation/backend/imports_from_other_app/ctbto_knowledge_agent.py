"""
CTBTO Knowledge Agent
====================

Specialized agent for providing comprehensive CTBTO information.
Uses document loading tools to access detailed CTBTO documentation
and provide expert knowledge about the organization, technologies, and conference.
"""

import os
import sys
from agents import Agent, RunContextWrapper, ModelSettings
from typing import Optional

# Add parent directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import tools, context, and prompt manager
from ..tools.ctbto_document_tool import load_ctbto_document, list_available_documents
from ..simple_context import CTBTOContext
from ..prompts.prompt_manager import render_ctbto_knowledge_prompt

def get_ctbto_knowledge_instructions(ctx: RunContextWrapper[CTBTOContext], agent: Agent[CTBTOContext]) -> str:
    """
    Dynamic instructions for the CTBTO Knowledge Agent using Jinja2 templates.
    
    Args:
        ctx: RunContextWrapper containing CTBTOContext  
        agent: The agent instance (not used but required by Agent SDK)
        
    Returns:
        Instructions string rendered from template
    """
    # Could include additional context from the CTBTOContext if needed
    additional_context = None
    
    # Render the prompt template
    return render_ctbto_knowledge_prompt(additional_context)

# Create the CTBTO knowledge agent with parallel tool calls enabled
ctbto_knowledge_agent = Agent[CTBTOContext](
    name="CTBTO Knowledge Specialist",
    instructions=get_ctbto_knowledge_instructions,
    tools=[load_ctbto_document, list_available_documents],
    model_settings=ModelSettings(
        parallel_tool_calls=True,  # Enable parallel document loading
        temperature=0              # Deterministic responses for factual information
    )
)

def as_tool(tool_name: str = "get_ctbto_knowledge", 
            tool_description: str = "Get comprehensive information about CTBTO organization, technologies, or conference details"):
    """Convert the CTBTO knowledge agent to a tool for use by orchestrator."""
    return ctbto_knowledge_agent.as_tool(
        tool_name=tool_name,
        tool_description=tool_description
    )

# Export for use in orchestrator
__all__ = ['ctbto_knowledge_agent', 'as_tool'] 