'use strict';

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// Find the compiled server file
const possiblePaths = [
  path.resolve(__dirname, 'dist', 'src', 'server.js'),
  path.resolve(__dirname, 'dist', 'server.js'),
];

const targetPath = possiblePaths.find((p) => fs.existsSync(p));

if (!targetPath) {
  console.error(
    `[Passenger Error] Could not find compiled backend server file.\n` +
    `Checked paths:\n${possiblePaths.map((p) => `  - ${p}`).join('\n')}\n` +
    `Please make sure to run 'npm run build' inside the Backend directory so that the 'dist' folder is created.`
  );
  process.exit(1);
}

// CloudLinux/Passenger loads its startup file through CommonJS.
// Dynamically import the real ES module server entry point using file URL.
import(pathToFileURL(targetPath).href).catch((error) => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});

