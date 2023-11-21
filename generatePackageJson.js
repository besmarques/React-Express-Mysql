const fs = require('fs');
const path = require('path');

// Read the current package.json
const currentPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

// Define the content of the new package.json
const packageJson = {
    name: "my-app",
    version: "1.0.0",
    main: "./server.js",
    scripts: {
        start: "node ./server.js"
    },
    dependencies: currentPackageJson.dependencies
};

// Write the package.json file to the dist folder
fs.writeFileSync(path.join(__dirname, 'dist', 'package.json'), JSON.stringify(packageJson, null, 2));