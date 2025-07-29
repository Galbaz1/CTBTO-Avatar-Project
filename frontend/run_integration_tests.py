#!/usr/bin/env python3
"""
🧪 UIDeltaHandler Integration Test Runner
Orchestrates both backend and frontend integration tests
"""

import asyncio
import subprocess
import sys
import time
import json
from pathlib import Path

def check_backend_running():
    """Check if the backend is running"""
    # Try both localhost and 127.0.0.1 since they can behave differently
    urls_to_try = [
        "http://localhost:8000/",
        "http://127.0.0.1:8000/"
    ]
    
    try:
        import requests
        for url in urls_to_try:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code in [200, 404]:  # 404 is OK, means server is running
                    print(f"   ✅ Backend found at {url}")
                    return True
            except requests.exceptions.ConnectionError:
                continue
        return False
    except ImportError:
        print("   ⚠️ requests library not available")
        return False

def check_frontend_running():
    """Check if the frontend is running"""
    try:
        import requests
        response = requests.get("http://localhost:5173/", timeout=5)
        return response.status_code == 200
    except:
        return False

async def run_backend_tests():
    """Run the backend delta integration tests"""
    print("🚀 Running backend integration tests...")
    
    try:
        # Run the existing delta pipeline test
        result = subprocess.run([
            sys.executable, "test_delta_pipeline.py"
        ], capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print("✅ Backend delta tests passed")
            return True
        else:
            print("❌ Backend delta tests failed")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Failed to run backend tests: {e}")
        return False

async def run_frontend_tests():
    """Run the frontend integration tests"""
    print("🚀 Running frontend UIDeltaHandler tests...")
    
    try:
        # Run our new UIDeltaHandler integration test
        result = subprocess.run([
            sys.executable, "test_uidelta_integration.py"
        ], capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print("✅ Frontend integration tests passed")
            return True
        else:
            print("❌ Frontend integration tests failed")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Failed to run frontend tests: {e}")
        return False

def generate_test_report(backend_result, frontend_result):
    """Generate a test report"""
    report = {
        "timestamp": time.time(),
        "backend_tests": {
            "status": "passed" if backend_result else "failed",
            "description": "Backend delta pipeline validation"
        },
        "frontend_tests": {
            "status": "passed" if frontend_result else "failed", 
            "description": "UIDeltaHandler integration validation"
        },
        "overall_status": "passed" if (backend_result and frontend_result) else "failed"
    }
    
    # Save report to file
    with open("integration_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    return report

async def main():
    """Main test orchestrator"""
    print("🧪 UIDeltaHandler Integration Test Suite")
    print("=" * 50)
    
    # Check prerequisites
    print("🔍 Checking prerequisites...")
    
    backend_running = check_backend_running()
    frontend_running = check_frontend_running()
    
    print(f"   Backend (localhost:8000): {'✅' if backend_running else '❌'}")
    print(f"   Frontend (localhost:5173): {'✅' if frontend_running else '⚠️ (optional)'}")
    
    if not backend_running:
        print("\n❌ Backend is not running. Please start the backend first:")
        print("   cd Rosa_custom_backend")
        print("   source venv/bin/activate") 
        print("   uvicorn backend.rosa_pattern1_api:app --reload")
        sys.exit(1)
    
    print("\n🚀 Starting integration tests...")
    
    # Run tests
    backend_result = await run_backend_tests()
    await asyncio.sleep(1)  # Brief pause between test suites
    
    frontend_result = await run_frontend_tests()
    
    # Generate report
    report = generate_test_report(backend_result, frontend_result)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 INTEGRATION TEST SUMMARY")
    print("=" * 50)
    
    print(f"Backend Tests: {'✅ PASSED' if backend_result else '❌ FAILED'}")
    print(f"Frontend Tests: {'✅ PASSED' if frontend_result else '❌ FAILED'}")
    print(f"Overall Status: {'✅ ALL TESTS PASSED' if report['overall_status'] == 'passed' else '❌ SOME TESTS FAILED'}")
    
    if report['overall_status'] == 'passed':
        print("\n🎉 UIDeltaHandler integration is working correctly!")
        print("   ✅ Backend delta system operational")
        print("   ✅ Frontend handler integration functional")
        print("   ✅ End-to-end pipeline validated")
    else:
        print("\n🔧 Issues detected in integration:")
        if not backend_result:
            print("   ❌ Backend delta system needs attention")
        if not frontend_result:
            print("   ❌ Frontend handler integration needs fixes")
    
    print(f"\n📄 Detailed report saved to: integration_test_report.json")
    
    # Exit with appropriate code
    sys.exit(0 if report['overall_status'] == 'passed' else 1)

if __name__ == "__main__":
    asyncio.run(main()) 