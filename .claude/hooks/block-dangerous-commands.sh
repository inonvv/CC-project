#!/usr/bin/env bash
set -euo pipefail
JQ="C:/Users/inon/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
cmd=$($JQ -r '.tool_input.command // ""')

# Block destructive commands
if echo "$cmd" | grep -Eiq 'rm\s+-rf\s+/|git\s+reset\s+--hard|git\s+push.*(-f|--force)|git\s+commit.*--no-verify|DROP\s+(TABLE|DATABASE)|chmod\s+777'; then
  echo "Blocked: Dangerous command detected. Use a safer alternative." >&2
  exit 2
fi

# Enforce pnpm in pnpm repos
if [ -f pnpm-lock.yaml ] && echo "$cmd" | grep -Eq '\bnpm\s+(install|run|exec|ci)\b'; then
  echo "This repo uses pnpm. Replace 'npm' with 'pnpm'." >&2
  exit 2
fi
exit 0
