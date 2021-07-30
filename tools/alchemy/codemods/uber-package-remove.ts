import type { ASTPath, Transform } from "jscodeshift";
import { pkgMapReverse, uberMap } from "./lib";

// type Version = string;
// type Pkg = [string, Version]


export const removeUberPkg =
}

const transform: Transform = (fileInfo, api, options) => {
    const { jscodeshift } = api;
    const toUber = options.toUber || true;
    return jscodeshift(fileInfo.source)
        .find(jscodeshift.ImportDeclaration)
        .forEach((path, i, paths) => {
            const declaration = path.value;
            const currentSourcePkg: string = declaration.source.value as string;

            // api.stats(`source-${source}`);
            if (uberMap.has(currentSourcePkg)) {
                for (const specifier of declaration.specifiers) {
                    api.stats(specifier.type);
                    switch (specifier.type) {
                        case "ImportSpecifier":
                            const importedName = specifier.imported.name;
                            const localName = specifier.local?.name;
                            if (importedName !== localName) {
                                api.stats("Renamed import");
                            }
                            if (pkgMapReverse.has(importedName)) {
                                const newPkg = pkgMapReverse.get(importedName);
                                api.report(`FOUND:   import {${importedName}} from "${currentSourcePkg}";`);
                                api.report(`WRITING: import {${importedName}} from "${newPkg}";`);

                                declaration.source.value = newPkg;
                            } else {
                                api.stats(`MISSING:${importedName}`);
                            }
                            break;
                        default:
                            break;
                    }
                }
            })
        .toSource();
}

module.exports = transform;
