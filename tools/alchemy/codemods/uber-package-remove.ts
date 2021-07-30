import type { Transform } from "jscodeshift";
import { specifiersToPackages, specifiersToUberPackage, uberPackageToPackages } from "./lib";

// export const removeUberPkg =
// }

const transform: Transform = (fileInfo, api, options) => {
    const js = api.jscodeshift;
    const toUber = options.toUber || false;
    const sourcePackages = [...(toUber ? specifiersToPackages : uberPackageToPackages).keys()];
    const targetPackages = toUber ? specifiersToUberPackage : specifiersToPackages;

    const finalImportMap = new Map<string, string[]>();

    const imports = js(fileInfo.source)
        .find(js.ImportDeclaration)
        .filter((path) => {
            // Include only imports from source packages
            return sourcePackages.includes(path.value.source.value as string);
        });

    imports
        .find(js.ImportSpecifier)
        .forEach((path, i, paths) => {
            const specifier = path.value;
            const importedName = specifier.imported.name;
            const localName = specifier.local?.name;
            if (importedName !== localName) {
                api.stats("Renamed import");
            }

            if (targetPackages.has(importedName)) {
                const newPkg = targetPackages.get(importedName);
                if (finalImportMap.has(newPkg)) {
                    finalImportMap.get(newPkg).push(importedName);
                } else {
                    finalImportMap.set(newPkg, [importedName]);
                }
                // api.report(`WRITING: import {${importedName}} from "${newPkg}";`);
            } else {
                api.report(`MISSING: ${importedName}`);
            }
        });

    const output = imports.remove();

    return output.toSource();

    // .toSource();
}

module.exports = transform;
