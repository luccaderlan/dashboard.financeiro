# Dashboard Financeiro

Este projeto mantem duas entradas durante a migracao gradual:

- `index.html`: dashboard legado funcional e preservado como fallback.
- `react.html`: ambiente React atual usado para validar a migracao.
- `app.html`: entrada React preparada para futuramente virar a principal, sem substituir o legado ainda.

## Rodar o dashboard legado

Abra `index.html` diretamente no navegador.

## Rodar o dashboard React

```bash
npm run dev:react
```

Esse comando abre `/react.html` no Vite.

## Rodar a entrada React futura

```bash
npm run dev:react-main
```

Esse comando abre `/app.html`, que usa a mesma aplicacao React e ainda nao substitui o legado.

## Gerar build React

```bash
npm run build:react
```

O build e gerado em `dist-react` com assets relativos, para facilitar hospedagem estatica simples. As rotas React usam `HashRouter`, entao URLs como `#/`, `#/fluxo`, `#/dividas`, `#/emprestimos`, `#/metas`, `#/recorrencias`, `#/orcamentos`, `#/relatorios` e `#/configuracoes` continuam funcionando sem configuracao de servidor.

## Pre-visualizar build React

```bash
npm run preview:react
```

## Camada de persistencia

A aplicacao React consome dados pelo provider em `src/services/persistence/storageProvider.js`.
Hoje a implementacao ativa e `localStorageAdapter`, preservando o formato legado do `localStorage`.

Futuramente, uma integracao com Supabase, API REST ou IndexedDB deve implementar a mesma interface:

- `read(key)`
- `write(key, value)`
- `remove(key)`

Depois disso, a aplicacao pode trocar o adaptador com `setStorageAdapter()` sem reescrever os modulos React.

## Publicar MVP React

Para publicar a versao React em uma hospedagem estatica simples, como Hostinger:

1. Gere o build:

```bash
npm run build:react
```

2. Envie para a hospedagem o conteudo da pasta `dist-react`:

- `app.html`
- `react.html`
- pasta `assets`

3. Use `app.html` como entrada principal do MVP React.

Se os arquivos forem enviados para a raiz publica do dominio, acesse:

```text
https://seudominio.com/app.html
```

As rotas internas usam hash, por exemplo:

```text
https://seudominio.com/app.html#/metas
```

O `index.html` legado permanece preservado como fallback e nao precisa ser removido.

## Sistema de Notificações

O MeuControle gera notificações localmente, com base nos dados salvos no `localStorage`. Não há servidor ou push externo. As notificações são recalculadas a cada renderização relevante do dashboard.

### Como funcionam

O fluxo é:

1. O `DashboardProvider` carrega todos os dados financeiros (dívidas, empréstimos, metas, fluxo, orçamentos, recorrências).
2. O hook `useNotifications` (`src/hooks/useNotifications.js`) consome esses dados via `useDashboardContext()`.
3. O hook chama `generateNotifications()` (`src/services/notificationsService.js`), que aplica regras puras sobre os dados.
4. O componente `NotificationBell` (`src/components/NotificationBell.jsx`) exibe o badge com contagem de não lidas e a lista de notificações.

### Tipos de notificações

| Tipo       | Cor/ícone    | Significado                                        |
|------------|--------------|----------------------------------------------------|
| `critical` | Vermelho     | Situação urgente: dívida vencida, parcela em atraso, saldo negativo |
| `warning`  | Amarelo      | Atenção: dívida/parcela próxima do vencimento, gastos acima da média |
| `info`     | Azul         | Informativo: meta quase atingida (≥ 90%)           |
| `success`  | Verde        | Positivo: meta atingida (100%)                     |

### Regras de disparo

**Dívidas** (`debtNotifications`):
- `critical` — dívida vencida (data de vencimento anterior a hoje).
- `warning`  — dívida vence nos próximos 7 dias (inclusive hoje).
- Dívidas pagas (`isPaid = true`) são ignoradas.

**Empréstimos** (`loanNotifications`):
- `critical` — parcela em atraso (`nextDueDate` anterior a hoje).
- `warning`  — parcela vence nos próximos 7 dias.
- Empréstimos com `completed` ou `finished` são ignorados.
- Nota: a data de vencimento da próxima parcela precisa estar no campo `nextDueDate` do empréstimo para que essa regra dispare. Atualmente os empréstimos legados não armazenam esse campo explicitamente; a regra ficará inativa para esses registros.

**Metas** (`goalNotifications`):
- `success` — meta atingida (currentValue ≥ targetValue).
- `info`    — meta com progresso ≥ 90% (quase lá).

**Saldo** (`balanceNotifications`):
- `critical` — saldo total (entradas − saídas) negativo.

**Gastos acima da média** (`spendingNotifications`):
- `warning` — despesas do mês atual mais de 30% acima da média dos últimos 3 meses.
- Requer pelo menos 2 meses de histórico para disparar.

### Estado de lido/não lido

O hook controla quais notificações já foram lidas usando a chave `mc_notifications_read` no `localStorage` (array de IDs). As funções `markRead(id)` e `markAllRead()` atualizam esse estado.

Os IDs são determinísticos (ex: `debt-overdue-123`, `goal-done-abc`), então ao recarregar a página as notificações lidas continuam marcadas, e novas notificações aparecem como não lidas automaticamente.

### Arquivos relacionados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/services/notificationsService.js` | Lógica pura de geração de notificações (sem efeitos colaterais) |
| `src/hooks/useNotifications.js` | Hook React que conecta dados do contexto ao serviço |
| `src/components/NotificationBell.jsx` | Componente visual do sininho com badge e lista |
| `src/context/DashboardContext.jsx` | Fonte de todos os dados financeiros consumidos |

### Cuidados para manutenção futura

- Não alterar os IDs determinísticos das notificações sem migrar `mc_notifications_read` no `localStorage`.
- Se novos tipos de dados forem adicionados, adicionar a regra correspondente em `notificationsService.js` e passar o dado correto via `useNotifications.js`.
- O serviço é uma função pura — não faz `fetch`, não escreve no `localStorage`, não tem efeitos colaterais. Manter essa propriedade facilita testes e evita bugs.
- Ao passar `debts` e `loans` do contexto para o serviço, passar os arrays internos (`debts.activeDebts` e `loans.items`), não os objetos completos — o serviço espera arrays.

---

## Checklist de QA manual antes do deploy publico

Use este roteiro em `app.html` ou no preview do build antes de publicar para usuarios externos. O objetivo e validar experiencia real, consistencia dos dados e comportamento em desktop/mobile.

### Dados simulados sugeridos

Antes de testar, preencha o sistema com um conjunto pequeno, mas variado:

- Nome do usuario: `Ana Controle`.
- Entradas:
  - Salario, R$ 4500, categoria Salario, dia 05 do mes atual.
  - Freelance, R$ 800, categoria Extra, dia 12 do mes atual.
- Saidas:
  - Mercado, R$ 650, categoria Alimentacao, dia 08 do mes atual.
  - Internet, R$ 120, categoria Casa, dia 10 do mes atual.
  - Academia, R$ 99, categoria Saude, dia 15 do mes atual.
- Dividas:
  - Cartao Nubank, R$ 700, vencimento no mes atual.
  - Parcela notebook, R$ 350, vencimento em ate 7 dias.
  - Conta antiga, R$ 200, vencimento no mes anterior.
- Emprestimo:
  - Financiamento moto, R$ 8000, juros 2%, 24 parcelas, 4 pagas.
- Metas:
  - Reserva de emergencia, alvo R$ 5000, atual R$ 3200.
  - Viagem, alvo R$ 3000, atual R$ 500, prazo futuro.
- Categorias:
  - Criar uma categoria nova para Saidas: `Pets`.
  - Criar uma categoria nova para Metas: `Estudos`.
- Recorrencias:
  - Entrada mensal: Salario, R$ 4500.
  - Saida mensal: Internet, R$ 120.
  - Divida mensal: Aluguel, R$ 1500.
- Orcamentos:
  - Alimentacao, limite R$ 800, mes atual.
  - Casa, limite R$ 150, mes atual.

### Critico

- [ ] Onboarding aparece quando `meucontrole_welcomed` ainda nao existe.
- [ ] Onboarding salva o nome em `meucontrole_nome` e nao aparece novamente apos concluir.
- [ ] Dashboard exibe KPIs, proximas contas, analytics e insights sem erro.
- [ ] Criar entrada e saida atualiza lista, KPIs, graficos, relatorios e dashboard.
- [ ] Editar entrada/saida preserva o formato `{ id, tipo, desc, valor, data, cat }`.
- [ ] Excluir entrada/saida pede confirmacao e atualiza dashboard/analytics.
- [ ] Criar divida atualiza lista de abertas, proximas contas, KPIs e insights.
- [ ] Editar divida preserva `id`, `pago`, `pagaEm` quando existir e demais campos.
- [ ] Pagar divida move para pagas e atualiza KPIs, proximas contas, relatorios e analytics.
- [ ] Excluir divida ativa e paga pede confirmacao e nao quebra listas.
- [ ] Criar emprestimo calcula parcela e progresso corretamente.
- [ ] Editar emprestimo recalcula `pmt` com juros e sem juros.
- [ ] Excluir emprestimo pede confirmacao e atualiza resumo/tabela.
- [ ] Exportar backup gera arquivo JSON valido.
- [ ] Importar backup valido restaura Dashboard, Fluxo, Dividas, Emprestimos, Metas, Categorias, Recorrencias e Orcamentos.
- [ ] Importar JSON invalido mostra erro e nao quebra a tela.
- [ ] Recorrencia ativa gera registro do mes atual uma unica vez.
- [ ] Recarregar o app nao duplica registros ja gerados pela recorrencia.
- [ ] Recorrencia com data base futura nao gera registro antes do mes correto.
- [ ] Orcamento considera apenas saidas do mes, incluindo saidas recorrentes.
- [ ] Orcamento nao considera entradas no consumo.
- [ ] Insights mostram alertas coerentes para orcamento ultrapassado, divida em atraso, divida vencendo e meta proxima da conclusao.
- [ ] Alternar tema claro/escuro/auto nao altera dados financeiros.
- [ ] `index.html` legado continua lendo os dados criados/editados pelo React.

### Importante

- [ ] Categorias criadas aparecem nos formularios de Entradas/Saidas, Dividas e Metas.
- [ ] Editar categoria atualiza opcoes futuras sem quebrar registros antigos.
- [ ] Excluir categoria preserva registros antigos como fallback.
- [ ] Relatorio mensal calcula corretamente entradas, saidas, saldo, dividas pagas e dividas vencendo.
- [ ] Relatorio de mes sem dados mostra estado vazio adequado.
- [ ] Graficos continuam legiveis no tema claro e escuro.
- [ ] Toasts aparecem em salvar, editar, excluir, pagar, exportar e importar.
- [ ] Botoes de cancelar edicao voltam o formulario para modo criacao.
- [ ] Estados vazios aparecem em listas sem dados ou filtros sem resultado.
- [ ] Filtros por texto, data, valor e tipo/categoria funcionam sem travar a tela.
- [ ] Sidebar marca corretamente a rota ativa.
- [ ] Rotas `#/`, `#/fluxo`, `#/dividas`, `#/emprestimos`, `#/metas`, `#/recorrencias`, `#/orcamentos`, `#/relatorios` e `#/configuracoes` abrem diretamente.
- [ ] Backup importado preserva `meucontrole`, `meucontrole_nome`, `meucontrole_welcomed`, `meucontrole_theme`, `meucontrole_metas`, `meucontrole_categorias`, `meucontrole_recorrencias` e `meucontrole_orcamentos`.

### Mobile

- [ ] Testar em largura aproximada de celular, entre 360px e 430px.
- [ ] Sidebar vira navegacao horizontal utilizavel e nao cobre conteudo.
- [ ] Formularios mantem inputs confortaveis e botoes clicaveis.
- [ ] Tabelas usam rolagem horizontal quando necessario e nao quebram a tela.
- [ ] Cards/KPIs quebram em uma coluna sem sobrepor textos.
- [ ] Graficos ficam legiveis e nao estouram a largura.
- [ ] Toasts aparecem sem cobrir botoes essenciais por tempo excessivo.
- [ ] Modais/onboarding cabem na tela e permitem concluir o fluxo.

### Opcional

- [ ] Testar build com `npm run build:react` e `npm run preview:react`.
- [ ] Abrir `dist-react/app.html` no preview e testar as rotas com hash.
- [ ] Testar com localStorage vazio.
- [ ] Testar com muitos lancamentos, por exemplo 50 entradas/saidas.
- [ ] Testar valores altos, valores com centavos e datas de meses anteriores.
- [ ] Testar importacao de backup antigo sem categorias/recorrencias/orcamentos.
- [ ] Testar preferencia de tema persistindo apos fechar e abrir o navegador.
- [ ] Comparar visualmente desktop e mobile nos temas claro e escuro.

### Criterio de aprovacao para uso controlado

O produto pode seguir para uso controlado se todos os itens criticos passarem, se nao houver perda/corrupcao de dados no backup/importacao e se desktop/mobile estiverem utilizaveis nos fluxos principais.
