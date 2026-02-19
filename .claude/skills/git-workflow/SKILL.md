---
name: git-workflow
description: "Use when creating branches, writing commit messages, opening pull requests, or following the project's git conventions. Covers branch strategy, conventional commits, and PR templates."
---

# Git Workflow

## Branch Strategy

- `main` — production, always deployable
- `develop` — integration branch (optional, depends on team)
- `feat/<ticket>-<short-desc>` — feature branches
- `fix/<ticket>-<short-desc>` — bug fixes
- `chore/<desc>` — maintenance, deps, tooling

## Conventional Commits

Format: `<type>(<scope>): <description>`

Types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance (deps, tooling, config)
- `docs` — documentation only
- `refactor` — code change that neither fixes nor adds
- `test` — adding/updating tests
- `perf` — performance improvement

Examples:
- `feat(auth): add OAuth2 login flow`
- `fix(api): handle null response from user service`
- `chore(deps): update vitest to v2.1`

## Pull Request Template

```markdown
## What

<!-- One-sentence summary of the change -->

## Why

<!-- Context: what problem does this solve? -->

## How

<!-- Brief description of the approach -->

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing done (describe steps)

## Checklist

- [ ] No `any` types introduced
- [ ] Conventional commit message
- [ ] No console.log left in
- [ ] Sensitive data not exposed
```

## Rules

- Never force-push to `main` or `develop`
- Squash merge feature branches
- Delete branches after merge
- Keep PRs focused — one concern per PR
