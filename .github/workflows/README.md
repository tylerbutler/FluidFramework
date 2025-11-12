# GitHub Actions Workflows

This directory contains the GitHub Actions workflows for the Fluid Framework repository.

## Updating Action Versions with Ratchet

We use [ratchet](https://github.com/sethvargo/ratchet) to pin GitHub Actions to specific commit SHAs while maintaining human-readable version references. This improves security by preventing tag-based attacks.

### How Ratchet Works

Ratchet comments (e.g., `# ratchet:actions/checkout@v5`) tell the tool which version to pin. The tool resolves the version reference to a specific commit SHA and updates the `uses:` line accordingly.

Example:
```yaml
- uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # ratchet:actions/checkout@v5
```

### Using Ratchet with Docker (Recommended)

No installation required! Use Docker to run ratchet:

```bash
# Update all workflow files
docker run -it --rm -v "${PWD}:${PWD}" -w "${PWD}" ghcr.io/sethvargo/ratchet:latest update .github/workflows/*.yml

# Update a specific workflow file
docker run -it --rm -v "${PWD}:${PWD}" -w "${PWD}" ghcr.io/sethvargo/ratchet:latest update .github/workflows/pr-validation.yml
```

### Installing Ratchet (Alternative)

If you prefer to install ratchet locally:

```bash
# Using Go
go install github.com/sethvargo/ratchet@latest

# Using Homebrew (macOS/Linux)
brew install sethvargo/ratchet/ratchet
```

Then update actions with:

```bash
# From the repository root
ratchet update .github/workflows/*.yml
```

To update to a specific version, edit the ratchet comment:

```yaml
# Change this:
- uses: actions/checkout@<sha> # ratchet:actions/checkout@v5

# To this:
- uses: actions/checkout@<sha> # ratchet:actions/checkout@v6

# Then run:
docker run -it --rm -v "${PWD}:${PWD}" -w "${PWD}" ghcr.io/sethvargo/ratchet:latest update .github/workflows/your-workflow.yml
```

### Best Practices

1. **Always include ratchet comments**: When adding new actions, include the ratchet comment for future updates
2. **Review changes carefully**: After running ratchet, review the diff to ensure the updates are expected
3. **Test workflows**: Validate that workflows still function correctly after updates
4. **Update regularly**: Keep actions up-to-date to benefit from security patches and new features

### Additional Resources

- [Ratchet GitHub Repository](https://github.com/sethvargo/ratchet)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
