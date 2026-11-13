[
# controle-de-estoque

Sistema web de controle de estoque em HTML, CSS e JavaScript puro, sem banco de dados e sem bibliotecas. Os dados ficam no `localStorage` do navegador. Projeto acadêmico.

## Objetivo
Organizar o estoque de uma empresa: cadastrar produtos, fornecedores e categorias, registrar entradas e saídas, acompanhar saldos e alertas e consultar histórico e relatórios.

## Como executar
Abra `index.html` no navegador (Chrome, Edge ou Firefox).

**Modo demonstração:** por padrão (`MODO_DEMO = true` no início de `js/dados.js`) qualquer usuário e senha entram. Digitar `operador` entra como operador; qualquer outro nome entra como administrador. Para exigir senha, troque para `false`. Contas com senha (modo normal):

| Usuário | Senha | Nível |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `operador` | `operador123` | Operador |

## Funcionalidades
**Requisitos básicos**
- Produtos: cadastrar, editar, excluir (bloqueado se houver movimentações), pesquisar por nome/código/código de barras, filtrar por categoria e situação.
- Entradas e saídas com atualização automática do saldo; saída maior que o saldo é bloqueada.
- Fornecedores (CNPJ validado) associados aos produtos; categorias.
- Alertas de estoque baixo e sem estoque, com cores diferentes.
- Histórico com data, hora e usuário, filtrável por produto, tipo e período.
- Relatórios: posição do estoque e valor total.
- Usuários com dois níveis: administrador e operador.
- Mensagens claras de erro e sucesso; confirmação antes de excluir.

**Melhorias (plano de desenvolvimento)**
- Painel com indicadores e gráfico por categoria.
- Leitura de código de barras (leitores USB, que "digitam" o código e enviam Enter).
- Exportação para CSV (abre no Excel) e para PDF (botão Imprimir > Salvar como PDF).
- Lote e validade, com alerta de vencido e de vencimento em até 30 dias.
- Inventário físico: compara a contagem com o sistema e gera ajustes no histórico.
- Backup e restauração em arquivo `.json`, com lembrete após 7 dias.

## Estrutura
```
controle-de-estoque/
├── index.html
├── css/style.css
├── js/dados.js     dados, login, regras de negócio
├── js/script.js    telas e eventos
├── img/logo.svg
└── README.md
```

## Como publicar no GitHub
1. Crie um repositório em github.com (**New repository**).
2. Envie os arquivos: **Add file > Upload files** (mantendo as pastas) ou, no terminal:
   `git init && git add . && git commit -m "Primeira versão" && git branch -M main && git remote add origin URL_DO_REPOSITORIO && git push -u origin main`
3. Para ter um link online: **Settings > Pages > Branch: main > Save**.

## Limitações importantes
- **O login é uma demonstração, não segurança real.** Como tudo roda no navegador, quem tiver acesso ao computador pode ler ou alterar os dados pelo DevTools. As senhas são guardadas com hash (PBKDF2 + salt), mas autenticação e permissões de verdade exigem um servidor (por exemplo PHP + MySQL).
- Os dados ficam só no navegador usado e são perdidos se ele for limpo: use o backup.
- O backup é manual (o navegador não consegue agendar cópias sozinho).
- Não incluídos: leitura de código de barras pela câmera e múltiplos depósitos.

## Autor
Nome: _______________________  
Curso/Instituição: _______________________

projeto feito em para facilitar o acesso de pequenos empreendedores a seus próprios produtos, tendo organização e prática de manusear seus produtos 
