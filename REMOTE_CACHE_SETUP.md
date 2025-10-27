# Remote Cache Setup for Bazel

## Overview

Remote caching is configured but not yet enabled. The `.bazelrc` file is prepared to use remote caching via the `BAZEL_REMOTE_CACHE_URL` environment variable.

## Option 1: bazel-remote (Docker) - Recommended for PoC

**Prerequisites**: Docker installed and running

```bash
# Start bazel-remote cache server
docker run -d \
  --name bazel-remote \
  -p 8080:8080 \
  -v $(pwd)/.bazel-cache:/data \
  buchgr/bazel-remote-cache:latest

# Verify it's running
curl http://localhost:8080/status

# Enable remote cache
export BAZEL_REMOTE_CACHE_URL=http://localhost:8080

# Use dev config (read from cache, don't upload)
bazel build --config=dev //...

# Or use ci config (read and upload to cache)
bazel build --config=ci //...
```

**To stop the cache:**
```bash
docker stop bazel-remote
docker rm bazel-remote
```

## Option 2: Cloud-based Remote Cache (Production)

For production use, consider:

### Google Cloud Storage (GCS)
```bash
# Set up GCS bucket
gsutil mb gs://your-bazel-cache-bucket

# Update .bazelrc or .bazelrc.user
echo "build --remote_cache=https://storage.googleapis.com/your-bazel-cache-bucket" >> .bazelrc.user
echo "build --google_default_credentials" >> .bazelrc.user
```

### BuildBuddy (Recommended for Teams)
```bash
# Sign up at https://buildbuddy.io
# Get your API key

# Update .bazelrc.user
echo "build --remote_cache=grpcs://remote.buildbuddy.io" >> .bazelrc.user
echo "build --remote_header=x-buildbuddy-api-key=YOUR_API_KEY" >> .bazelrc.user
```

### AWS S3
```bash
# Set up S3 bucket
aws s3 mb s3://your-bazel-cache-bucket

# Use a proxy like bazel-remote-proxy or configure with credentials
```

## Option 3: No Remote Cache (Disk Cache Only)

If you don't want to set up remote caching yet, Bazel will use the local disk cache automatically:

```bash
# Disk cache is already configured in .bazelrc
# build --disk_cache=~/.cache/bazel

# Just build normally
bazel build //...
```

The disk cache provides:
- ✅ Incremental build benefits
- ✅ Local caching across builds
- ❌ No cross-machine cache sharing
- ❌ No CI/developer cache sharing

## Current Status

- ✅ `.bazelrc` configured with remote cache support
- ✅ Disk cache enabled as fallback
- ❌ **Docker not available** on this system
- ⏳ Remote cache server not yet running

## Next Steps

1. **For PoC**: Install Docker and start bazel-remote (Option 1)
2. **For Production**: Set up cloud-based cache (Option 2)
3. **For Now**: Use disk cache only (Option 3) - works immediately

## Testing Remote Cache

Once remote cache is set up, test it:

```bash
# Clean build
bazel clean
bazel build --config=ci //packages/common/core-interfaces:core_interfaces

# Clean again and rebuild (should be much faster from cache)
bazel clean
bazel build --config=dev //packages/common/core-interfaces:core_interfaces
```

The second build should complete in seconds instead of minutes if cache is working.

## Performance Expectations

| Build Type | Expected Time | Cache Source |
|------------|---------------|--------------|
| Clean build (no cache) | 5-10 min | None |
| Disk cache hit | 30-60 sec | Local disk |
| Remote cache hit | 10-30 sec | Remote server |
| No-op rebuild | <5 sec | Bazel analysis |

## Troubleshooting

### Cache not being used
```bash
# Check cache hits/misses
bazel build --config=dev //... --execution_log_json_file=execution.log
```

### Network issues
```bash
# Test cache connectivity
curl -v ${BAZEL_REMOTE_CACHE_URL}/status
```

### Disk cache location
```bash
# Check disk cache size
du -sh ~/.cache/bazel
```

---

**Last Updated**: 2025-10-27
**Status**: Configured, not yet enabled (waiting for Docker/remote cache setup)
