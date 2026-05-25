import { readFileSync } from 'node:fs';
import { parse } from '@babel/parser';

const files = [
  'src/context/AuthContext.jsx',
  'src/styles/tailwind.css',
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
    if (f.endsWith('.css')) {
      // Just check it's non-empty + has @tailwind directives
      if (!src.includes('@tailwind')) throw new Error('missing @tailwind directives');
      console.log('OK  (css)', f);
      continue;
    }
    parse(src, {
      sourceType: 'module',
      plugins: ['jsx'],
      allowImportExportEverywhere: false,
    });
    console.log('OK       ', f);
  } catch (err) {
    failed++;
    console.error('FAIL     ', f, '-', err.message);
  }
}
process.exit(failed > 0 ? 1 : 0);
