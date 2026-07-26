# AI Interview Coach

An AI-powered interview practice application built with Next.js.

## Branch strategy

- `main` contains stable, release-ready code.
- `develop` is the integration branch for completed work.
- `feature/<short-name>` branches are created from `develop` for new features.
- `fix/<short-name>` branches are created from `develop` for non-production fixes.
- `hotfix/<short-name>` branches may be created from `main` for urgent production fixes.

Normal changes follow this path:

```text
feature/* or fix/* -> develop -> main
```

After a hotfix is merged into `main`, merge it back into `develop` as well.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the working procedure.
