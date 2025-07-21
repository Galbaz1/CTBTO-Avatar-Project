#!/usr/bin/env python3
"""
Rosa Pattern 1 Starter
Simple Python executable to start the Rosa backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🚀 Rosa Pattern 1 Startup")
    print("=" * 40)
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    backend_dir = script_dir / "backend"
    venv_dir = backend_dir / "venv"
    api_file = backend_dir / "rosa_pattern1_api.py"
    env_file = script_dir / ".env.local"
    
    # Check if we're in the right place
    if not api_file.exists():
        print(f"❌ Error: {api_file} not found")
        print(f"   Make sure you're running this from: {script_dir}")
        sys.exit(1)
    
    # Check virtual environment
    if not venv_dir.exists():
        print(f"❌ Error: Virtual environment not found at {venv_dir}")
        print("   Please create it first:")
        print(f"   cd {backend_dir} && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt")
        sys.exit(1)
    
    # Check .env.local
    if not env_file.exists():
        print(f"⚠️  Warning: {env_file} not found")
        print("   Make sure OPENAI_API_KEY and ROSA_API_KEY are set")
    
    print(f"📁 Backend directory: {backend_dir}")
    print(f"🐍 Virtual environment: {venv_dir}")
    print(f"🧠 API file: {api_file}")
    print()
    
    # Determine the activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = venv_dir / "Scripts" / "activate.bat"
        python_executable = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/macOS
        activate_script = venv_dir / "bin" / "activate"
        python_executable = venv_dir / "bin" / "python"
    
    if not python_executable.exists():
        print(f"❌ Error: Python executable not found at {python_executable}")
        sys.exit(1)
    
    # Check if port 8000 is already in use
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    port_in_use = sock.connect_ex(('localhost', 8000)) == 0
    sock.close()
    
    if port_in_use:
        print("⚠️  Port 8000 is already in use!")
        print("   Stop existing Rosa backend with: pkill -f rosa_pattern1_api.py")
        print("   Or use a different port in the backend code")
        sys.exit(1)
    
    print(f"✅ Starting Rosa Pattern 1 Backend...")
    print(f"📡 Will run on: http://localhost:8000")
    print(f"🔐 API Key: From ROSA_API_KEY in .env.local")
    print(f"📊 Model: rosa-ctbto-agent")
    print()
    print("🛑 Press Ctrl+C to stop")
    print("-" * 40)
    
    try:
        # Change to backend directory and run the API
        os.chdir(backend_dir)
        subprocess.run([str(python_executable), "rosa_pattern1_api.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Rosa Pattern 1 stopped")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running Rosa Pattern 1: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 