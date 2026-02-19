#!/usr/bin/env bash
set -euo pipefail
JQ="C:/Users/inon/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
file_path=$($JQ -r '.tool_input.file_path // .tool_input.filePath // ""')

# Block sensitive file edits
if echo "$file_path" | grep -Eiq '\.(env|pem|key)$|secrets|credentials|pnpm-lock\.yaml|package-lock\.json|\.git/'; then
  echo "Blocked: Cannot edit '$file_path'. Edit sensitive files manually." >&2
  exit 2
fi
exit 0
