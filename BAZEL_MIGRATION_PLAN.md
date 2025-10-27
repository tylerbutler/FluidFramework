# Bazel Migration Plan - FluidFramework Monorepo

**Project**: FluidFramework TypeScript Monorepo
**Current Build System**: fluid-build (custom) + pnpm workspaces
**Target Build System**: Bazel
**Migration Strategy**: Proof of Concept → Iterative Expansion → Complete Migration
**Estimated Total Time**: 8-12 weeks (40-60 individual 1-2 hour sessions)

---

## Migration Principles

1. **No Backward Compatibility**: Complete switch to Bazel, no hybrid system
2. **Scripted & Repeatable**: All migration steps automated via TypeScript scripts
3. **Session-Based**: Each task designed for 1-2 hour sessions with clear deliverables
4. **Validation First**: Every step includes verification against fluid-build outputs
5. **Incremental Risk**: Start simple (zero-dep packages) → increase complexity gradually

## Configuration Decisions

Based on project requirements:

1. **Version Management**: Use **Bazelisk** (not direct Bazel)
   - Automatic version consistency via `.bazelversion` file
   - See `BAZEL_VS_BAZELISK.md` for detailed explanation
   - Target version: **Bazel 8.4.2** (LTS release with better performance and Bzlmod)

2. **API Extraction**: Integrated into Bazel build as targets
   - API reports generated as build outputs
   - Breaking change detection part of validation

3. **Dependency Management**: `pnpm-lock.yaml` treated as npm lockfile
   - Bazel's `npm_translate_lock` reads `pnpm-lock.yaml` directly
   - No separate lock file needed

4. **Remote Caching**: Configured from the start (Phase 0)
   - Enables fast builds even in PoC
   - Critical for multi-developer workflow
   - Configuration in `.bazelrc` from day one

---

## Phase 0: Environment Setup & Preparation (2 sessions, 2-4 hours)

### Session 0.1: Bazelisk Installation & Project Structure Setup
**Time**: 1-2 hours
**Prerequisites**: None
**Working Directory**: `/home/tylerbu/code/FluidWorkspace/bazel-init`

**Tasks**:
1. Install Bazelisk (version manager for Bazel - see BAZEL_VS_BAZELISK.md)
   ```bash
   npm install -g @bazel/bazelisk
   # Bazelisk acts as 'bazel' command but manages versions automatically
   ```

2. Create `.bazelversion` file to pin Bazel version
   ```bash
   echo "8.4.2" > .bazelversion
   ```

3. Verify Bazelisk installation
   ```bash
   bazel version  # Downloads Bazel 8.4.2 on first run
   ```

4. Create migration tooling structure
   ```bash
   mkdir -p bazel-migration/{scripts,templates,configs,validation}
   ```

5. Initialize TypeScript project for migration scripts
   ```typescript
   // bazel-migration/package.json
   {
     "name": "bazel-migration-tools",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "dependencies": {
       "@types/node": "^20.0.0",
       "typescript": "~5.4.5",
       "glob": "^10.0.0",
       "js-yaml": "^4.1.0"
     }
   }
   ```

6. Create tsconfig for migration scripts
   ```json
   // bazel-migration/tsconfig.json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "outDir": "./dist",
       "rootDir": "./scripts",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     },
     "include": ["scripts/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

**Deliverables**:
- ✅ Bazelisk installed and verified
- ✅ `.bazelversion` file created (8.4.2)
- ✅ Bazel 8.4.2 downloaded and working
- ✅ `bazel-migration/` directory structure created
- ✅ TypeScript tooling initialized
- ✅ Git commit: `chore(bazel): initialize Bazelisk and migration tooling`

**Validation**:
```bash
bazel version  # Should show: "Build label: 8.4.2"
cat .bazelversion  # Should show: "8.4.2"
cd bazel-migration && npm install && npm run build  # Should compile successfully
```

---

### Session 0.2: Bazel Workspace Initialization & Rules Setup
**Time**: 1-2 hours
**Prerequisites**: Session 0.1 complete

**Tasks**:
1. Create root `WORKSPACE.bazel` file
   ```python
   # WORKSPACE.bazel
   workspace(name = "fluidframework")

   load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

   # Aspect Rules (modern Bazel for JS/TS)
   http_archive(
       name = "aspect_rules_js",
       sha256 = "...",  # Get from aspect-build/rules_js releases
       strip_prefix = "rules_js-2.2.2",
       url = "https://github.com/aspect-build/rules_js/releases/download/v2.2.2/rules_js-v2.2.2.tar.gz",
   )

   http_archive(
       name = "aspect_rules_ts",
       sha256 = "...",  # Get from aspect-build/rules_ts releases
       strip_prefix = "rules_ts-3.4.2",
       url = "https://github.com/aspect-build/rules_ts/releases/download/v3.4.2/rules_ts-v3.4.2.tar.gz",
   )

   load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
   rules_js_dependencies()

   load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")
   rules_ts_dependencies(ts_version = "5.4.5")

   load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")
   npm_translate_lock(
       name = "npm",
       pnpm_lock = "//:pnpm-lock.yaml",
       verify_node_modules_ignored = "//:.bazelignore",
   )

   load("@npm//:repositories.bzl", "npm_repositories")
   npm_repositories()
   ```

2. Create `.bazelrc` for consistent build settings with remote caching
   ```bash
   # .bazelrc
   # Common settings
   build --enable_platform_specific_config
   build --incompatible_strict_action_env

   # TypeScript settings
   build --@aspect_rules_ts//ts:skipLibCheck=always
   build --@aspect_rules_ts//ts:default_to_tsc_transpiler

   # Performance
   build --jobs=auto
   build --worker_max_instances=4

   # Disk cache (local fallback)
   build --disk_cache=~/.cache/bazel

   # Remote cache configuration (configured from start per requirements)
   # Options for remote cache backend:

   # Option 1: GitHub Actions cache (for GitHub-hosted projects)
   # build --remote_cache=https://storage.googleapis.com/bazel-cache-bucket
   # build --google_default_credentials

   # Option 2: Local HTTP cache (for development/testing)
   # See: https://github.com/buchgr/bazel-remote
   # build --remote_cache=http://localhost:8080

   # Option 3: Bazel Remote Execution (BuildBuddy, BuildGrid, etc.)
   # build --remote_cache=grpc://your-remote-cache:8980

   # Enable remote cache for CI (set via environment variable)
   # build:ci --remote_cache=${BAZEL_REMOTE_CACHE_URL}
   # build:ci --remote_upload_local_results=true

   # For PoC, use local disk cache initially
   # Remote cache URL can be added when ready:
   # build --remote_cache=<your-cache-url>

   # Remote cache upload for CI builds (save to cache)
   build:ci --remote_upload_local_results=true

   # Remote cache read for developers (read-only from cache)
   build:dev --remote_upload_local_results=false

   # Output settings
   build --show_timestamps
   build --color=yes

   # Test settings
   test --test_output=errors
   test --test_summary=detailed
   ```

3. Create `.bazelignore` to exclude non-Bazel directories
   ```
   node_modules
   dist
   lib
   .nx
   .pnpm-store
   nyc
   docs/_site
   ```

4. Create `BUILD.bazel` in root (initially empty, will be populated later)
   ```python
   # Root BUILD.bazel
   # This file marks the root of the Bazel workspace
   ```

5. Set up remote cache (bazel-remote for PoC)
   ```bash
   # Install bazel-remote (local HTTP cache server)
   # Option 1: Docker (recommended for PoC)
   docker run -d \
     --name bazel-remote \
     -p 8080:8080 \
     -v $(pwd)/.bazel-cache:/data \
     buchgr/bazel-remote-cache:latest

   # Option 2: Direct binary (see https://github.com/buchgr/bazel-remote)

   # Update .bazelrc to use it
   echo "build --remote_cache=http://localhost:8080" >> .bazelrc
   ```

   **Note**: For production, use cloud-based solution (GCS, S3, BuildBuddy).
   For PoC, local bazel-remote is sufficient and proves the concept.

**Deliverables**:
- ✅ `WORKSPACE.bazel` configured with rules_js and rules_ts
- ✅ `.bazelrc` with optimized settings and remote cache config
- ✅ `.bazelignore` configured
- ✅ Root `BUILD.bazel` created
- ✅ Remote cache running (bazel-remote via Docker)
- ✅ Git commit: `chore(bazel): initialize workspace with remote caching`

**Validation**:
```bash
bazel info workspace  # Should show workspace path
bazel query //...  # Should return empty set (no targets yet)
curl http://localhost:8080/status  # Should return cache status (if using bazel-remote)
```

**Remote Cache Notes**:
- Local bazel-remote for PoC validates caching works
- Can be shared across developers on same network
- Production migration (Phase 4) will upgrade to cloud cache
- Cache improves build speed 5-10x for unchanged files

---

## Phase 1: Proof of Concept - Foundation Packages (6 sessions, 8-12 hours)

### Session 1.1: Create BUILD File Generation Script
**Time**: 1-2 hours
**Prerequisites**: Phase 0 complete

**Tasks**:
1. Create TypeScript script to generate BUILD files
   ```typescript
   // bazel-migration/scripts/generate-build-file.ts
   import { readFileSync, writeFileSync } from 'fs';
   import { join, relative } from 'path';
   import { glob } from 'glob';

   interface PackageInfo {
     name: string;
     path: string;
     dependencies: string[];
     hasTests: boolean;
     testFramework: 'mocha' | 'jest' | 'none';
   }

   async function generateBuildFile(packagePath: string): Promise<void> {
     const pkgJsonPath = join(packagePath, 'package.json');
     const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

     const packageInfo: PackageInfo = {
       name: pkgJson.name,
       path: packagePath,
       dependencies: extractWorkspaceDeps(pkgJson),
       hasTests: await hasTestDirectory(packagePath),
       testFramework: detectTestFramework(pkgJson),
     };

     const buildContent = generateBuildContent(packageInfo);
     const buildPath = join(packagePath, 'BUILD.bazel');
     writeFileSync(buildPath, buildContent);

     console.log(`✅ Generated BUILD.bazel for ${packageInfo.name}`);
   }

   function extractWorkspaceDeps(pkgJson: any): string[] {
     const deps: string[] = [];
     for (const [name, version] of Object.entries(pkgJson.dependencies || {})) {
       if (typeof version === 'string' && version.startsWith('workspace:')) {
         deps.push(name);
       }
     }
     return deps;
   }

   function generateBuildContent(info: PackageInfo): string {
     const safeName = info.name.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');
     const depsList = info.dependencies.map(depNameToTarget).join(',\n        ');

     return `# BUILD.bazel for ${info.name}
   # Auto-generated - DO NOT EDIT MANUALLY

   load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
   load("@aspect_rules_js//js:defs.bzl", "js_library")
   ${info.testFramework === 'mocha' ? 'load("@npm//:mocha/package_json.bzl", mocha_bin = "bin")' : ''}

   package(default_visibility = ["//visibility:public"])

   # ESM compilation
   ts_project(
       name = "${safeName}_esm",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "lib",
       root_dir = "src",
       tsconfig = ":tsconfig.json",
       deps = [
   ${depsList ? '        ' + depsList : ''}
       ],
   )

   # CommonJS compilation
   ts_project(
       name = "${safeName}_cjs",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "dist",
       root_dir = "src",
       tsconfig = ":tsconfig.cjs.json",
       transpiler = "tsc",
       deps = [
   ${depsList ? '        ' + depsList : ''}
       ],
   )

   ${info.hasTests ? generateTestTargets(info, safeName) : ''}

   # Default target builds both ESM and CJS
   filegroup(
       name = "${safeName}",
       srcs = [
           ":${safeName}_esm",
           ":${safeName}_cjs",
       ],
   )
   `;
   }

   function depNameToTarget(depName: string): string {
     // Convert @fluidframework/core-interfaces -> //packages/common/core-interfaces:core_interfaces_esm
     // This will need package location mapping
     const safeName = depName.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');
     return `"//packages/...:${safeName}_esm"`;  // Placeholder - needs actual path
   }

   function generateTestTargets(info: PackageInfo, safeName: string): string {
     if (info.testFramework === 'mocha') {
       return `
   # Test compilation
   ts_project(
       name = "${safeName}_test",
       srcs = glob(["src/test/**/*.ts"]),
       declaration = False,
       out_dir = "lib/test",
       root_dir = "src",
       tsconfig = ":src/test/tsconfig.json",
       deps = [
           ":${safeName}_esm",
           "@npm//mocha",
           "@npm//@types/mocha",
       ],
   )

   # Mocha test runner
   mocha_bin.mocha_test(
       name = "test",
       args = [
           "lib/test/**/*.spec.js",
           "--exit",
       ],
       data = [
           ":${safeName}_test",
       ],
   )
   `;
     }
     return '';
   }

   async function hasTestDirectory(packagePath: string): Promise<boolean> {
     const testFiles = await glob(join(packagePath, 'src/test/**/*.ts'));
     return testFiles.length > 0;
   }

   function detectTestFramework(pkgJson: any): 'mocha' | 'jest' | 'none' {
     const scripts = pkgJson.scripts || {};
     if (scripts['test:mocha']) return 'mocha';
     if (scripts['test:jest']) return 'jest';
     return 'none';
   }

   // CLI usage
   const packagePath = process.argv[2];
   if (!packagePath) {
     console.error('Usage: tsx generate-build-file.ts <package-path>');
     process.exit(1);
   }

   generateBuildFile(packagePath).catch(console.error);
   ```

2. Create package path mapping utility
   ```typescript
   // bazel-migration/scripts/package-mapper.ts
   import { readFileSync } from 'fs';
   import { join } from 'path';
   import { glob } from 'glob';

   export interface PackageMapping {
     name: string;
     path: string;
     bazelTarget: string;
   }

   export async function buildPackageMap(rootDir: string): Promise<Map<string, PackageMapping>> {
     const packageJsonPaths = await glob(join(rootDir, 'packages/**/package.json'), {
       ignore: ['**/node_modules/**'],
     });

     const map = new Map<string, PackageMapping>();

     for (const pkgPath of packageJsonPaths) {
       const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
       const packageDir = pkgPath.replace('/package.json', '');
       const relativePath = packageDir.replace(rootDir + '/', '');
       const safeName = pkgJson.name.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');

       map.set(pkgJson.name, {
         name: pkgJson.name,
         path: relativePath,
         bazelTarget: `//${relativePath}:${safeName}`,
       });
     }

     return map;
   }

   export function savePackageMap(map: Map<string, PackageMapping>, outputPath: string): void {
     const obj = Object.fromEntries(map);
     writeFileSync(outputPath, JSON.stringify(obj, null, 2));
   }
   ```

**Deliverables**:
- ✅ BUILD file generation script created
- ✅ Package mapping utility created
- ✅ Scripts compile without errors
- ✅ Git commit: `feat(bazel): add BUILD file generation tooling`

**Validation**:
```bash
cd bazel-migration
pnpm tsc  # Should compile successfully
```

---

### Session 1.2: Migrate @fluidframework/core-interfaces (PoC Package 1)
**Time**: 1-2 hours
**Prerequisites**: Session 1.1 complete

**Tasks**:
1. Generate package mapping
   ```bash
   cd bazel-migration
   tsx scripts/package-mapper.ts ../packages > configs/package-map.json
   ```

2. Manually create BUILD.bazel for core-interfaces (first iteration before script works)
   ```python
   # packages/common/core-interfaces/BUILD.bazel
   load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
   load("@npm//:mocha/package_json.bzl", mocha_bin = "bin")

   package(default_visibility = ["//visibility:public"])

   # ESM compilation
   ts_project(
       name = "core_interfaces_esm",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "lib",
       root_dir = "src",
       tsconfig = ":tsconfig.json",
       deps = [],
   )

   # CommonJS compilation
   ts_project(
       name = "core_interfaces_cjs",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "dist",
       root_dir = "src",
       tsconfig = ":tsconfig.cjs.json",
       transpiler = "tsc",
       deps = [],
   )

   # Test compilation
   ts_project(
       name = "core_interfaces_test",
       srcs = glob(["src/test/**/*.ts"]),
       declaration = False,
       out_dir = "lib/test",
       root_dir = "src",
       tsconfig = ":src/test/tsconfig.json",
       deps = [
           ":core_interfaces_esm",
           "@npm//mocha",
           "@npm//@types/mocha",
       ],
   )

   # Mocha test runner
   mocha_bin.mocha_test(
       name = "test",
       args = [
           "lib/test/**/*.spec.js",
           "--exit",
       ],
       data = [
           ":core_interfaces_test",
       ],
   )

   filegroup(
       name = "core_interfaces",
       srcs = [
           ":core_interfaces_esm",
           ":core_interfaces_cjs",
       ],
   )
   ```

3. Build the package
   ```bash
   bazel build //packages/common/core-interfaces:core_interfaces
   ```

4. Run tests
   ```bash
   bazel test //packages/common/core-interfaces:test
   ```

5. Create output validation script
   ```typescript
   // bazel-migration/scripts/validate-outputs.ts
   import { readFileSync, existsSync } from 'fs';
   import { join } from 'path';
   import { glob } from 'glob';
   import { createHash } from 'crypto';

   interface ValidationResult {
     package: string;
     esmMatch: boolean;
     cjsMatch: boolean;
     typesMatch: boolean;
     differences: string[];
   }

   async function validatePackageOutputs(packagePath: string): Promise<ValidationResult> {
     const result: ValidationResult = {
       package: packagePath,
       esmMatch: true,
       cjsMatch: true,
       typesMatch: true,
       differences: [],
     };

     // Compare ESM outputs
     const esmFiles = await glob(join(packagePath, 'lib/**/*.js'));
     const bazelEsmFiles = await glob(join('bazel-bin', packagePath, 'lib/**/*.js'));

     result.esmMatch = await compareFiles(esmFiles, bazelEsmFiles);
     if (!result.esmMatch) {
       result.differences.push('ESM outputs differ');
     }

     // Compare CJS outputs
     const cjsFiles = await glob(join(packagePath, 'dist/**/*.js'));
     const bazelCjsFiles = await glob(join('bazel-bin', packagePath, 'dist/**/*.js'));

     result.cjsMatch = await compareFiles(cjsFiles, bazelCjsFiles);
     if (!result.cjsMatch) {
       result.differences.push('CJS outputs differ');
     }

     return result;
   }

   async function compareFiles(files1: string[], files2: string[]): Promise<boolean> {
     if (files1.length !== files2.length) return false;

     for (const file of files1) {
       const content1 = readFileSync(file);
       const hash1 = createHash('sha256').update(content1).digest('hex');

       const file2 = file.replace(/^packages/, 'bazel-bin/packages');
       if (!existsSync(file2)) return false;

       const content2 = readFileSync(file2);
       const hash2 = createHash('sha256').update(content2).digest('hex');

       if (hash1 !== hash2) return false;
     }

     return true;
   }
   ```

**Deliverables**:
- ✅ BUILD.bazel for core-interfaces created and working
- ✅ Package builds successfully with Bazel
- ✅ Tests pass
- ✅ Output validation script created
- ✅ Git commit: `feat(bazel): migrate @fluidframework/core-interfaces to Bazel`

**Validation**:
```bash
# Build comparison
pnpm --filter @fluidframework/core-interfaces run build  # fluid-build
bazel build //packages/common/core-interfaces:core_interfaces  # Bazel

# Output comparison
cd bazel-migration
tsx scripts/validate-outputs.ts packages/common/core-interfaces
```

**Note**: API extraction will be added in Session 1.5 as a build target.

---

### Session 1.3: Migrate @fluidframework/driver-definitions (PoC Package 2)
**Time**: 1-2 hours
**Prerequisites**: Session 1.2 complete

**Tasks**:
1. Create BUILD.bazel with dependency on core-interfaces
   ```python
   # packages/common/driver-definitions/BUILD.bazel
   load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
   load("@npm//:mocha/package_json.bzl", mocha_bin = "bin")

   package(default_visibility = ["//visibility:public"])

   # ESM compilation
   ts_project(
       name = "driver_definitions_esm",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "lib",
       root_dir = "src",
       tsconfig = ":tsconfig.json",
       deps = [
           "//packages/common/core-interfaces:core_interfaces_esm",
       ],
   )

   # CommonJS compilation
   ts_project(
       name = "driver_definitions_cjs",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "dist",
       root_dir = "src",
       tsconfig = ":tsconfig.cjs.json",
       transpiler = "tsc",
       deps = [
           "//packages/common/core-interfaces:core_interfaces_cjs",
       ],
   )

   # Test compilation
   ts_project(
       name = "driver_definitions_test",
       srcs = glob(["src/test/**/*.ts"]),
       declaration = False,
       out_dir = "lib/test",
       root_dir = "src",
       tsconfig = ":src/test/tsconfig.json",
       deps = [
           ":driver_definitions_esm",
           "@npm//mocha",
           "@npm//@types/mocha",
       ],
   )

   mocha_bin.mocha_test(
       name = "test",
       args = [
           "lib/test/**/*.spec.js",
           "--exit",
       ],
       data = [
           ":driver_definitions_test",
       ],
   )

   filegroup(
       name = "driver_definitions",
       srcs = [
           ":driver_definitions_esm",
           ":driver_definitions_cjs",
       ],
   )
   ```

2. Update BUILD generation script to handle dependencies
   ```typescript
   // Enhancement to generate-build-file.ts
   function depNameToTarget(depName: string, packageMap: Map<string, PackageMapping>): string {
     const mapping = packageMap.get(depName);
     if (!mapping) {
       throw new Error(`Unknown workspace dependency: ${depName}`);
     }
     const safeName = depName.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');
     return `"${mapping.bazelTarget}_esm"`;
   }
   ```

3. Build and test
   ```bash
   bazel build //packages/common/driver-definitions:driver_definitions
   bazel test //packages/common/driver-definitions:test
   ```

4. Validate dependency resolution
   ```bash
   bazel query "deps(//packages/common/driver-definitions:driver_definitions_esm)"
   # Should include core-interfaces
   ```

**Deliverables**:
- ✅ BUILD.bazel for driver-definitions created
- ✅ Workspace dependency resolution working
- ✅ Both packages build together
- ✅ Tests pass
- ✅ Git commit: `feat(bazel): migrate @fluidframework/driver-definitions with dependencies`

**Validation**:
```bash
bazel build //packages/common/...  # Build all common packages
bazel test //packages/common/...   # Test all common packages
```

---

### Session 1.4: Migrate @fluidframework/container-definitions (PoC Package 3)
**Time**: 1-2 hours
**Prerequisites**: Session 1.3 complete

**Tasks**:
1. Create BUILD.bazel with multi-dependency chain
   ```python
   # packages/common/container-definitions/BUILD.bazel
   load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
   load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

   package(default_visibility = ["//visibility:public"])

   ts_project(
       name = "container_definitions_esm",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "lib",
       root_dir = "src",
       tsconfig = ":tsconfig.json",
       deps = [
           "//packages/common/core-interfaces:core_interfaces_esm",
           "//packages/common/driver-definitions:driver_definitions_esm",
       ],
   )

   ts_project(
       name = "container_definitions_cjs",
       srcs = glob(
           ["src/**/*.ts"],
           exclude = ["src/test/**"],
       ),
       declaration = True,
       out_dir = "dist",
       root_dir = "src",
       tsconfig = ":tsconfig.cjs.json",
       transpiler = "tsc",
       deps = [
           "//packages/common/core-interfaces:core_interfaces_cjs",
           "//packages/common/driver-definitions:driver_definitions_cjs",
       ],
   )

   # API Extraction (if needed)
   js_run_binary(
       name = "api_extractor",
       srcs = [
           ":container_definitions_esm",
           "api-extractor/api-extractor.json",
       ],
       outs = ["api-report/container-definitions.api.md"],
       tool = "@npm//@microsoft/api-extractor/bin:api-extractor",
       args = ["run", "--config", "api-extractor/api-extractor.json"],
   )

   filegroup(
       name = "container_definitions",
       srcs = [
           ":container_definitions_esm",
           ":container_definitions_cjs",
       ],
   )
   ```

2. Build and test dependency chain
   ```bash
   bazel build //packages/common/container-definitions:container_definitions
   ```

3. Verify transitive dependencies
   ```bash
   bazel query "deps(//packages/common/container-definitions:container_definitions_esm)" --output graph > deps.dot
   dot -Tpng deps.dot -o deps.png  # Visualize dependency graph
   ```

**Deliverables**:
- ✅ BUILD.bazel for container-definitions created
- ✅ Multi-level dependency chain working
- ✅ All three PoC packages build together
- ✅ Dependency graph validated
- ✅ Git commit: `feat(bazel): migrate @fluidframework/container-definitions with multi-deps`

**Validation**:
```bash
bazel build //packages/common/...
bazel test //packages/common/...
bazel query "allpaths(//packages/common/container-definitions:container_definitions_esm, //packages/common/core-interfaces:core_interfaces_esm)"
```

---

### Session 1.5: API Extraction Integration (Mandatory Build Target)
**Time**: 1-2 hours
**Prerequisites**: Session 1.4 complete

**Purpose**: Integrate API Extractor as mandatory build target (not separate step).
Per requirements, API extraction must be part of the build process.

**Tasks**:
1. Create Bazel rule for API Extractor
   ```python
   # bazel-migration/templates/api-extractor.bzl
   load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

   def api_extractor(name, tsconfig, srcs, api_json_config, **kwargs):
       """Run API Extractor to generate API reports

       Args:
           name: Target name
           tsconfig: TypeScript config for the project
           srcs: Source files (ts_project output)
           api_json_config: Path to api-extractor.json config
       """
       js_run_binary(
           name = name,
           srcs = srcs + [
               tsconfig,
               api_json_config,
           ],
           outs = [name + ".api.md"],
           tool = "@npm//@microsoft/api-extractor/bin:api-extractor",
           args = [
               "run",
               "--config",
               "$(location " + api_json_config + ")",
               "--local",
           ],
           **kwargs
       )
   ```

2. Add API extraction to PoC packages
   ```python
   # Update BUILD.bazel files
   load("//bazel-migration/templates:api-extractor.bzl", "api_extractor")

   api_extractor(
       name = "api_report",
       tsconfig = ":tsconfig.json",
       srcs = [":core_interfaces_esm"],
       api_json_config = "api-extractor/api-extractor.json",
   )
   ```

3. Test API extraction
   ```bash
   bazel build //packages/common/core-interfaces:api_report
   ```

4. Update package BUILD files to include API extraction in default target
   ```python
   # Update filegroup to include API reports
   filegroup(
       name = "core_interfaces",
       srcs = [
           ":core_interfaces_esm",
           ":core_interfaces_cjs",
           ":api_report",  # Now part of default build
       ],
   )
   ```

5. Verify API extraction runs on every build
   ```bash
   bazel build //packages/common/core-interfaces:core_interfaces
   # Should now build ESM + CJS + API reports
   ```

**Deliverables**:
- ✅ API Extractor Bazel rule created
- ✅ API reports generated as build targets (not separate step)
- ✅ API extraction included in default package build
- ✅ Reports match fluid-build outputs
- ✅ Git commit: `feat(bazel): integrate API extraction as mandatory build target`

---

### Session 1.6: PoC Documentation & Retrospective
**Time**: 1-2 hours
**Prerequisites**: Sessions 1.1-1.5 complete

**Tasks**:
1. Create PoC summary document
   ```markdown
   # Bazel PoC Summary

   ## Packages Migrated
   - @fluidframework/core-interfaces
   - @fluidframework/driver-definitions
   - @fluidframework/container-definitions

   ## Capabilities Proven
   ✅ Dual ESM/CJS compilation
   ✅ Workspace dependency resolution
   ✅ Multi-level dependency chains
   ✅ Test execution (Mocha)
   ✅ API extraction (integrated as build target)
   ✅ Remote caching (local bazel-remote)

   ## Build Performance
   - fluid-build: X seconds
   - Bazel (cold): Y seconds
   - Bazel (warm, disk cache): Z seconds
   - Bazel (remote cache hit): W seconds

   ## Challenges Encountered
   [Document issues and solutions]

   ## Next Steps
   [Recommendations for Phase 2]
   ```

2. Create BUILD file generation script (final version)
   ```bash
   cd bazel-migration
   tsx scripts/generate-build-file.ts packages/common/core-interfaces
   # Verify it generates correct BUILD.bazel
   ```

3. Document patterns and conventions
   ```markdown
   # Bazel Conventions for FluidFramework

   ## Target Naming
   - ESM: `<package_name>_esm`
   - CJS: `<package_name>_cjs`
   - Tests: `<package_name>_test`
   - Main: `<package_name>` (filegroup of ESM + CJS)

   ## Dependencies
   - Always depend on matching module format (ESM -> ESM, CJS -> CJS)
   - Use `//packages/<category>/<name>:<target>` format

   ## File Organization
   - BUILD.bazel in package root
   - tsconfig.json for ESM
   - tsconfig.cjs.json for CJS
   ```

**Deliverables**:
- ✅ PoC summary document created
- ✅ BUILD generation script finalized
- ✅ Patterns documented
- ✅ Performance metrics collected
- ✅ Git commit: `docs(bazel): document PoC outcomes and conventions`

**Validation**:
- All 3 PoC packages build successfully
- All tests pass
- Build times documented
- Scripts work end-to-end

---

## Phase 2: Expansion - Common & Utility Packages (10-15 sessions, 15-25 hours)

### Session 2.1-2.5: Migrate Remaining common/ Packages
**Time per session**: 1-2 hours
**Packages**: 2 packages per session (5 total packages)

**Session 2.1**:
- @fluidframework/core-utils
- @fluid-internal/client-utils

**Session 2.2**:
- (Any remaining common/ packages)

**Tasks per package**:
1. Run BUILD generation script
2. Adjust dependencies
3. Build and test
4. Validate outputs
5. Commit

### Session 2.6-2.10: Migrate utils/ Packages
**Time per session**: 1-2 hours
**Packages**: 2-3 packages per session

Target high-value utility packages with minimal dependencies first.

### Session 2.11-2.15: Migrate test/ and tools/ Packages
**Time per session**: 1-2 hours

Special handling for packages that are dev/build utilities.

---

## Phase 3: Core Framework Migration (20-30 sessions, 30-50 hours)

### Session 3.x: Category-by-Category Migration

**Strategy**:
- Migrate packages in dependency order (leaf packages first)
- Use dependency graph to determine order
- 2-3 packages per session

**Categories**:
1. dds/ (16 packages, ~6-8 sessions)
2. drivers/ (4 packages, ~2 sessions)
3. loader/ (5 packages, ~2 sessions)
4. runtime/ (10+ packages, ~4-5 sessions)
5. framework/ (15+ packages, ~6-8 sessions)
6. service-clients/ (3+ packages, ~2 sessions)

### Example Session Template:
```markdown
## Session 3.X: Migrate <Package Category>

**Packages**:
- <package-1>
- <package-2>
- <package-3>

**Tasks**:
1. Generate BUILD files: `tsx scripts/generate-build-file.ts packages/<category>/<name>`
2. Review and adjust dependencies
3. Build: `bazel build //packages/<category>/...`
4. Test: `bazel test //packages/<category>/...`
5. Validate outputs
6. Commit: `feat(bazel): migrate <packages>`

**Validation**:
- [ ] All packages build
- [ ] All tests pass
- [ ] Outputs match fluid-build
```

---

## Phase 4: Build Integration & Optimization (5-8 sessions, 8-12 hours)

### Session 4.1: Create Root Build Targets
**Time**: 1-2 hours

Create convenient build targets in root BUILD.bazel:
```python
# Root BUILD.bazel
filegroup(
    name = "all_packages",
    srcs = [
        "//packages/common/...",
        "//packages/dds/...",
        "//packages/drivers/...",
        # ... all categories
    ],
)

alias(
    name = "build",
    actual = ":all_packages",
)
```

### Session 4.2: Jest Test Integration
**Time**: 1-2 hours

Create Bazel rules for Jest testing (more complex than Mocha).

### Session 4.3: Webpack Bundle Integration
**Time**: 2 hours

Integrate webpack bundles into Bazel build.

### Session 4.4: CI Integration
**Time**: 2 hours

Update CI scripts to use Bazel commands.

### Session 4.5: Remote Caching Setup
**Time**: 2 hours

Configure remote build cache for CI/team builds.

### Session 4.6: Build Performance Optimization
**Time**: 2 hours

Profile builds, optimize targets, adjust concurrency.

### Session 4.7-4.8: Documentation & Developer Tooling
**Time**: 2-4 hours

Create migration guide, update developer docs, create helper scripts.

---

## Phase 5: Cleanup & Finalization (3-5 sessions, 4-8 hours)

### Session 5.1: Remove fluid-build
**Time**: 1-2 hours

1. Remove `fluidBuild.config.cjs`
2. Update package.json scripts to use Bazel
3. Remove fluid-build dependencies

### Session 5.2: Update Documentation
**Time**: 1-2 hours

Update all READMEs, CONTRIBUTING.md, developer guides.

### Session 5.3: Team Training Materials
**Time**: 2 hours

Create training docs, video, FAQ.

### Session 5.4: Final Validation
**Time**: 2 hours

Complete end-to-end build and test, validate all packages.

### Session 5.5: Migration Retrospective
**Time**: 1-2 hours

Document lessons learned, challenges, future improvements.

---

## Migration Scripts Reference

### Core Scripts to Create

All in `bazel-migration/scripts/`:

1. **generate-build-file.ts** - Generate BUILD.bazel for a package
2. **package-mapper.ts** - Create package name → Bazel target mapping
3. **validate-outputs.ts** - Compare Bazel vs fluid-build outputs
4. **migrate-package.ts** - Full migration workflow for one package
5. **dependency-graph.ts** - Analyze and visualize package dependencies
6. **batch-migrate.ts** - Migrate multiple packages in dependency order

### Usage Examples

```bash
# Generate BUILD file
tsx scripts/generate-build-file.ts packages/common/core-interfaces

# Migrate a package (full workflow)
tsx scripts/migrate-package.ts packages/common/core-interfaces

# Batch migrate a category
tsx scripts/batch-migrate.ts packages/common

# Validate outputs
tsx scripts/validate-outputs.ts packages/common/core-interfaces
```

---

## Session Checklist Template

Copy this for each session:

```markdown
## Session X.Y: <Title>

**Date**: YYYY-MM-DD
**Duration**: X hours
**Packages**: <list>

### Pre-session
- [ ] Previous session complete
- [ ] Git status clean
- [ ] Dependencies understood

### Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Validation
- [ ] Builds successfully
- [ ] Tests pass
- [ ] Outputs validated

### Deliverables
- [ ] Code committed
- [ ] Documentation updated
- [ ] Notes recorded

### Issues Encountered
<document any issues>

### Next Session Prep
<notes for next session>
```

---

## Risk Management & Questions

### Known Risks

1. **API Extractor Integration**: May need custom Bazel rules
2. **Dual Compilation**: ESM + CJS pattern might need refinement
3. **External Dependencies**: Some npm packages may need special handling
4. **Test Framework Differences**: Jest integration more complex than Mocha
5. **Build Performance**: Initial builds may be slower until caching optimized

### Questions to Resolve Early

1. ❓ How should we handle API extraction in Bazel workflow?
2. ❓ What's the expected behavior for `pnpm-lock.yaml` with Bazel?
3. ❓ Should we use Bazel for all scripts, or keep some as npm scripts?
4. ❓ How to handle packages with native dependencies?
5. ❓ Remote cache location and configuration for team?

---

## Success Metrics

### Phase 1 (PoC) Success Criteria
- ✅ 3 packages build with Bazel
- ✅ Outputs identical to fluid-build
- ✅ Tests pass
- ✅ Build scripts repeatable
- ✅ Performance acceptable (within 20% of fluid-build)

### Phase 2-3 (Migration) Success Criteria
- ✅ All packages build with Bazel
- ✅ All tests pass
- ✅ CI pipeline using Bazel
- ✅ Developer documentation complete

### Phase 4-5 (Optimization) Success Criteria
- ✅ Build performance ≥ fluid-build
- ✅ Remote caching operational
- ✅ fluid-build removed
- ✅ Team trained and productive

---

## Estimated Timeline Summary

| Phase | Sessions | Hours | Duration |
|-------|----------|-------|----------|
| Phase 0: Setup | 2 | 2-4h | 2-3 days |
| Phase 1: PoC | 6 | 8-12h | 1-2 weeks |
| Phase 2: Expansion | 10-15 | 15-25h | 2-3 weeks |
| Phase 3: Core Migration | 20-30 | 30-50h | 4-6 weeks |
| Phase 4: Integration | 5-8 | 8-12h | 1-2 weeks |
| Phase 5: Cleanup | 3-5 | 4-8h | 1 week |
| **Total** | **46-66** | **67-111h** | **8-12 weeks** |

*Assumes 1-2 hour sessions, one session per day*

---

## Next Session

**Session 0.1**: Bazel Installation & Project Structure Setup
**Estimated Time**: 1-2 hours
**Prerequisites**: Read this plan, understand Bazel basics
**Outcome**: Bazel installed, migration tooling structure ready

---

**Document Version**: 1.0
**Last Updated**: 2025-10-27
**Author**: Bazel Migration Planning
**Status**: Ready for execution
