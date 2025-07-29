#!/usr/bin/env python3
"""
RAG Test Suite Runner - Simple execution script with options
Provides easy command-line interface for running RAG tests
"""

import os
import sys
import argparse
import json
from datetime import datetime

def check_environment():
    """Check if environment is properly configured"""
    required_vars = ["WEAVIATE_URL", "WEAVIATE_API_KEY", "OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables before running tests.")
        return False
    
    print("✅ Environment variables configured")
    return True

def check_dependencies():
    """Check if required dependencies are available"""
    try:
        # Test imports
        import weaviate
        import openai
        from dotenv import load_dotenv
        print("✅ Dependencies available")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install required packages:")
        print("pip install weaviate-client openai python-dotenv")
        return False

def load_config():
    """Load test configuration"""
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        print("✅ Configuration loaded")
        return config
    except FileNotFoundError:
        print("⚠️  Configuration file not found, using defaults")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid configuration file: {e}")
        return None

def run_quick_test():
    """Run a quick smoke test"""
    print("🚀 Running Quick Test (minimal query set)")
    print("=" * 50)
    
    try:
        # Import and run minimal test
        from backend.weaviate_knowledge_search import VectorSearchTool, SearchQuery
        
        search_tool = VectorSearchTool()
        
        # Test basic connectivity
        print("Testing basic search functionality...")
        
        test_query = SearchQuery(
            query_text="quantum sensing",
            search_type="hybrid",
            collection="SnT25_GlossaryTerm",
            limit=3
        )
        
        results = search_tool.search(test_query)
        
        if isinstance(results, dict):
            actual_results = results.get("search_results", [])
        else:
            actual_results = results
        
        print(f"✅ Quick test successful: {len(actual_results)} results found")
        print("Ready to run full test suite!")
        return True
        
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        print("Please check your Weaviate connection and configuration")
        return False

def run_full_tests():
    """Run the complete test suite"""
    print("🧪 Running Full RAG Test Suite")
    print("=" * 50)
    
    try:
        # Import and run full test suite
        from rag_test_suite import RAGTestSuite
        
        test_suite = RAGTestSuite()
        test_suite.run_comprehensive_tests()
        
        return True
        
    except Exception as e:
        print(f"❌ Test suite failed: {e}")
        return False

def main():
    """Main runner function with command line interface"""
    parser = argparse.ArgumentParser(
        description="RAG Test Suite Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py                    # Run full test suite
  python run_tests.py --quick           # Run quick connectivity test
  python run_tests.py --check           # Check environment only
  python run_tests.py --config          # Show current configuration
        """
    )
    
    parser.add_argument(
        "--quick", 
        action="store_true",
        help="Run quick connectivity test only"
    )
    
    parser.add_argument(
        "--check",
        action="store_true", 
        help="Check environment and dependencies only"
    )
    
    parser.add_argument(
        "--config",
        action="store_true",
        help="Show current configuration"
    )
    
    parser.add_argument(
        "--skip-env-check",
        action="store_true",
        help="Skip environment variable validation"
    )
    
    args = parser.parse_args()
    
    print("🚀 RAG Test Suite Runner")
    print(f"📅 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Check environment unless skipped
    if not args.skip_env_check:
        if not check_environment():
            return 1
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Load configuration
    config = load_config()
    
    # Handle different execution modes
    if args.config:
        print("\n📋 Current Configuration:")
        if config:
            print(json.dumps(config, indent=2))
        else:
            print("No configuration loaded (using defaults)")
        return 0
    
    if args.check:
        print("\n✅ Environment check complete!")
        print("All systems ready for testing.")
        return 0
    
    if args.quick:
        success = run_quick_test()
        return 0 if success else 1
    
    # Run full test suite (default)
    print(f"\n📁 Results will be saved to: {os.path.join(os.getcwd(), 'RAG-testing')}")
    print("🔄 Starting comprehensive test execution...\n")
    
    success = run_full_tests()
    
    if success:
        print("\n🎉 Test suite completed successfully!")
        print("📊 Check the RAG-testing folder for detailed results")
        return 0
    else:
        print("\n❌ Test suite failed!")
        return 1

if __name__ == "__main__":
    exit(main()) 