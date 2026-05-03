# publish-review-checkpoint

Use this skill when publishing a working review checkpoint.

## Workflow

1. Check the current branch.
2. Never push `main`.
3. Run validation when relevant.
4. Check `git status --short`.
5. Stage only intended project files.
6. Do not commit `node_modules`, `.venv`, generated cache files, or large local artifacts.
7. Commit intentionally with a clear message.
8. Push the feature branch with upstream.
9. Opening a PR is optional for now.

## Stop conditions

- Stop and ask for a feature branch if the current branch is `main`.
- Stop if validation exposes a blocking issue that should be fixed before publishing.
