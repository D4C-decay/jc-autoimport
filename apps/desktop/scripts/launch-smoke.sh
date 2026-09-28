#!/usr/bin/env bash
# Launches the Electron app fully detached for smoke testing.
# GPU is disabled because CI/headless X sessions have no usable GPU process.
set -u
cd "$(dirname "$0")/.."
LOG=${LOG:-/tmp/opencode/electron.log}
mkdir -p "$(dirname "$LOG")"
setsid nohup ./node_modules/electron/dist/electron dist/main/main.js \
  --no-sandbox \
  --disable-gpu \
  --disable-gpu-compositing \
  --remote-debugging-port=9222 \
  >"$LOG" 2>&1 </dev/null &
disown
echo "launched pid=$! log=$LOG"
