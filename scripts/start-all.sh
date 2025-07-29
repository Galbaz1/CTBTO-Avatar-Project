#!/usr/bin/env bash
# Unified dev launcher for Rosa kiosk platform
# Starts: FastAPI backend (uvicorn), Vite frontend dev server, optional ngrok tunnel
set -euo pipefail

# Set PYTHONPATH to repo root for clean imports
export PYTHONPATH="${PYTHONPATH:-}:$(pwd)"

# -------- CONFIG --------
BACKEND_PORT=8000
FRONTEND_PORT=5173
NGROK_PORT=4040 # API port (ngrok itself chooses random web tunnel)

# -------- UTILITIES --------
port_in_use() {
  lsof -i :"$1" &>/dev/null
}

fail_if_port_busy() {
  if port_in_use "$1"; then
    echo "❌ Port $1 is already in use. Please free it or change the port in this script." >&2
    exit 1
  fi
}

# -------- PORT CHECKS --------
fail_if_port_busy "$BACKEND_PORT"
fail_if_port_busy "$FRONTEND_PORT"
fail_if_port_busy "$NGROK_PORT" || true # ngrok API port is optional

# -------- START SERVICES --------

# 1) Backend (FastAPI)
uvicorn backend.rosa_api_server:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload &
BACK_PID=$!
echo "🚀 Backend running on http://localhost:$BACKEND_PORT  (PID $BACK_PID)"

# 2) Frontend (Vite + Bun)
(cd frontend && bun run dev --port "$FRONTEND_PORT") &
FRONT_PID=$!
echo "🎨 Frontend running on http://localhost:$FRONTEND_PORT  (PID $FRONT_PID)"

# 3) Ngrok (optional)
if command -v ngrok >/dev/null 2>&1; then
  ngrok http "$FRONTEND_PORT" --log=stdout > /tmp/ngrok.log 2>&1 &
  NGROK_PID=$!
  echo "🌐 Ngrok tunnel starting (PID $NGROK_PID). Logs in /tmp/ngrok.log"
else
  echo "ℹ️  Ngrok not found; skipping tunnel startup."
  NGROK_PID=""
fi

# -------- TEARDOWN HANDLING --------
trap "echo '🛑 Stopping services...' && kill $BACK_PID $FRONT_PID ${NGROK_PID:-} 2>/dev/null" INT TERM

# Wait on background jobs
wait 