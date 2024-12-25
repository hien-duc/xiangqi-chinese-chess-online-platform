const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../xiangqi-wasm/pkg');
const targetDir = path.join(__dirname, '../public/xiangqi-wasm/pkg');

async function copyWasmFiles() {
  try {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    
    // Copy WASM files
    await fs.copy(sourceDir, targetDir, {
      filter: (src) => {
        return src.endsWith('.wasm') || src.endsWith('.js');
      }
    });
    
    console.log('WASM files copied successfully!');
  } catch (err) {
    console.error('Error copying WASM files:', err);
    process.exit(1);
  }
}

copyWasmFiles();
