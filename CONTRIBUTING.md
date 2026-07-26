# Contributing

## Starting work

Update `develop`, then create a focused branch:

```bash
git switch develop
git pull --ff-only
git switch -c feature/interview-session
```

Use `fix/<short-name>` for fixes and `feature/<short-name>` for features.

## Merging work

1. Open a pull request from the feature or fix branch into `develop`.
2. Run the required lint, type-check, and test checks.
3. Merge only after review and successful checks.
4. Delete the merged feature or fix branch.
5. When `develop` is ready for release, open a pull request into `main`.

Do not merge normal feature or fix branches directly into `main`.

## Commit messages

Use concise conventional commit messages:

```text
feat: add interview session screen
fix: handle missing microphone permission
docs: document local setup
test: cover interview scoring
chore: update dependencies
```

## Branch protection

When a remote repository is connected, protect both `main` and `develop`:

- Require pull requests before merging.
- Require successful automated checks.
- Block force pushes and branch deletion.
- Require branches to be up to date before merging.

Set `main` as the remote repository's default branch.
