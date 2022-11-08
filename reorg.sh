# git checkout -b pressurize

mkdir -p client

git mv packages/ client/packages/
git add .
git commit -m 'Pressurize: git mv packages client/packages'

git mv examples/ client/examples/
git add .
git commit -m 'Pressurize: git mv examples client/examples'

git mv experimental/ client/experimental/
git add .
git commit -m 'Pressurize: git mv experimental client/experimental'

cp package.json client/package.json
git mv lerna.json client/lerna.json
git mv package-lock.json client/package-lock.json
git mv lerna-package-lock.json client/lerna-package-lock.json
git add .
git commit -m 'Pressurize: git mv lerna and package.json'

echo "Updating api-extractor paths"
for file in $(fd package.json --type file); do
    sd '../../../_api-extractor-temp/' '../../../../_api-extractor-temp/' "$file"
    sd ' --typescript-compiler-folder ../../../node_modules/typescript' '' "$file"
done

for file in $(fd api-extractor.json --type file client); do
    jq '. * {"apiReport": { "reportFolder": "<projectFolder>/../../../../api-report/" }, "docModel": {"apiJsonFilePath": "<projectFolder>/../../../../_api-extractor-temp/doc-models/<unscopedPackageName>.api.json"}}' "$file" > api-extractor2.json
    rimraf api-extractor.json
    mv api-extractor2.json "$file"
done

git add .
git commit -m 'Pressurize: update api-extractor paths'

echo "Updating fluid-build client path"
jq '. * {"fluidBuild": {"repoPackages": {"client":{"directory": "client"}}}}' package.json > package2.json
rimraf package.json
mv package2.json package.json
git add .
git commit -m 'Pressurize: Update fluid-build client path'

# jq '. + {"packages": [ "examples/**", "experimental/**", "packages/**", "server/routerlicious/packages/gitresources/", "server/routerlicious/packages/local-server/", "server/routerlicious/packages/protocol-base/", "server/routerlicious/packages/protocol-definitions/"]}' lerna.json > lerna2.json
# jq '. + {"packages": []}' lerna.json > lerna2.json
# jq 'del(.packages)' lerna.json > lerna2.json
# rimraf lerna.json
# mv lerna2.json lerna.json
