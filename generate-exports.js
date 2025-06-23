// generate-exports.js
import fs from "fs";
import path from "path";

const pkgPath = new URL("./package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

const componentsDir = new URL( "./src", import.meta.url );
const utilsDir = new URL( "./src/utils", import.meta.url );
const files = fs
  .readdirSync(componentsDir)
  .filter( file => file.endsWith( ".js" ) );
const utils = fs
  .readdirSync(utilsDir)
  .filter( file => file.endsWith( ".js" ) );

// Base export (index.js)
const exportsField = {};

// Añadir cada componente individual
for (const file of files) {
  const pathName = path.basename( file ).replace( /\.js$/, "" );
  const fileName = path.basename(file);
  exportsField[`./${pathName}`] = {
    import: `./src/${fileName}`,
  };
}

for (const file of utils) {
  const pathName = path.basename(file).replace(/\.js$/, "");
  const fileName = path.basename(file);
  exportsField[`./utils/${pathName}`] = {
    import: `./src/utils/${fileName}`,
  };
}

// Actualizar package.json
packageJson.exports = exportsField;

fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2));
console.log("✅ Exports actualizados en package.json");
