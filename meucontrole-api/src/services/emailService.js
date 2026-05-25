/**
 * Serviço de envio de e-mails via Resend.
 * https://resend.com — plano gratuito: 3.000 e-mails/mês.
 *
 * Em desenvolvimento, os e-mails são apenas logados no console
 * (sem precisar de conta Resend configurada).
 */

import { env } from '../config/env.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendEmail({ to, subject, html }) {
  // Em desenvolvimento sem RESEND_API_KEY, só loga no console
  if (!env.RESEND_API_KEY) {
    console.log('\n📧 [DEV] E-mail que seria enviado:');
    console.log(`   Para: ${to}`);
    console.log(`   Assunto: ${subject}`);
    console.log(`   Conteúdo: ${html.replace(/<[^>]*>/g, '').trim().slice(0, 200)}...\n`);
    return { id: 'dev-mock-id' };
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Falha ao enviar e-mail: ${error.message ?? response.statusText}`);
  }

  return response.json();
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  return sendEmail({
    to,
    subject: 'Redefinição de senha — MeuControle',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: #1e40af; padding: 28px 32px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">MeuControle</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 18px;">Olá, ${name}</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para criar uma nova senha.
            </p>
            <a href="${resetUrl}"
               style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Redefinir minha senha
            </a>
            <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0; line-height: 1.6;">
              Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição,
              ignore este e-mail — sua senha permanece a mesma.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Se o botão não funcionar, copie e cole este link no navegador:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
