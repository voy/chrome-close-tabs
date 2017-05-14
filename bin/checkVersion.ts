import * as fs from 'fs';
import * as path from 'path';

const PACKAGE_JSON = path.resolve(__dirname, '../package.json');
const MANIFEST_JSON = path.resolve(__dirname, '../manifest.json');

function getVersionFromFile(filename): string {
    const fileContents = fs.readFileSync(filename).toString();
    return JSON.parse(fileContents).version;
}

const packageVersion = getVersionFromFile(PACKAGE_JSON);
const manifestVersion = getVersionFromFile(MANIFEST_JSON);

if (packageVersion !== manifestVersion) {
    console.error(`Version mismatch between package.json (${packageVersion}) and manifest.json (${manifestVersion})!`);
    process.exit(1);
}

