Full shipping workflow:

1. Spawn Task to run `pnpm test` — if fails, fix and re-test
2. Spawn Task to review changes — if critical issues found, fix first
3. If all green: stage, commit with conventional message, push
4. Report: what was committed, test results, review summary

If $ARGUMENTS is provided, use it as the commit message scope/description.
Otherwise, generate a conventional commit message from the changes.
