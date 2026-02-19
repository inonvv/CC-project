#!/usr/bin/env bash
set -euo pipefail
JQ="C:/Users/inon/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
file_path=$($JQ -r '.tool_input.file_path // .tool_input.filePath // ""')

# Only format JS/TS files
if echo "$file_path" | grep -Eq '\.(ts|tsx|js|jsx)$'; then
  npx prettier --write "$file_path" 2>/dev/null || true
fi
exit 0
