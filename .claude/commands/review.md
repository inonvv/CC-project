Review recent code changes for quality issues. Spawn a Task to:

1. Get changed files: `git diff --name-only HEAD~1`
2. Read each file and check against the code-quality skill
3. Report max 5 findings, sorted by severity

Format: [CRITICAL/HIGH/MEDIUM/LOW] [file:line] — issue + suggested fix

If $ARGUMENTS is provided, review those specific files instead.
