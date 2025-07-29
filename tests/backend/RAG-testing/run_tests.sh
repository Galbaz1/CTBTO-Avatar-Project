#!/bin/bash
# RAG Test Suite Shell Runner
# Simple wrapper for Unix/Linux/Mac systems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 RAG Test Suite Shell Runner${NC}"
echo "=============================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if we're in the right directory
if [[ ! -f "run_tests.py" ]]; then
    echo -e "${RED}❌ Please run this script from the RAG-testing directory${NC}"
    exit 1
fi

# Parse command line arguments
case "${1:-full}" in
    "quick")
        echo -e "${YELLOW}🔍 Running quick connectivity test...${NC}"
        python3 run_tests.py --quick
        ;;
    "check")
        echo -e "${YELLOW}🔧 Checking environment and dependencies...${NC}"
        python3 run_tests.py --check
        ;;
    "config")
        echo -e "${YELLOW}📋 Showing current configuration...${NC}"
        python3 run_tests.py --config
        ;;
    "full"|"")
        echo -e "${YELLOW}🧪 Running full test suite...${NC}"
        python3 run_tests.py
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [quick|check|config|full|help]"
        echo ""
        echo "Commands:"
        echo "  quick   - Run quick connectivity test"
        echo "  check   - Check environment and dependencies"
        echo "  config  - Show current configuration"
        echo "  full    - Run complete test suite (default)"
        echo "  help    - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh quick      # Quick test"
        echo "  ./run_tests.sh            # Full test suite"
        echo "  ./run_tests.sh check      # Environment check"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

exit_code=$?

if [[ $exit_code -eq 0 ]]; then
    echo -e "${GREEN}✅ Test execution completed successfully!${NC}"
else
    echo -e "${RED}❌ Test execution failed with exit code: $exit_code${NC}"
fi

exit $exit_code 