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

require('./server/index.js');


