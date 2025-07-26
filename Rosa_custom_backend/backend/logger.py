#!/usr/bin/env python3
"""
ROSA Backend Logging System
Structured logging with session tracking and LLM instance naming
"""

import os
import time
import json
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class LogLevel(Enum):
    DEBUG = "debug"
    INFO = "info" 
    WARN = "warn"
    ERROR = "error"

class LLMInstance(Enum):
    MAIN_ROSA = "MAIN_ROSA"
    UI_INTEL = "UI_INTEL"
    WARMUP = "WARMUP"

# ANSI Color codes for different agents
class Colors:
    # Agent colors
    MAIN_ROSA = "\033[94m"      # Blue - Main conversation agent
    UI_INTEL = "\033[95m"       # Magenta - UI Intelligence agent  
    WARMUP = "\033[93m"         # Yellow - Warmup calls
    
    # Log level colors
    DEBUG = "\033[90m"          # Dark gray
    INFO = "\033[97m"           # White
    WARN = "\033[93m"           # Yellow
    ERROR = "\033[91m"          # Red
    
    # Special colors
    SESSION = "\033[92m"        # Green - Session info
    PERFORMANCE = "\033[96m"    # Cyan - Performance metrics
    
    # Reset
    RESET = "\033[0m"           # Reset to default
    BOLD = "\033[1m"            # Bold text

class ROSABackendLogger:
    """Structured backend logger for ROSA system"""
    
    def __init__(self):
        # Configuration from environment
        self.log_level = LogLevel(os.getenv("ROSA_LOG_LEVEL", "info"))
        self.session_only = os.getenv("ROSA_LOG_SESSION_ONLY", "true").lower() == "true"  # Default to session-only
        self.show_timing = os.getenv("ROSA_LOG_TIMING", "true").lower() == "true"
        self.use_colors = os.getenv("NO_COLOR", "").lower() != "true"  # Respect NO_COLOR standard
        
        # Level hierarchy for filtering
        self.level_hierarchy = {
            LogLevel.DEBUG: 0,
            LogLevel.INFO: 1,
            LogLevel.WARN: 2,
            LogLevel.ERROR: 3
        }
        
        # Emoji mapping
        self.emojis = {
            LogLevel.DEBUG: "🔍",
            LogLevel.INFO: "ℹ️",
            LogLevel.WARN: "⚠️",
            LogLevel.ERROR: "❌"
        }
        
        # Performance tracking
        self.timers: Dict[str, float] = {}
        
    def _should_log(self, level: LogLevel) -> bool:
        """Check if message should be logged based on level"""
        return self.level_hierarchy[level] >= self.level_hierarchy[self.log_level]
    
    def _format_session_id(self, session_id: Optional[str]) -> str:
        """Format session ID for display"""
        if not session_id:
            return "[no-session]"
        return f"[{session_id}]"
    
    def _format_instance(self, instance: Optional[LLMInstance]) -> str:
        """Format LLM instance name"""
        if not instance:
            return ""
        return f"[{instance.value}]"
    
    def _log(self, level: LogLevel, message: str, session_id: Optional[str] = None, 
             instance: Optional[LLMInstance] = None, data: Optional[Dict] = None):
        """Core logging function with color coding"""
        if not self._should_log(level):
            return
            
        # Skip non-session logs if session_only is True
        if self.session_only and not session_id:
            return
            
        timestamp = datetime.now().strftime("%H:%M:%S")
        emoji = self.emojis[level]
        session_str = self._format_session_id(session_id)
        instance_str = self._format_instance(instance)
        
        # Apply colors if enabled
        if self.use_colors:
            # Choose colors based on instance and level
            agent_color = Colors.RESET
            if instance == LLMInstance.MAIN_ROSA:
                agent_color = Colors.MAIN_ROSA
            elif instance == LLMInstance.UI_INTEL:
                agent_color = Colors.UI_INTEL
            elif instance == LLMInstance.WARMUP:
                agent_color = Colors.WARMUP
            
            level_color = {
                LogLevel.DEBUG: Colors.DEBUG,
                LogLevel.INFO: Colors.INFO, 
                LogLevel.WARN: Colors.WARN,
                LogLevel.ERROR: Colors.ERROR
            }.get(level, Colors.INFO)
            
            # Special color for session info
            session_color = Colors.SESSION if session_id else Colors.DEBUG
            
            # Build colorized log line
            parts = [
                f"{Colors.BOLD}🤖 ROSA{Colors.RESET}",
                f"{session_color}{session_str}{Colors.RESET}",
                f"{agent_color}{instance_str}{Colors.RESET}" if instance_str else "",
                f"{level_color}{emoji} {message}{Colors.RESET}"
            ]
        else:
            # Build plain log line without colors
            parts = [
                "🤖 ROSA",
                session_str,
                instance_str if instance_str else "",
                f"{emoji} {message}"
            ]
        log_line = " ".join(part for part in parts if part)
        
        print(log_line)
        
        # Print data if provided (for debug level only)
        if data and level == LogLevel.DEBUG:
            print(f"    📋 {json.dumps(data, indent=2)}")
    
    # Convenience methods for different log levels
    def debug(self, message: str, session_id: Optional[str] = None, 
              instance: Optional[LLMInstance] = None, data: Optional[Dict] = None):
        self._log(LogLevel.DEBUG, message, session_id, instance, data)
    
    def info(self, message: str, session_id: Optional[str] = None, 
             instance: Optional[LLMInstance] = None, data: Optional[Dict] = None):
        self._log(LogLevel.INFO, message, session_id, instance, data)
    
    def warn(self, message: str, session_id: Optional[str] = None, 
             instance: Optional[LLMInstance] = None, data: Optional[Dict] = None):
        self._log(LogLevel.WARN, message, session_id, instance, data)
    
    def error(self, message: str, session_id: Optional[str] = None, 
              instance: Optional[LLMInstance] = None, data: Optional[Dict] = None):
        self._log(LogLevel.ERROR, message, session_id, instance, data)
    
    # Session lifecycle methods
    def session_start(self, session_id: str):
        """Log session start"""
        self.info(f"🚀 Session started", session_id)
    
    def session_end(self, session_id: str):
        """Log session end"""
        self.info(f"📞 Session ended", session_id)
    
    # LLM-specific methods
    def llm_call_start(self, session_id: str, instance: LLMInstance, model: str = "gpt-4.1"):
        """Log LLM call start and start timer"""
        timer_key = f"{session_id}_{instance.value}"
        self.timers[timer_key] = time.perf_counter()
        self.info(f"⚡ Processing conversation ({model})", session_id, instance)
    
    def llm_call_end(self, session_id: str, instance: LLMInstance):
        """Log LLM call end with timing"""
        timer_key = f"{session_id}_{instance.value}"
        if timer_key in self.timers:
            duration = time.perf_counter() - self.timers[timer_key]
            del self.timers[timer_key]
            if self.show_timing:
                self.info(f"✅ Response complete ({duration:.2f}s)", session_id, instance)
            else:
                self.info(f"✅ Response complete", session_id, instance)
        else:
            self.info(f"✅ Response complete", session_id, instance)
    
    # Function call methods
    def tool_call(self, session_id: str, instance: LLMInstance, tool_name: str, args: Dict):
        """Log tool call with clean args"""
        # Create clean args string
        if tool_name == "get_weather":
            location = args.get("location", "unknown")
            clean_args = f'location="{location}"'
        elif tool_name == "search_conference_knowledge":
            query = args.get("query", "unknown")
            search_type = args.get("search_type", "comprehensive")
            clean_args = f'query="{query}", type="{search_type}"'
        else:
            # Generic fallback
            clean_args = ", ".join([f'{k}="{v}"' for k, v in args.items()])
        
        self.info(f"🔧 Tool call: {tool_name}({clean_args})", session_id, instance)
    
    def tool_success(self, session_id: str, instance: LLMInstance, tool_name: str):
        """Log successful tool execution"""
        self.debug(f"✅ Tool success: {tool_name}", session_id, instance)
    
    def tool_error(self, session_id: str, instance: LLMInstance, tool_name: str, error: str):
        """Log tool execution error"""
        self.error(f"❌ Tool failed: {tool_name} - {error}", session_id, instance)
    
    # Performance tracking
    def performance(self, session_id: str, message: str, duration: float):
        """Log performance metrics with special formatting"""
        if self.show_timing:
            # Use special performance color
            if not self._should_log(LogLevel.INFO):
                return
            if self.session_only and not session_id:
                return
                
            session_str = self._format_session_id(session_id)
            perf_message = f"⏱️ {message}: {duration:.2f}s"
            
            if self.use_colors:
                parts = [
                    f"{Colors.BOLD}🤖 ROSA{Colors.RESET}",
                    f"{Colors.SESSION}{session_str}{Colors.RESET}",
                    f"{Colors.PERFORMANCE}{perf_message}{Colors.RESET}"
                ]
            else:
                parts = [
                    "🤖 ROSA",
                    session_str,
                    perf_message
                ]
            log_line = " ".join(part for part in parts if part)
            print(log_line)
    
    # Card decision logging
    def card_decision(self, session_id: str, show_cards: bool, card_count: int = 0, confidence: float = 0.0):
        """Log UI intelligence card decisions"""
        if show_cards:
            self.info(f"🎴 Card decision: show {card_count} cards (confidence={confidence:.2f})", 
                     session_id, LLMInstance.UI_INTEL)
        else:
            self.debug(f"🚫 Card decision: no cards (confidence={confidence:.2f})", 
                      session_id, LLMInstance.UI_INTEL)
    
    # Warmup logging
    def warmup_start(self):
        """Log warmup start"""
        if not self.session_only:
            self.info("🔥 Warming up backend", instance=LLMInstance.WARMUP)
    
    def warmup_complete(self, duration: float):
        """Log warmup completion"""
        if not self.session_only:
            if self.show_timing:
                self.info(f"✅ Backend warmed up ({duration:.2f}s)", instance=LLMInstance.WARMUP)
            else:
                self.info(f"✅ Backend warmed up", instance=LLMInstance.WARMUP)
    
    def warmup_failed(self, error: str):
        """Log warmup failure"""
        if not self.session_only:
            self.warn(f"⚠️ Warmup failed: {error}", instance=LLMInstance.WARMUP)

# Global logger instance
logger = ROSABackendLogger()

# Convenience functions for common usage
def log_session_start(session_id: str):
    logger.session_start(session_id)

def log_session_end(session_id: str):
    logger.session_end(session_id)

def log_llm_call_start(session_id: str, instance: LLMInstance):
    logger.llm_call_start(session_id, instance)

def log_llm_call_end(session_id: str, instance: LLMInstance):
    logger.llm_call_end(session_id, instance)

def log_tool_call(session_id: str, instance: LLMInstance, tool_name: str, args: Dict):
    logger.tool_call(session_id, instance, tool_name, args)

def log_info(message: str, session_id: Optional[str] = None):
    logger.info(message, session_id)

def log_error(message: str, session_id: Optional[str] = None):
    logger.error(message, session_id) 