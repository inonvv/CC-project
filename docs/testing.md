# Testing Requirements

## Backend (Pytest)
- Test route length
- Test 3 flight options per segment
- Test return home exists

## Frontend (Vitest)

### 1. City selection logic
- Add city
- Remove city
- Ensure dependent state is cleared

### 2. Schedule validation
- Missing start date blocks
- Invalid days block

### 3. Step navigation
- Cannot continue if invalid
- Removing city clears state

## E2E (Playwright)
- Full happy path
- Validation blocking test
- Remove destination mid-flow test
