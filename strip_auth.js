const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'backend', 'src', 'routes');
const files = fs.readdirSync(dir);

for (let file of files) {
    if (!file.endsWith('.js')) continue;
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove authenticate from parameters
    content = content.replace(/,\s*authenticate/g, '');
    content = content.replace(/authenticate,\s*/g, '');
    
    // Remove authorize from parameters
    content = content.replace(/,\s*authorize\([^)]+\)/g, '');
    content = content.replace(/authorize\([^)]+\),\s*/g, '');
    
    // Remove import statements if any
    content = content.replace(/const\s+\{.*?(authenticate|authorize).*?\}\s*=\s*require\('\.\.\/middleware\/auth'\);\r?\n/g, '');
    content = content.replace(/const\s+\{authenticate\}\s*=\s*require\('\.\.\/middleware\/auth'\);\r?\n/g, '');
    
    fs.writeFileSync(filePath, content);
}
console.log('Stripped auth from routes.');
