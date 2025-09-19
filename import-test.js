// Simple test to check if all imports resolve correctly
const fs = require('fs');
const path = require('path');

// Read all TypeScript/TSX files and extract import statements
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkImports() {
  console.log('🔍 Checking all imports...\n');
  
  const files = findTsFiles('./src');
  let hasErrors = false;
  let totalImports = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
      
      if (importMatch) {
        totalImports++;
        const importPath = importMatch[1];
        
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          // Relative import - check if file exists
          const resolvedPath = path.resolve(path.dirname(file), importPath);
          const possiblePaths = [
            resolvedPath + '.ts',
            resolvedPath + '.tsx',
            resolvedPath + '/index.ts',
            resolvedPath + '/index.tsx',
            resolvedPath
          ];
          
          const exists = possiblePaths.some(p => fs.existsSync(p));
          
          if (!exists) {
            console.error(`❌ ${file}:${i+1} - Cannot resolve: ${importPath}`);
            hasErrors = true;
          }
        } else if (importPath.startsWith('@/')) {
          // Alias import - check src folder
          const srcPath = importPath.replace('@/', './src/');
          const resolvedPath = path.resolve(srcPath);
          const possiblePaths = [
            resolvedPath + '.ts',
            resolvedPath + '.tsx',
            resolvedPath + '/index.ts',
            resolvedPath + '/index.tsx',
            resolvedPath
          ];
          
          const exists = possiblePaths.some(p => fs.existsSync(p));
          
          if (!exists) {
            console.error(`❌ ${file}:${i+1} - Cannot resolve alias: ${importPath}`);
            hasErrors = true;
          }
        }
      }
    }
  }
  
  if (hasErrors) {
    console.error(`\n💥 Found import errors!`);
    process.exit(1);
  } else {
    console.log(`✅ All ${totalImports} imports resolve correctly!`);
    console.log(`📁 Checked ${files.length} files`);
  }
}

checkImports();