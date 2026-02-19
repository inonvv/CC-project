Run a dry-run validation of all pre-commit checks without actually committing.
Execute in order and stop on first failure:

1. `pnpm typecheck` — report any type errors
2. `pnpm lint` — report any lint issues
3. Detect affected packages from staged/changed files
4. `pnpm test --filter=@myproduct/<pkg>` for each affected package

Report results as a summary: which checks passed, which failed, and details for failures.
This mirrors what the git pre-commit hook would do.
