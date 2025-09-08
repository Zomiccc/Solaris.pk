// Prevent starting the server on Vercel (install phase or runtime) since we deploy static frontend
if (process.env.VERCEL && !process.env.VERCEL_DEV) {
  console.log('Vercel environment detected. Skipping server start.');
  process.exit(0);
}

// Prevent starting the server during certain CI/host install phases (fallback detection)
if (process.env.NPM_CONFIG_WORKSPACE || process.env.npm_config_argv) {
  try {
    const argv = JSON.parse(process.env.npm_config_argv);
    const original = argv && argv.original ? argv.original.join(' ') : '';
    if (/install|preinstall|postinstall/.test(original)) {
      console.log('Detected install phase. Skipping server start.');
      process.exit(0);
    }
  } catch (_) {
    // ignore parse errors and continue
  }
}

const fs = require('fs');
const path = require('path');

// Build client at runtime if missing (Render ephemeral builds edge-case)
try {
  const buildIndex = path.resolve(__dirname, 'client', 'build', 'index.html');
  if (!fs.existsSync(buildIndex)) {
    console.log('client/build/index.html not found; running client build...');
    require('child_process').execSync('npm --prefix client install && npm --prefix client run build', {
      stdio: 'inherit'
    });
  }
} catch (e) {
  console.log('Runtime client build skipped/error:', e && e.message ? e.message : e);
}

require('./server/index.js');


