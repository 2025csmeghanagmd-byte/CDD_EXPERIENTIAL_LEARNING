# CareerBridge team workflow

## Branches
- `main`: stable, reviewed release branch
- `integration`: shared development integration branch
- `feature/core-platform`
- `feature/internship`
- `feature/placement`
- `feature/skill-gap`
- `feature/skill-exchange`

## Daily workflow
1. Start from the latest `integration`.
2. Update your own feature branch with the latest integration changes.
3. Work only in your assigned module folders where possible.
4. Commit small, meaningful changes.
5. Push your feature branch.
6. Open a Pull Request targeting `integration`.
7. Ensure frontend build/backend tests pass and request review.
8. Resolve conflicts with the relevant file owner; never blindly accept one side.
9. Keep `integration` runnable.

## Ownership
- Core owner coordinates shared app setup, routing, configuration, auth and Blueprint registration.
- Each module owner controls their module folder and tests.
- Database schema, API contracts, dependency files, Docker and CI changes require team review.

## Avoiding conflicts
- Do not have multiple people edit the same shared file at once.
- Do not create duplicate API clients, database connections or user tables.
- Communicate before changing shared interfaces.
- Pull integration changes frequently.
- Never commit `.env`, credentials, `node_modules` or virtual environments.
