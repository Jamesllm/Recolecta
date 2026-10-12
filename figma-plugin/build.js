// Une los módulos de src/ en code.js (el archivo que carga Figma).
// Uso: node build.js
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
const banner = '// Archivo generado por build.js a partir de src/. No editar a mano.\n';
const out = banner + files.map(f => `// ---- ${f} ----\n` + fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(__dirname, 'code.js'), out);
console.log(`code.js generado (${files.length} módulos, ${(out.length / 1024).toFixed(1)} KB)`);
