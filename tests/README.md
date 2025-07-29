# Unified Test Directory

All project test scripts (frontend and backend) are organized under this directory.

## Structure

### `tests/frontend/` – Frontend Test Files
- `test_complete_flow.py` - Complete integration test flow
- `test_conference_functions.py` - Conference-specific functionality tests  
- `test_delta_pipeline.py` - UI delta pipeline testing
- `test_uidelta_integration.py` - UI delta integration tests
- `test_card_generation_timing.py` - Card generation performance tests
- `test_simple_ui_flow.js` - Simple UI flow tests (JavaScript)
- `UIDeltaHandlerTest.tsx` - React component test for UI delta handler
- `run_integration_tests.py` - Integration test runner
- `integration_test_report.json` - Test results/reports

### `tests/backend/` – Backend Test Files  
- `RAG-testing/` - Complete RAG system test suite including:
  - `rag_test_suite.py` - Main RAG testing framework
  - `run_tests.py` - Test runner script
  - Configuration and result files

## Usage

Add new test files to the appropriate sub-directory. Keep filenames descriptive and end with `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.py`, etc. as appropriate.

## Running Tests

```bash
# Run RAG tests
cd tests/backend/RAG-testing && python rag_test_suite.py

# Run integration tests  
python tests/frontend/test_complete_flow.py
``` 