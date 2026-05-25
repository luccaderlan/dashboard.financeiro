import { readFileSync, statSync } from 'node:fs';
import { transform } from 'esbuild';

const files = [
  'src/context/AuthContext.jsx',
  'tailwind.config.js',
  'src/layouts/AppLayout.jsx',
  'src/components/Sidebar.jsx',
  'src/components/ui/Card.jsx',
  'src/pages/DashboardPage.jsx',
  'src/App.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/RegisterPage.jsx',
  'src/pages/ForgotPasswordPage.jsx',
  'src/pages/ResetPasswordPage.jsx',
  'src/pages/TermsPage.jsx',
  'src/components/Modal.jsx',
];

let failed = 0;
for (const f of files) {
  try {
    const src = readFileSync(f, 'utf8');
    const loader = f.endsWith('.jsx') ? 'jsx' : 'js';
    await transform(src, { loader, target: 'es2022', format: 'esm' });
    console.log('OK ', f);
  } catch (err) {
    failed++;
    console.error('FAIL', f, '-', err.message?.split('\n')[0] || err);
    if (err.errors) {
      for (const e of err.errors) console.error('  ', e.text, 'at line', e.location?.line);
    }
  }
}
process.exit(failed ? 1 : 0);
