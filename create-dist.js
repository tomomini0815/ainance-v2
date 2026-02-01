const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
  console.log('dist directory created');
} else {
  console.log('dist directory already exists');
}