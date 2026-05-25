import { readFileSync } from 'node:fs';
import { parse } from '@babel/parser';

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
    const plugins = f.endsWith('.jsx') ? ['jsx'] : [];
    parse(src, { sourceType: 'module', plugins });
    console.log('OK ', f);
  } catch (err) {
    failed++;
    console.error('FAIL', f, '-', err.message);
  }
}
process.exit(failed ? 1 : 0);
