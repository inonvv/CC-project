Run tests for the relevant package(s). Spawn a Task to execute tests
in an isolated context. Return ONLY:

- Pass/fail with count
- For failures: file, test name, error (max 2 lines each)

Keep total output under 20 lines. Never include passing test output.

If $ARGUMENTS is provided, test that specific package.
Otherwise, detect the relevant package from recent file changes.
