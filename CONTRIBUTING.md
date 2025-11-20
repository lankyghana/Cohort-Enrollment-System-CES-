## Contributing to Cohort Enrollment Platform

Thank you for your interest in contributing. This project follows open-source best practices and aims to keep the contribution process simple and predictable.

Please read these guidelines before submitting work.

### Code of conduct

Be respectful and professional. Treat contributors and maintainers with courtesy. If you need a formal code of conduct, please open an issue to suggest one.

### License

Contributions are accepted under the project's existing license (MIT). By submitting a pull request, you agree to license your contribution under the MIT License and confirm that you have the right to submit the code.

### How to contribute

1. Fork the repository and create a descriptive branch from `main`:

```bash
git checkout -b feat/my-feature
```

2. Make small, focused changes with clear commit messages (see commit conventions below).
3. Run tests and linters locally. Ensure `npm run build` succeeds.
4. Open a pull request against `main` with a clear description and testing notes.

### Branching & workflow

- Work off `main` and open feature branches named `feat/`, `fix/`, `chore/`, or `docs/`.
- Rebase or merge `main` before opening a PR to keep changes small and reviewable.
- PRs should include screenshots or steps to reproduce for UI changes.

### Commit message conventions

Use Conventional Commits style. Examples:

- `feat: add course search filter`
- `fix: correct price parsing in course details`
- `docs: clarify setup steps in README`
- `chore: bump deps`

Keep messages short (max 72 characters for subject) and include a body when necessary.

### Code style

- TypeScript for application code; follow existing typing patterns.
- Use Tailwind for styling; prefer utility classes and component-driven UI.
- Run ESLint and Prettier before committing.

### Tests

- Add unit tests for new logic where appropriate. Use `vitest` for test runners.
- Run `npm test` (or `npm run test:watch`) locally.

### Reporting issues

- Use GitHub Issues for bugs and feature requests. Provide a clear title, steps to reproduce, expected vs actual behavior, and any logs or screenshots.

### Security

- If you find a security issue, please report it privately to the maintainers instead of opening a public issue.

Thanks for helping improve the project — we appreciate your contributions!
