# Bazel vs Bazelisk - Version Management

## Quick Answer: Use Bazelisk

**Recommendation**: Use **Bazelisk** for this migration.

## What's the Difference?

### Bazel
- **What**: The build tool itself (e.g., `bazel` version 7.4.1)
- **Installation**: Direct binary installation
- **Version Management**: Manual - you pick one version and use it
- **Upgrade Process**: Manually download and install new version
- **Team Consistency**: Each developer must manually install same version

```bash
# Direct Bazel installation
brew install bazel              # macOS - gets specific version
apt-get install bazel           # Linux - gets specific version
# Manually download from GitHub releases
```

### Bazelisk
- **What**: A version manager for Bazel (like nvm for Node.js, or pyenv for Python)
- **Installation**: One-time install of bazelisk
- **Version Management**: Automatic - reads `.bazelversion` file
- **Upgrade Process**: Change one number in `.bazelversion`, bazelisk downloads it
- **Team Consistency**: Everyone automatically uses same version via config file

```bash
# Bazelisk installation
npm install -g @bazel/bazelisk  # Install once
brew install bazelisk           # or via Homebrew

# Then use 'bazel' commands normally
bazel build //...               # bazelisk intercepts and uses correct version
```

## Why Bazelisk is Better for This Project

### 1. Version Consistency Across Team
```
# Without Bazelisk (manual coordination needed)
Developer A: bazel 7.3.0
Developer B: bazel 7.4.1  ← version mismatch causes issues
CI: bazel 7.2.0           ← different outputs, build failures

# With Bazelisk (automatic)
.bazelversion: "7.4.1"
Developer A: ✅ automatically uses 7.4.1
Developer B: ✅ automatically uses 7.4.1
CI: ✅ automatically uses 7.4.1
```

### 2. Easy Version Upgrades
```bash
# Without Bazelisk
# 1. Download new Bazel binary
# 2. Install system-wide
# 3. Hope it doesn't break anything
# 4. Tell everyone on team to do the same

# With Bazelisk
echo "7.5.0" > .bazelversion
git commit -m "chore: upgrade Bazel to 7.5.0"
# Done - everyone automatically uses new version
```

### 3. Version Pinning in Repository
```
# .bazelversion file (checked into git)
7.4.1

# Everyone gets exact same version
# CI gets exact same version
# No surprises
```

### 4. Testing Multiple Versions
```bash
# Easy to test if newer version works
echo "8.0.0" > .bazelversion
bazel build //...

# Easy to rollback
echo "7.4.1" > .bazelversion
```

### 5. CI Integration
```yaml
# GitHub Actions / CI config
- name: Setup Bazelisk
  run: npm install -g @bazel/bazelisk

# That's it - .bazelversion handles the rest
# No need to specify version in CI config
```

## Installation for This Project

### Step 1: Install Bazelisk
```bash
# Option 1: npm (recommended for Node.js project)
npm install -g @bazel/bazelisk

# Option 2: Homebrew (macOS)
brew install bazelisk

# Option 3: Direct download
# Download from https://github.com/bazelbuild/bazelisk/releases
# Place in PATH as 'bazel'
```

### Step 2: Create .bazelversion File
```bash
# Create in repository root
echo "7.4.1" > .bazelversion
git add .bazelversion
```

### Step 3: Use Normally
```bash
# Just use 'bazel' commands
# Bazelisk intercepts and uses version from .bazelversion
bazel version
bazel build //...
bazel test //...
```

## How Bazelisk Works

```
┌─────────────────────────────────────────────┐
│ Developer runs: bazel build //...          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Bazelisk intercepts the command             │
│ 1. Reads .bazelversion file                 │
│ 2. Checks if that version is cached         │
│ 3. Downloads if needed (one-time)           │
│ 4. Runs actual bazel binary                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Bazel 7.4.1 executes build                  │
└─────────────────────────────────────────────┘
```

## Version Selection

### Recommended: Bazel 7.4.1
- **Released**: November 2024
- **Stability**: Stable release (not RC or beta)
- **rules_js Compatibility**: Fully compatible with aspect_rules_js 2.x
- **rules_ts Compatibility**: Fully compatible with aspect_rules_ts 3.x
- **TypeScript 5.4.5**: Tested and working

### Alternative: Bazel 8.0.0 (if you want latest)
- **Released**: January 2025
- **Stability**: Major version, new features
- **Risk**: Newer = less battle-tested
- **Recommendation**: Start with 7.4.1, upgrade later

## For This Migration

### Phase 0 Setup Will Include:

```bash
# Session 0.1: Install Bazelisk
npm install -g @bazel/bazelisk

# Verify installation
which bazel  # Should point to bazelisk
bazel version  # Will download Bazel on first run

# Create version file
echo "7.4.1" > .bazelversion

# Add to git
git add .bazelversion
git commit -m "chore(bazel): add Bazel version file"
```

### Benefits for Migration

1. **Consistent PoC Results**: Everyone testing PoC uses same Bazel version
2. **CI Reliability**: CI automatically uses same version as development
3. **Easy Rollback**: If Bazel version causes issues, easy to change
4. **Future-Proof**: Easy to upgrade as Bazel improves
5. **Documentation**: `.bazelversion` serves as documentation of requirements

## Summary Table

| Aspect | Bazel (Direct) | Bazelisk (Manager) |
|--------|---------------|-------------------|
| **Installation** | Per-version install | One-time install |
| **Version Control** | Manual coordination | `.bazelversion` file |
| **Team Sync** | Manual communication | Automatic |
| **CI Setup** | Specify version in CI | Auto from `.bazelversion` |
| **Upgrades** | Reinstall everywhere | Change one file |
| **Multiple Projects** | Conflicts possible | Each project independent |
| **Recommendation** | ❌ No | ✅ **Yes** |

## Analogy

Think of it like:
- **Bazel** = Installing Node.js v20.15.1 system-wide
- **Bazelisk** = Using nvm to manage Node versions via `.nvmrc`

Just like you use `.nvmrc` for Node version consistency, use `.bazelversion` for Bazel.

## Final Recommendation

**Use Bazelisk with Bazel 7.4.1** for this migration.

```bash
# Installation (one command)
npm install -g @bazel/bazelisk

# Configuration (one file)
echo "7.4.1" > .bazelversion

# Usage (no difference)
bazel build //...
bazel test //...
```

---

**TL;DR**: Bazelisk is like nvm for Bazel. Use it. Install once, version-lock in `.bazelversion`, everyone automatically uses same version.
