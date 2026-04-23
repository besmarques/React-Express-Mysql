const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the current package.json
const currentPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const packageName = process.env.DIST_PACKAGE_NAME || currentPackageJson.name;

// Define the content of the new package.json
const packageJson = {
    name: packageName,
    version: currentPackageJson.version,
    main: "./server.js",
    scripts: {
        start: "node ./server.js"
    },
    dependencies: currentPackageJson.dependencies
};

// Write the package.json file to the dist folder
fs.writeFileSync(path.join(__dirname, 'dist', 'package.json'), JSON.stringify(packageJson, null, 2));
