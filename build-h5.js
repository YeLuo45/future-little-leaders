const { build } = require('vite');
const path = require('path');

async function doBuild() {
  try {
    await build({
      configFile: path.resolve(__dirname, 'vite.config.js')
    });
    console.log('Build completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

doBuild();