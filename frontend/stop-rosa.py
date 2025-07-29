#!/usr/bin/env python3
"""
Rosa Stop Script
Simple utility to stop running Rosa backend instances
"""

import subprocess
import sys
import socket

def check_port_8000():
    """Check if port 8000 is in use"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    port_in_use = sock.connect_ex(('localhost', 8000)) == 0
    sock.close()
    return port_in_use

def main():
    print("🛑 Rosa Backend Stop Script")
    print("=" * 30)
    
    if not check_port_8000():
        print("✅ No Rosa backend running on port 8000")
        return
    
    print("🔍 Found Rosa backend running, stopping...")
    
    try:
        # Kill Rosa backend processes
        result = subprocess.run(['pkill', '-f', 'rosa_pattern1_api.py'], 
                              capture_output=True, text=True)
        
        # Also kill any process using port 8000
        subprocess.run(['bash', '-c', 'lsof -ti:8000 | xargs kill -9 2>/dev/null || true'], 
                      capture_output=True)
        
        # Check if port is now free
        if not check_port_8000():
            print("✅ Rosa backend stopped successfully")
        else:
            print("⚠️  Port 8000 still in use, may need manual cleanup")
            
    except Exception as e:
        print(f"❌ Error stopping Rosa backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 