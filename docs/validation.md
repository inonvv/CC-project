# Validation Enforcement

User cannot proceed if:
- Start date missing
- Any city duration missing
- Duration invalid (0, negative, decimal, empty)
- Flight not selected for any segment
- Hotel missing for any city
- Attraction missing for any city

## Step Navigation
- Allow backward navigation
- Prevent forward navigation if invalid
- Revalidate after any state change
