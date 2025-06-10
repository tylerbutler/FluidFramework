# Release Notes Snapshot Tests

This directory contains snapshot files for testing the `generate:releaseNotes` command. Snapshot testing ensures that the generated release notes maintain consistent formatting and structure across changes.

## How Snapshot Testing Works

1. **Golden Files**: Each `.md` file in this directory represents the expected output for a specific test scenario
2. **Test Execution**: When tests run, they generate release notes and compare them against these golden files
3. **Mismatch Detection**: If the output doesn't match, the test fails and creates an `.actual.md` file showing the differences
4. **Easy Updates**: When intentional changes are made, you can update snapshots by replacing the golden file content

## Snapshot Files

- `main-minor-release-notes.md` - Basic release notes output for main release group, minor release
- `main-minor-release-notes-with-heading-links.md` - Release notes with `--headingLinks` flag enabled
- `main-minor-release-notes-exclude-h1.md` - Release notes with `--excludeH1` flag enabled

## Updating Snapshots

When you make intentional changes to the release notes format:

1. Run the tests: `npm run test:mocha -- --grep "releaseNotes"`
2. If snapshots don't match, you'll see `.actual.md` files created
3. Review the differences to ensure they're expected
4. Replace the golden file content with the actual content:
   ```bash
   cp main-minor-release-notes.actual.md main-minor-release-notes.md
   ```
5. Delete the `.actual.md` files
6. Re-run tests to verify they pass

## Creating New Snapshots

To add a new test scenario:

1. Add a new test in `releaseNotes.test.ts`
2. Use the `testSnapshotMatch()` helper function
3. Run the test - it will automatically create the snapshot file if it doesn't exist
4. Review the generated snapshot to ensure it's correct
5. Commit both the test and the snapshot file

## Best Practices

- **Review Changes**: Always review snapshot differences before updating
- **Minimal Changes**: Keep snapshots focused on specific scenarios
- **Documentation**: Update this README when adding new snapshot types
- **Cross-Platform**: Snapshots handle line ending normalization automatically
- **Version Control**: Always commit snapshot files alongside code changes

## Troubleshooting

### Test Fails with "Cannot find snapshot"
- The snapshot file doesn't exist yet
- Run the test once to auto-generate it

### Test Fails with "Snapshot mismatch"
- Check the `.actual.md` file for differences
- Verify if changes are intentional
- Update the snapshot if changes are expected

### Cross-Platform Issues
- Line endings are automatically normalized
- File paths use the correct separators for the platform
- All snapshots should work consistently across Windows, macOS, and Linux