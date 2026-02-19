---
name: security
description: "Use when reviewing code for security vulnerabilities, before deployment, or when working on auth, input validation, data handling, or API endpoints. Covers OWASP Top 10, dependency auditing, and secure coding patterns."
---

# Security Checklist

## Quick Scan Commands

- `pnpm audit` — dependency vulnerabilities
- `grep -rn "eval\|exec\|innerHTML\|dangerouslySetInnerHTML" packages/`
- `grep -rn "password\|secret\|token\|api.key" packages/ --include='*.ts'`
- Check `.gitignore` includes: `.env*`, `*.pem`, `*.key`, `credentials/`

## OWASP Top 10 Checklist

1. **Injection**: parameterized queries, no string concat in SQL/commands
2. **Broken Auth**: secure session management, rate limiting on login
3. **Sensitive Data**: encrypt at rest, TLS in transit, no PII in logs
4. **XXE**: disable external entity processing
5. **Broken Access**: check auth on every endpoint, not just UI
6. **Misconfig**: no default credentials, security headers set
7. **XSS**: escape output, Content-Security-Policy, no `innerHTML`
8. **Insecure Deserialization**: validate/schema-check all input
9. **Known Vulns**: `pnpm audit`, keep deps updated
10. **Insufficient Logging**: log auth events, don't log secrets

## Secure Patterns

- Validate all input at system boundaries (Zod schemas recommended)
- Use `crypto.timingSafeEqual` for secret comparisons
- Set security headers: `helmet()` in Express, CSP in frontend
- Never log tokens, passwords, or PII
- Use environment variables for secrets, never hardcode
