#!/bin/bash
# start-remote-cache.sh - Start bazel-remote cache server
set -e

echo "🚀 Starting Bazel Remote Cache Server..."

# Check if Docker daemon is running
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker daemon is not running."
    echo "    Please start it with: sudo service docker start"
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q bazel-remote; then
    echo "📦 Container 'bazel-remote' already exists."

    # Check if it's running
    if docker ps | grep -q bazel-remote; then
        echo "✅ Container is already running on http://localhost:8080"
    else
        echo "🔄 Starting existing container..."
        docker start bazel-remote
        echo "✅ Container started on http://localhost:8080"
    fi
else
    echo "📦 Creating new bazel-remote container..."

    # Create cache directory
    mkdir -p .bazel-cache

    # Start container
    docker run -d \
        --name bazel-remote \
        -p 8080:8080 \
        -v "$(pwd)/.bazel-cache:/data" \
        buchgr/bazel-remote-cache:latest

    echo "✅ Container created and started on http://localhost:8080"
fi

# Verify it's running
echo ""
echo "🔍 Verifying cache server..."
sleep 2
if curl -s http://localhost:8080/status > /dev/null 2>&1; then
    echo "✅ Cache server is responding!"
    echo ""
    echo "📝 To use remote cache, run:"
    echo "   export BAZEL_REMOTE_CACHE_URL=http://localhost:8080"
    echo "   bazel build --config=dev //..."
else
    echo "❌ Cache server is not responding. Check Docker logs:"
    echo "   docker logs bazel-remote"
    exit 1
fi

echo ""
echo "💡 Useful commands:"
echo "   - View logs:      docker logs bazel-remote"
echo "   - Stop cache:     docker stop bazel-remote"
echo "   - Remove cache:   docker rm bazel-remote"
echo "   - Check status:   curl http://localhost:8080/status"
