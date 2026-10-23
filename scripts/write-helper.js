const fs = require('fs');
const path = require('path');
const [targetPath, b64] = process.argv.slice(2);
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(targetPath, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
console.log('Successfully saved:', targetPath);