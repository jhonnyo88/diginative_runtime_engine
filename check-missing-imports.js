const fs = require('fs');
const path = require('path');

// Find all imports in the codebase
const getAllImports = (dir) => {
  const imports = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory() && file.name \!== 'node_modules') {
      imports.push(...getAllImports(path.join(dir, file.name)));
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
      const relativeImports = content.match(/import.*from\s+['"][\.\/][^'"]*['"]/g) || [];
      
      relativeImports.forEach(imp => {
        const filePath = path.join(dir, file.name);
        const importPath = imp.match(/from\s+['"]([^'"]*)['"]/)[1];
        imports.push({ file: filePath, import: importPath });
      });
    }
  });
  
  return imports;
};

// Check if imports resolve to actual files
const imports = getAllImports('src');
const broken = [];

imports.forEach(({ file, import: imp }) => {
  const fileDir = path.dirname(file);
  const resolvedPath = path.resolve(fileDir, imp);
  
  const exists = fs.existsSync(resolvedPath + '.ts') || 
                 fs.existsSync(resolvedPath + '.tsx') ||
                 fs.existsSync(resolvedPath + '/index.ts') ||
                 fs.existsSync(resolvedPath + '/index.tsx');
  
  if (\!exists) {
    broken.push({ file: file.replace('src/', ''), import: imp, resolved: resolvedPath });
  }
});

console.log('BROKEN IMPORTS FOUND:');
broken.forEach(b => {
  console.log(`${b.file} -> ${b.import}`);
});

console.log(`\nTotal broken imports: ${broken.length}`);
