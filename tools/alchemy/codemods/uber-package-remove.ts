import type { Collection, ImportDeclaration, ImportSpecifier, Transform } from "jscodeshift";
import { specifiersToPackages, specifiersToUberPackage, uberPackageToPackages } from "./lib";

// export const removeUberPkg =
// }

const transform: Transform = (fileInfo, api, options) => {
    const js = api.jscodeshift;
    const toUber = options.toUber || false;
    const sourcePackages = [...(toUber ? specifiersToPackages : uberPackageToPackages).keys()];
    const targetPackages = toUber ? specifiersToUberPackage : specifiersToPackages;

    const initialAST = js(fileInfo.source);
    const finalImportMap = new Map<string, string[]>();

    const getFirstNode = (root: Collection) => {
        const c = root.find(js.Program);
        if (c.length > 0) {
            return c.get("body", 0).node;
        }
    }

    const filterSourceImports = (root: Collection): Collection<ImportDeclaration> => {
        return root
            .find(js.ImportDeclaration)
            .filter((path) => {
                // Include only imports from source packages
                return sourcePackages.includes(path.value.source.value as string);
            });
    }

    // Save the comments attached to the first node
    const firstNode = getFirstNode(initialAST);
    const { comments } = firstNode;

    filterSourceImports(initialAST)
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

    // const output = imports.remove();
    // const statements: string[] = [];
    // for (const [pkg, importedNames] of finalImportMap) {
    //     statements.push(`import { ${importedNames.join()} } from "${pkg}";`);
    // }

    // // api.report(statements.join("\n"));
    // const newImports = js(statements.join("\n"));
    // api.report(JSON.stringify(newImports.nodes()));
    // output.insertBefore(newImports);

    // const importDeclarationNodes = js(sourceImports.toSource())
    //     .find(js.ImportDeclaration)
    //     .nodes();

    // for (const node of importDeclarationNodes) {
    //     console.log(node.specifiers);
    // }

    console.log(finalImportMap);
    const accum: ImportDeclaration[] = [];
    for (const [pkg, importedNames] of finalImportMap) {
        console.log(`[pkg=${pkg}, elements=(${importedNames.length})]`)
        const specifiers: ImportSpecifier[] = [];
        for (const importName of importedNames) {
            specifiers.push(js.importSpecifier(
                js.identifier(importName), js.identifier(importName))
            );
        }
        console.log(`length: ${specifiers.length}`)
        accum.push(js.importDeclaration(specifiers, js.literal(pkg)));
    }

    // js.importDeclaration(js.ImportSpecifier,)
    // const output = js(fileInfo.source)
    //     .find(js.ImportDeclaration)
    //     .at(-1)
    //     .insertAfter(accum);

    // console.log(sourceImports.toSource())
    const sourceImports = filterSourceImports(initialAST)
        .replaceWith(accum);
    // console.log(`${fileInfo.path}: ${JSON.stringify(accum, undefined, 2)}`);

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode(initialAST);
    // console.log(firstNode2);
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    // const output = imports
    //     .remove()
    //     .replaceWith(newImports.paths());

    // const output = sourceImports.nodes();
    // console.log(JSON.stringify(output));
    return sourceImports.toSource();

    // .toSource();
}

module.exports = transform;
