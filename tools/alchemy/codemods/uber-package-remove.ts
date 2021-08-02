import type { Collection, ImportDeclaration, ImportSpecifier, Transform } from "jscodeshift";
import { packagesToUberPackage, specifiersToPackages, specifiersToUberPackage, uberPackageToPackages } from "./lib";


const transform: Transform = (fileInfo, api, options) => {
    const js = api.jscodeshift;
    const toUber: bool  = options.uber || false;

	// console.log(JSON.stringify(options));
    
    const sourcePackages = [...(toUber ? packagesToUberPackage : uberPackageToPackages).keys()];
    const targetPackages = toUber ? specifiersToUberPackage : specifiersToPackages;

    // console.log(sourcePackages);
    // console.log(targetPackages);

	const makeSpecifier = (imported, local) => {
		return js.importSpecifier(js.identifier(imported), js.identifier(local));	
	};

    const getFirstPath = (root: Collection) => {
        const c = root.find(js.Program);
        if (c.length > 0) {
            return c.get("body", 0);
        }
    };

	const getFirstNode = (root: Collection) => {
		return getFirstPath(root).node;
	};

    const filterSourceImports = (root: Collection): Collection<ImportDeclaration> => {
        return root
            .find(js.ImportDeclaration)
            .filter((path) => {
                // Include only imports from source packages
                return sourcePackages.includes(path.value.source.value as string);
            });
    };

    // Save the comments attached to the first node
    const initialAST = js(fileInfo.source);
    const firstNode = getFirstNode(initialAST);
    const { comments } = firstNode;

    const finalImportMap = new Map<string, ImportSpecifier[]>();
	const rewrittenImports: ImportDeclaration[] = [];
    filterSourceImports(initialAST)
        .find(js.ImportSpecifier)
        .forEach((path, i, paths) => {
            const specifier = path.value;
            const importedName = specifier.imported.name;
            const localName = specifier.local?.name;
            if (importedName !== localName) {
                api.report("Renamed import");
            }

            if (targetPackages.has(importedName)) {
                const newPkg = targetPackages.get(importedName);
                
                if (finalImportMap.has(newPkg)) {
                    finalImportMap.get(newPkg).push(makeSpecifier(importedName, localName));
                } else {
                    finalImportMap.set(newPkg, [makeSpecifier(importedName, localName)]);
                }
                // api.report(`WRITING: import {${importedName}} from "${newPkg}";`);
            } else {
                api.report(`MISSING: ${importedName}`);
            }
        });

	for(const [pkg, specifiers] of finalImportMap) {
		rewrittenImports.push(js.importDeclaration(specifiers, js.literal(pkg)));
	}
    //const accum: ImportDeclaration[] = [];
    //for (const [pkg, importedNames] of finalImportMap) {
        // console.log(`[pkg=${pkg}, elements=(${importedNames.length})]`)
        //const specifiers: ImportSpecifier[] = [];
        //for (const importName of importedNames) {
        //    specifiers.push(js.importSpecifier(
        //        js.identifier(importName), js.identifier(importName))
        //    );
       // }
        // console.log(`length: ${specifiers.length}`)
        //accum.push(js.importDeclaration(specifiers, js.literal(pkg)));
    //}

	if(rewrittenImports.length > 0) {
		rewrittenImports[0].comments = comments;
	}
	
    // js.importDeclaration(js.ImportSpecifier,)
    const outSrc = filterSourceImports(initialAST).remove().toSource();
    //console.log(initialAST.length);
    const output = js(outSrc) // getFirstPath(js(outSrc))
    	.find(js.Statement)
    	.at(0)
    	//.body
    	//.get("body")
    	.insertBefore(rewrittenImports);
         //.at(0).paths()[0] // this is a NodePath
         //.get()
         //.unshift(...accum);
	//console.log(output);
    // console.log(sourceImports.toSource())
    //const sourceImports = filterSourceImports(initialAST)
        //.replaceWith(accum);
    // console.log(`${fileInfo.path}: ${JSON.stringify(accum, undefined, 2)}`);

    // If the first node has been modified or deleted, reattach the comments
    //const firstNode2 = getFirstNode(js(outSrc));
    // console.log(firstNode2);
    //if (firstNode2 !== firstNode) {
    //    firstNode2.comments = comments;
    //}

    // const output = imports
    //     .remove()
    //     .replaceWith(newImports.paths());

    // const output = sourceImports.nodes();
    // console.log(JSON.stringify(output));
    //return sourceImports.toSource();

    return output.toSource();
}

module.exports = transform;
