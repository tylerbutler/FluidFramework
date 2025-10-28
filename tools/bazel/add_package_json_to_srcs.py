#!/usr/bin/env python3
"""
Add package.json to all ts_project srcs in BUILD.bazel files.
This ensures TypeScript can correctly detect module format in Bazel sandbox.
"""

import os
import re
from pathlib import Path

def update_build_file(filepath):
    """Update a single BUILD.bazel file to include package.json in ts_project srcs."""

    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Pattern to match ts_project rules
    ts_project_pattern = r'(ts_project\([^)]*?name\s*=\s*"([^"]*)"[^)]*?srcs\s*=\s*glob\([^)]+\))'

    def add_package_json(match):
        full_match = match.group(0)
        name = match.group(2)

        # Check if package.json is already included
        if 'package.json' in full_match:
            return full_match

        # Determine the comment based on the target name
        if '_esm' in name:
            comment = '  # Include package.json so TypeScript sees the "type": "module"'
        elif '_cjs' in name:
            comment = '  # Include package.json for consistent behavior'
        else:
            comment = '  # Include package.json for TypeScript module detection'

        # Add package.json after the glob()
        pattern = r'(srcs\s*=\s*glob\([^)]+\))'
        replacement = r'\1 + ["package.json"],' + comment

        # Handle the case where there's already a comma after glob()
        result = re.sub(pattern + r',', replacement, full_match)

        # If no comma was found, try without comma
        if result == full_match:
            result = re.sub(pattern, replacement, full_match)

        return result

    # Find and update all ts_project rules
    updated_content = content

    # First pass: find all ts_project blocks
    ts_blocks = []
    current_pos = 0

    while True:
        # Find next ts_project
        match = re.search(r'ts_project\(', content[current_pos:])
        if not match:
            break

        start = current_pos + match.start()

        # Find the closing parenthesis for this ts_project
        paren_count = 1
        pos = start + len('ts_project(')

        while pos < len(content) and paren_count > 0:
            if content[pos] == '(':
                paren_count += 1
            elif content[pos] == ')':
                paren_count -= 1
            pos += 1

        block = content[start:pos]

        # Check if this block has srcs = glob(...)
        if 'srcs = glob(' in block and 'package.json' not in block:
            # Extract the name
            name_match = re.search(r'name\s*=\s*"([^"]*)"', block)
            if name_match:
                name = name_match.group(1)

                # Determine the comment
                if '_esm' in name:
                    comment = '  # Include package.json so TypeScript sees the "type": "module"'
                elif '_cjs' in name:
                    comment = '  # Include package.json for consistent behavior'
                else:
                    comment = '  # Include package.json for TypeScript module detection'

                # Find the srcs = glob(...) part and add package.json
                srcs_pattern = r'(srcs\s*=\s*glob\([^)]+\))'
                srcs_match = re.search(srcs_pattern, block)

                if srcs_match:
                    old_srcs = srcs_match.group(0)
                    new_srcs = old_srcs + ' + ["package.json"],' + comment
                    new_block = block.replace(old_srcs + ',', new_srcs)
                    if new_block == block:  # No comma after glob()
                        new_block = block.replace(old_srcs, new_srcs)

                    updated_content = updated_content.replace(block, new_block)

        current_pos = pos

    if updated_content != original_content:
        with open(filepath, 'w') as f:
            f.write(updated_content)
        return True

    return False

def main():
    """Update all BUILD.bazel files in packages/ directory."""

    packages_dir = Path('packages')
    updated_files = []
    already_updated = []

    # Find all BUILD.bazel files
    for build_file in packages_dir.glob('**/BUILD.bazel'):
        build_file_str = str(build_file)

        # Skip test directories
        if '/test/' in build_file_str or '/tests/' in build_file_str:
            continue

        # Check if file has ts_project rules
        with open(build_file, 'r') as f:
            content = f.read()

        if 'ts_project(' not in content:
            continue

        print(f"Processing: {build_file}")

        # Check if already has package.json
        if 'package.json' in content:
            already_updated.append(build_file_str)
            print(f"  ✓ Already has package.json in srcs")
        else:
            if update_build_file(build_file):
                updated_files.append(build_file_str)
                print(f"  ✅ Added package.json to srcs")
            else:
                print(f"  ⚠️  No changes needed")

    # Print summary
    print("\n" + "="*60)
    print("Summary:")
    print(f"  Files already updated: {len(already_updated)}")
    print(f"  Files updated now: {len(updated_files)}")

    if updated_files:
        print("\nUpdated files:")
        for f in sorted(updated_files):
            print(f"  - {f}")

    print("\nAll ts_project rules now include package.json in their srcs.")

if __name__ == '__main__':
    main()