import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-finance-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/login" className="text-finance-accent hover:opacity-80 text-sm transition">
            ← Voltar
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-finance-text mb-2">Termos de Uso e Privacidade</h1>
        <p className="text-finance-muted text-sm mb-8">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-finance-text text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">1. Sobre o MeuControle</h2>
            <p>
              O MeuControle é um dashboard financeiro pessoal que permite registrar entradas,
              saídas, dívidas, empréstimos, metas e orçamentos. O serviço é oferecido como
              ferramenta de organização pessoal e não constitui assessoria financeira profissional.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">2. Dados que coletamos</h2>
            <p className="mb-2">Coletamos apenas o necessário para o funcionamento do serviço:</p>
            <ul className="list-disc list-inside space-y-1 text-finance-muted">
              <li>Nome e e-mail (cadastro)</li>
              <li>Senha (armazenada de forma criptografada, nunca em texto puro)</li>
              <li>Dados financeiros que você insere voluntariamente</li>
            </ul>
            <p className="mt-2 text-finance-muted">
              Não coletamos dados de localização, não vendemos seus dados e não exibimos anúncios.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">3. Como seus dados são protegidos</h2>
            <ul className="list-disc list-inside space-y-1 text-finance-muted">
              <li>Senhas criptografadas com bcrypt</li>
              <li>Comunicação via HTTPS</li>
              <li>Tokens de sessão com expiração automática</li>
              <li>Banco de dados em infraestrutura segura (Supabase)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">4. Seus direitos (LGPD)</h2>
            <p className="mb-2">
              De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-1 text-finance-muted">
              <li>Acessar seus dados a qualquer momento</li>
              <li>Corrigir dados incorretos</li>
              <li>Excluir sua conta e todos os seus dados permanentemente</li>
              <li>Portabilidade dos seus dados</li>
            </ul>
            <p className="mt-2 text-finance-muted">
              Para exercer esses direitos, acesse Configurações → Excluir conta, ou entre em
              contato pelo e-mail de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">5. Retenção de dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta,
              todos os dados são removidos permanentemente e de forma irreversível em até 24 horas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">6. Alterações nestes termos</h2>
            <p>
              Podemos atualizar estes termos ocasionalmente. Alterações significativas serão
              comunicadas por e-mail com antecedência mínima de 15 dias.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-finance-text mb-3">7. Contato</h2>
            <p>
              Dúvidas sobre privacidade ou seus dados? Entre em contato:{' '}
              <a href="mailto:contato@meucontrole.com.br" className="text-finance-accent hover:opacity-80">
                contato@meucontrole.com.br
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
