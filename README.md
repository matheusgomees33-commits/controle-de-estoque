
# Controle de Estoque

Sistema web de controle de estoque desenvolvido em **HTML, CSS e JavaScript puro**, sem banco de dados, sem frameworks e sem bibliotecas. Os dados ficam salvos no navegador (`localStorage`). Projeto acadêmico.


## Sobre o projeto
O sistema organiza o estoque de uma empresa: cadastra produtos, fornecedores e categorias, registra entradas e saídas de mercadorias, acompanha o saldo de cada item, avisa quando o estoque está baixo ou o produto está perto do vencimento e gera histórico e relatórios.

**Objetivos**
- Praticar HTML, CSS e JavaScript na construção de um sistema completo e organizado.
- Aplicar regras de negócio reais de controle de estoque (saldo, mínimo, validade, inventário).
- Aprender a versionar e publicar um projeto no GitHub.

Ao abrir o sistema pela primeira vez, ele já vem com **dados de exemplo**: 7 produtos, 3 fornecedores, 4 categorias e 5 movimentações. Assim dá para testar tudo sem cadastrar nada.

## Como executar
1. Baixe ou clone o repositório, mantendo as pastas `css`, `js` e `img` ao lado do `index.html`.
2. Dê dois cliques em `index.html`. Ele abre no navegador (desenvolvido para as versões atuais de Chrome, Edge e Firefox). Não é preciso instalar nada.

Se o botão "Entrar" não responder, quase sempre o `index.html` foi aberto sem as pastas ao lado dele (por exemplo, de dentro de um `.zip`). A tela de login mostra um aviso nesse caso.

## Acesso ao sistema
O sistema aceita **um único login**, definido na constante `ACESSO`, no início de `js/dados.js`:

| Usuário | Senha |
|---|---|
| `matheus` | `matheus1212`, porém você poderá altera conforme suas informações, essa senha é somente para demonstra o protótipo em ação.

- O usuário não diferencia maiúsculas de minúsculas. A senha diferencia e não tem espaço.
- Com usuário ou senha errados, aparece a mensagem **"Usuário ou senha inválidos"**.
- O botão do olho mostra o que foi digitado na senha.
- Para trocar o acesso, edite a constante `ACESSO`.

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Painel** | Total de produtos, unidades em estoque, estoque baixo, sem estoque, valor do estoque e itens vencidos ou a vencer. Lista de produtos que precisam de atenção, últimas movimentações e gráfico de unidades por categoria. |
| **Produtos** | Cadastrar, editar e excluir. Pesquisa por nome, código ou código de barras. Filtro por categoria e por situação. |
| **Movimentar estoque** | Entrada e saída com produto, quantidade e observação. Na entrada, informa lote e validade. Aceita leitor de código de barras. |
| **Histórico** | Todas as movimentações com data, hora, tipo, quantidade, saldo, lote, observação e usuário. Filtros por produto, tipo e período. Exporta CSV. |
| **Fornecedores** | Cadastro com nome, CNPJ (validado), telefone e endereço. Mostra quantos produtos cada um fornece. |
| **Categorias** | Cadastro de categorias para organizar os produtos. |
| **Inventário físico** | Compara a contagem real com o saldo do sistema e ajusta as diferenças, registrando-as no histórico. |
| **Relatórios** | Posição atual do estoque, valor total a preço de compra e de venda, margem potencial e controle de validade. Exporta CSV e imprime ou salva em PDF. |
| **Usuários** | Cadastro de usuários com nível de acesso (somente administrador). |
| **Backup e dados** | Exporta e importa todos os dados em arquivo `.json` e restaura os dados de exemplo (somente administrador). |

Outros recursos: mensagens de sucesso e erro em todas as operações, confirmação antes de excluir, tema claro e escuro automático e layout responsivo (computador e celular).

## Guia de uso

**Cadastrar um produto:** *Produtos > Novo produto*. Obrigatórios: nome e categoria. O código é gerado automaticamente (`P001`, `P002`...), mas pode ser informado. A quantidade inicial só é definida no cadastro; depois ela só muda por entrada, saída ou inventário.

**Registrar entrada ou saída:** *Movimentar estoque*, escolha a aba Entrada ou Saída, selecione o produto, informe a quantidade e confirme. Se o saldo ficar no mínimo ou abaixo dele, aparece um aviso amarelo.

**Usar o leitor de código de barras:** na tela *Movimentar estoque*, clique no campo "Código de barras ou código do produto" e passe o leitor. Leitores USB digitam o código e enviam Enter, e o produto é selecionado sozinho. Também funciona digitando o código e teclando Enter.

**Fazer um inventário:** *Inventário físico*, digite a quantidade contada de cada produto (deixe em branco o que não contou) e clique em *Aplicar contagem*. Cada diferença vira uma movimentação do tipo "Ajuste".

**Fazer backup:** *Backup e dados > Baixar backup*. Guarde o arquivo `.json`. Para recuperar, use *Importar backup*.

**Gerar PDF de um relatório:** *Relatórios > Imprimir / salvar PDF* e, na janela de impressão, escolha "Salvar como PDF".

## Regras de negócio
- Produto sem nome ou sem categoria não é cadastrado.
- Quantidades devem ser números inteiros e não podem ser negativas. Preços também não podem ser negativos.
- A **saída maior que o saldo disponível é bloqueada**.
- Entradas e saídas atualizam o saldo na hora e ficam registradas no histórico, com data, hora e usuário.
- **Situação do produto:** *Sem estoque* quando a quantidade é 0; *Estoque baixo* quando a quantidade é menor ou igual ao mínimo; *Normal* nos demais casos.
- **Validade:** *Vencido* quando a data já passou; *Vence em breve* quando faltam 30 dias ou menos.
- Não são aceitos código, código de barras, nome de produto ou CNPJ duplicados.
- O CNPJ é validado pelos dígitos verificadores.
- Um produto que já tem movimentações **não pode ser excluído**, para não perder o histórico.
- Um fornecedor associado a produtos e uma categoria em uso **não podem ser excluídos**.
- Não é possível excluir o próprio usuário nem o último administrador.
- Toda exclusão pede confirmação.

## Níveis de acesso

| Ação | Administrador | Operador |
|---|:---:|:---:|
| Ver painel, histórico, relatórios e inventário | ✔ | ✔ |
| Cadastrar e editar produtos | ✔ | ✔ |
| Registrar entradas, saídas e inventário | ✔ | ✔ |
| Cadastrar e editar fornecedores e categorias | ✔ | somente leitura |
| Excluir qualquer registro | ✔ | ✘ |
| Gerenciar usuários | ✔ | ✘ |
| Backup, importação e restauração de dados | ✔ | ✘ |

Enquanto o acesso único estiver ativo (constante `ACESSO`), só o login `matheus` consegue entrar no sistema. Usuários criados na tela *Usuários* só poderão entrar se esse acesso único for removido.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura das telas, formulários e janelas (`<dialog>`) |
| CSS3 | Layout (flexbox e grid), responsividade, tema claro e escuro e estilos de impressão |
| JavaScript (Vanilla) | Regras de negócio, telas, validações e eventos |
| LocalStorage | Armazenamento dos dados no navegador |
| Web Crypto API | Hash de senha (PBKDF2) dos usuários armazenados |
| Git e GitHub | Versionamento e publicação |

## Estrutura do projeto
```
controle-de-estoque/
├── index.html        estrutura das telas: login, menu, janelas de formulário e confirmação
├── css/
│   └── style.css     aparência, responsividade, tema escuro e impressão
├── js/
│   ├── dados.js      camada de dados: armazenamento, login, regras de negócio e backup
│   └── script.js     interface: telas, tabelas, formulários, filtros e eventos
├── img/
│   └── logo.svg      logotipo
└── README.md         esta documentação
```

## Como o código funciona
O código é dividido em duas camadas. A interface (`script.js`) só chama funções da camada de dados (`dados.js`), o que facilita entender, testar e acrescentar novas funções.

**`js/dados.js`** (carregado primeiro)
- **Utilitários:** formatação de moeda e datas, pesquisa sem acentos e proteção de texto contra HTML.
- **Armazenamento:** `carregar()` e `salvar()` usam o `localStorage`; se os dados estiverem ausentes ou corrompidos, o sistema volta aos dados de exemplo.
- **Login e senhas:** constante `ACESSO`, funções `acessoValido()` e `entrar()`, e `hashSenha()` (PBKDF2).
- **Entidades (`ENT`):** produtos, fornecedores, categorias e usuários são descritos em um único objeto, com seus campos, validações e regras de exclusão. Um CRUD genérico (`salvarEntidade()` e `excluirEntidade()`) atende os quatro, evitando código repetido.
- **Movimentações:** `movimentar()` (entrada e saída) e `ajustarEstoque()` (inventário).
- **Backup:** `exportarBackup()` e `importarBackup()`, com validação do arquivo.

**`js/script.js`**
- Funções de tela (`viewPainel`, `viewMov`, `viewHist` e outras) que montam cada página.
- Um formulário genérico em janela (`abrirForm`), montado a partir dos campos de `ENT`.
- Eventos centralizados: um único ouvinte de cliques na área da tela atende todos os botões.
- Exportação para CSV e controle de login e sessão.

## Modelo de dados
Tudo fica em um único objeto JSON, guardado no `localStorage` com a chave `estoque-v2`.

| Coleção | Campos |
|---|---|
| `produtos` | `id`, `nome`, `barras`, `categoria`, `fornecedorId`, `descricao`, `qtd`, `min`, `compra`, `venda`, `lote`, `validade`, `cadastro` |
| `fornecedores` | `id`, `nome`, `cnpj`, `telefone`, `endereco` |
| `categorias` | `id`, `nome` |
| `usuarios` | `id`, `nome`, `login`, `papel` (`admin` ou `operador`), `salt`, `hash` |
| `historico` | `data`, `id` (produto), `nome`, `tipo` (`entrada`, `saida` ou `ajuste`), `qtd`, `saldo`, `obs`, `lote`, `usuario` |

Também guarda `seq` (contadores dos códigos) e `ultimoBackup`.

## Segurança
Medidas implementadas:
- **Senhas de usuários** guardadas com hash PBKDF2-SHA256 (100 mil iterações) e salt individual, nunca em texto. Em navegadores sem Web Crypto, usa-se um hash simples de reserva.
- **Proteção contra XSS:** todo texto digitado é escapado antes de ser exibido.
- **Proteção contra injeção de fórmulas** nos arquivos CSV (textos iniciados por `=`, `+`, `-` ou `@` ganham apóstrofo).
- **Validação dos dados** nas regras de negócio, e não só nos formulários, e conferência de permissão também na exclusão.
- **Validação do backup** antes de importar.

**Importante:** como o sistema roda inteiramente no navegador, o login é uma demonstração e **não oferece segurança real**. O usuário e a senha do acesso único ficam escritos em `js/dados.js`, visíveis a quem abrir o código do site, e quem tiver acesso ao computador pode ler ou alterar os dados pelas ferramentas do navegador. Autenticação e permissões de verdade exigem um servidor.

## Requisitos atendidos

**Requisitos funcionais**

| Código | Requisito | Situação |
|---|---|---|
| RF01–RF04 | Cadastrar, editar, excluir (com restrição) e consultar produtos | Atendido |
| RF05–RF07 | Entrada, saída e bloqueio de saída acima do saldo | Atendido |
| RF08–RF10 | Fornecedores e associação com produtos | Atendido |
| RF11 | Categorias | Atendido |
| RF12–RF14 | Estoque baixo, alertas e saldo atual | Atendido |
| RF15–RF16 | Histórico por produto e período | Atendido |
| RF17–RF18 | Relatórios e valor total do estoque | Atendido |
| RF19–RF20 | Usuários com níveis de acesso e usuário em cada movimentação | Atendido (login restrito a um usuário) |

**Requisitos não funcionais**

| Código | Requisito | Situação |
|---|---|---|
| RNF01 | Interface simples e intuitiva | Atendido |
| RNF02 | Consultas em até 3 segundos | Atendido (processamento local e imediato) |
| RNF03 | Autenticação por login e senha | Atendido como demonstração (veja [Segurança](#segurança)) |
| RNF04 | Senhas com hash | Atendido para usuários armazenados; o acesso único usa comparação direta |
| RNF05 | Backups periódicos | Parcial: backup manual em `.json` com lembrete após 7 dias |
| RNF06 | Principais navegadores | Previsto para Chrome, Edge e Firefox atuais; confirme no seu navegador |
| RNF07 | Mensagens claras de erro | Atendido |
| RNF08 | Integridade dos dados | Atendido (sem duplicados; saldo alterado só por movimentação) |
| RNF09 | Estrutura extensível | Atendido (camadas separadas e CRUD genérico) |
| RNF10 | Dados persistentes | Atendido (LocalStorage) |

## Roteiro de testes manuais
Use esta lista para conferir o sistema depois de abrir ou publicar:

| # | Teste | Resultado esperado |
|---|---|---|
| 1 | Entrar com usuário e senha errados | Mensagem "Usuário ou senha inválidos" |
| 2 | Entrar com `matheus` / `matheus1212` | Abre o painel |
| 3 | Cadastrar produto sem nome | Erro e produto não é criado |
| 4 | Cadastrar produto com quantidade negativa | Erro de validação |
| 5 | Cadastrar produto com nome já existente | Erro de duplicidade |
| 6 | Cadastrar produto válido | Aparece na lista com código automático |
| 7 | Dar saída maior que o saldo | Erro; saldo não muda |
| 8 | Dar saída até o saldo chegar ao mínimo | Saldo atualizado e aviso amarelo de estoque baixo |
| 9 | Dar entrada com lote e validade | Saldo sobe; lote e validade aparecem no produto |
| 10 | Conferir o histórico | Movimentações com data, hora e usuário; filtros funcionam |
| 11 | Excluir produto com movimentações | Bloqueado com mensagem |
| 12 | Excluir produto sem movimentações | Pede confirmação e exclui |
| 13 | Cadastrar fornecedor com CNPJ inválido | Erro de CNPJ |
| 14 | Excluir fornecedor ou categoria em uso | Bloqueado com mensagem |
| 15 | Fazer inventário com contagem diferente | Saldo ajustado e "Ajuste" no histórico |
| 16 | Baixar o backup e importá-lo de volta | Dados mantidos |
| 17 | Fechar e reabrir o navegador | Dados continuam salvos |
| 18 | Exportar CSV do histórico | Arquivo abre no Excel |

## Como publicar no GitHub
1. Crie uma conta e um repositório em github.com (**New repository**), com o nome `controle-de-estoque`, público e sem README (este projeto já tem um).
2. **Pelo site:** em **Add file > Upload files**, arraste o **conteúdo** da pasta do projeto (`index.html`, `css`, `js`, `img` e `README.md`), não a pasta inteira, e clique em **Commit changes**.
3. **Pelo terminal**, dentro da pasta do projeto:
   ```
   git init
   git add .
   git commit -m "Primeira versão do sistema de estoque"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/controle-de-estoque.git
   git push -u origin main
   ```
4. **Link online:** em **Settings > Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)` e clique em **Save**. O endereço será `https://SEU-USUARIO.github.io/controle-de-estoque/`.

## Limitações
- O login é uma demonstração, sem segurança real (veja [Segurança](#segurança)).
- Os dados ficam só no navegador usado: não sincronizam entre dispositivos e são perdidos se o armazenamento do navegador for limpo. Use o backup.
- O backup é manual: o navegador não consegue agendar cópias sozinho.
- Não há leitura de código de barras pela câmera (somente leitores que digitam o código).
- Não há controle de vários depósitos ou filiais.
- O PDF é gerado pela impressão do navegador, não por uma biblioteca.

## Melhorias futuras
- Back-end com banco de dados (por exemplo PHP e MySQL, ou Node.js) para login e permissões de verdade e dados compartilhados entre usuários.
- Leitura de código de barras pela câmera.
- Controle de múltiplos depósitos ou filiais.
- Gráficos de movimentação por período.
- Testes automatizados das regras de negócio.
- Importação de produtos por planilha.
