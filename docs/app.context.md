## **1. Visão Geral**

### Este documento é um rascunho e será atualizado ao longo do desenvolvimento, servindo como base para auxiliar na criação do projeto.

O sistema será um SaaS (Software as a Service) multi-tenant para gestão de igrejas, implementado como **App (Expo Web/Native)**.

Cada igreja cadastrada será um **cliente independente**, com seus próprios dados, usuários e configurações.

Cada igreja poderá gerenciar suas filiais, ministérios, membros, eventos e finanças, além de personalizar o layout e temas do sistema. O sistema suportará a configuração de domínios personalizados para garantir que os usuários acessem diretamente pelo domínio da igreja.

---

## **2. Gestão de Multi-Igrejas e Acessos**

### **2.1. Estrutura Multi-Igrejas**

- Cada **igreja cadastrada** é um **cliente independente** dentro do sistema.
- Os dados de cada igreja são totalmente **separados** dos de outras igrejas.
- O sistema identifica a igreja do usuário **com base no domínio/subdomínio utilizado no acesso**.
- O usuário logado **somente pode acessar as igrejas e filiais às quais tem permissão**.

### **2.2. Gestão de Domínios**

- Cada igreja pode configurar um **subdomínio exclusivo** dentro do sistema (ex: `minhaigreja.sistema.com`).
- Alternativamente, pode configurar um **domínio personalizado** (ex: `minhaigreja.com`).
- Se optar por um **subdomínio**, o sistema deve:
  - Permitir que o usuário **escolha um subdomínio disponível**.
  - **Validar e reservar** automaticamente o subdomínio escolhido.
- Se optar por um **domínio próprio**, o sistema deve:
  - Solicitar que o usuário informe o domínio.
  - Validar a **propriedade do domínio** antes de vinculá-lo ao sistema.

### **2.3. Gestão de Perfis e Acessos**

- O **usuário administrador** pode cadastrar novos usuários e definir **perfis de acesso**.
- Os perfis determinam quais **módulos e funcionalidades** o usuário pode acessar.
- O administrador pode escolher entre **perfis predefinidos** ou criar **novos perfis personalizados**, respeitando as limitações do plano de assinatura.
- **Ao relacionar um usuário a uma filial define-se o perfil perfil específico** no qual ele tem acesso na respectiva filial.
- O **acesso ao sistema é baseado no token do usuário**, que:
  - **Identifica automaticamente** a igreja e filial selecionada.
  - **Impede que o usuário altere manualmente** a filial na requisição.
  - **Regenera o token** a cada troca de igreja ou filial para garantir segurança.
- Cada usuário terá um tipo (relativo ao modo de operação)
  - **Operador**: Acessa o sistema no "Modo Operador", podendo receber perfis de acesso a filiais.
  - **Membro**: Acessa o sistema no "Modo membro", não podendo receber perfis.
- O usuário "Administrador", poderá cadastrar usuários do tipo "Operador" e delegar essa função (atribuindo um perfil) para outros usuários
- O usuário Administrador, poderá delegar a função "Administrador" para outros usuários
- Quanto ao acesso do tipo "Membro"
  - Um membro irá acessar a página de login, selecionar a opção de login "como mmebro" e preencher o CPF. No primeiro acesso o sistema registra uma solicitação de acesso. Os usuários com perfil de acesso a essa funcionalidade (Login de Membro) irá receber uma notificação e deve permitir o acesso configurando uma nova senha gerada pelo sistema que deve ser enviada via email ou mensagem via whatsapp.

### **2.4. Segurança e Controle de Acesso**

- **Autenticação Segura**:
  - Login via **e-mail/senha, autenticação em dois fatores (2FA) e login social**.
- **Permissões Granulares**:
  - Cada usuário tem acesso apenas às **funções e filiais permitidas**.
- **Logs de Atividades**:
  - Registro de todas as ações relevantes no sistema.

---

## **3. Gestão de Planos e Onboarding de Igrejas**

### **3.1. Gestão de Planos de Assinatura**

- O sistema oferecerá diferentes **planos de assinatura**, cada um com **diferentes níveis de acesso** às funcionalidades.
- Os planos podem definir:
  - **Quantidade de usuários e filiais permitidos**.
  - **Módulos disponíveis** (ex: acesso ao módulo financeiro, gestão pastoral, cursos, etc.).
  - **Opção de usar um subdomínio ou domínio próprio**.
  - **Limites de armazenamento para arquivos e mídia**.

### **3.2. Processo de Onboarding**

O processo de configuração inicial de uma igreja incluirá as seguintes etapas:

1. **Escolha do Plano**: O administrador seleciona um plano de assinatura adequado às necessidades da igreja.
2. **Configuração do Meio de Pagamento**: Definição do método de pagamento para cobrança recorrente.
3. **Pagamento Inicial**: Realização do primeiro pagamento para ativação do serviço.
4. **Configuração do Domínio**: Escolha entre subdomínio ou domínio próprio.
5. **Cadastro de Usuários e Perfis de Acesso**: Inclusão dos administradores e definição de permissões.
6. **Configuração Visual**: Personalização de **layout, logotipo e tema** da igreja no sistema.

---

## **4. Modos de Operação**

O sistema terá **três modos de operação**, com diferentes permissões e acessos:

### **4.1. Modo Administrativo**

- Acesso restrito a **usuários do tipo "Operador"** com perfil configurado.
- Permite gerenciar todas as funcionalidades conforme o nível de acesso.

### **4.2. Modo Membro**

- Visualização da **agenda geral da igreja**.
- Possibilidade de **deixar pedidos de oração**.
- Acesso a **publicações** e **mídias de eventos**.
- Realização de **contribuições financeiras**.
- Incrições em cursos privados (de acordo com o perfil de público alvo)
- Todas as demais páginas e funcionalidades vinculadas ao perfil "MODO_MEMBRO"

### **4.3. Modo Anônimo**

- Visualização da **agenda pública** da igreja.
- Acesso a **fotos e publicações públicas**.
- Envio de mensagens.
- Possibilidade de realizar **contribuições**, desde que o usuário **se identifique com e-mail e CPF**.
- Incrições em cursos públicos
- Todas as demais páginas e funcionalidades vinculadas ao perfil "MODO_ANONIMO"

---

## **5. Funcionalidades Principais**

### **5.1. Gestão de Ministérios**

- Cada ministério tem sua **página customizada** com seus respectivos:
  - Eventos em que o ministério esteja envolvido
  - Gestão financeira (contas, despesas e receitas).
  - Pendências e notificações.
  - Líderes responsáveis.

### **5.2. Gestão de Pessoas**

- **Membros**: Cadastro, atualização e gestão de membros.
- **Visitantes**: Controle de visitantes, histórico de visitas e acompanhamento.
- **Liderança**: Organização da hierarquia de líderes da igreja.
  - Líderes também são membros
- **Células**: Gerenciamento de pequenos grupos, com controle de participantes e líderes.
  - Cada célula poderá ter seus respectivos Eventos.
- **Funções Ministeriais**:
  - Cadastro de **diáconos, presbíteros, missionários e pastores**.
  - Acompanhamento de atividades ministeriais.
  - Planejamento e gestão da **evolução ministerial**.

### **5.3. Gestão de Eventos**

- Podem ser **únicos, recorrentes** ou uma **série com cronograma**.
- Associados a uma **agenda específica**.
- Possibilidade de **anexar fotos, vídeos e materiais de apoio**.
- **Escala de Voluntários** (Sugestão Adicional):
  - Planejamento de equipes para cada culto/evento.
  - Envio de notificações automáticas para os voluntários escalados.
- Registro de **receitas e despesas** (dízimos, ofertas e outros).
  - Vinculação ao **módulo financeiro** com categorias e centros de custo.
  - Diversos **meios de pagamento** aceitos.

### **5.4. Gestão de Cultos**

- **Culto é um tipo especial de evento recorrente**

### **5.5. Gestão de Cursos**

- **Grades Curriculares**:
  - Organização hierárquica com subitens.
  - Cada item pode estar vinculado a um **material didático**.
  - Suporte a versionamento da grade.
- **Material Didático**:
  - Suporte a livros e PDFs com possibilidade de anotações.
  - Estrutura hierárquica de conteúdos.
- **Turmas**:
  - Uma **turma é um tipo especial de evento em série onde a série de eventos é o cronograma**
  - Definição de **cronograma**, onde cada item se relaciona com a grade e sua versão.
    - O cronograma deve ser vinculado a uma Agenda
    - Cada item do cronograma tem um item correspondente na Agenda.
    - Não deve ser possível editar este item diretamente na Agenda.
  - Configuração de público alvo (Genero; Idade; etc...)
  - Incrição de alunos (via página do curso ou na edição).
  - Configuração de **valores de matrícula**.
  - Pagamento online com integração ao módulo financeiro.
    - Lançamento automático das receitas no centro de custo e conta correspondente.

### **5.6. Gestão Pastoral**

- **Atendimentos Pastorais**:
  - Cadastro de atendimentos com geração de **prontuário**.
  - Controle de acesso a **informações sigilosas**.
- **Histórico de Visitas Pastorais** (Sugestão Adicional):
  - Registro de visitas a membros e acompanhamento pastoral.

### **5.6. Gestão Teológica**

- **Publicação de artigos e estudos** em série.
- **Gestão de Material didático vinculado aos cursos**
- **Autores e revisores**.
- **Opção de publicar/despublicar** conteúdos.
- **Sistema de comentários** nas publicações.
- Credos e confições de fé.

### **5.7. Gestão de Agendas**

- Múltiplas agendas para diferentes áreas da igreja.
- Integração com **Google Agenda**.
- Possívbilidade de selecionar uma ou múltiplas agendas, vendo os respectivos eventos de cada agenda selecionada no calendário
- **Agendas Virtuais**
  - **Agenda Geral** ( Tem sua própria página, disponível para todos os membros logados)
    - Agrupa todos os eventos de todas as demais agendas
  - **Agenda pública** (tem sua própria página, disponível para todos os usuários em modo anônimo)
    - Agrupa todos os eventos marcados como **publicos**

### **5.8. Gestão de Notificações**

- Todo evento sistemico deve gerar uma notificação
- Notificações devem ser registradas em um sistema de mensagens do tipo pub/subscriber
- Notificações baseadas no perfil de acesso ou relação com o evento.
- Classificar as notificações com base no tipo de evento sistemico gerado, Exemplo:
  1. **Entradas e saídas de receitas**.
  2. **Pendências e tarefas**.
  3. **Novos eventos agendados**.
  4. **Novas publicações**.
  5. **Contas a pagar e receber**.
  6. etc...
- Permitir o usuário configurar as notificações quer receber com base nesta classificação
- Filtrar as notificações do usuário com base na relação dele com "evento sistemico" que gerou a notificação)

### **5.9. Eventos sistemicos e envio de Mensagens e gestão de templates**

- Cadastro de templates para envio de mensagens, como:

  - Notificações
  - Pedido de orações
  - Pedido de acesso (login)
  - Alteração de Senhas
  - Geração de primeiro acesso
  - Eventos sistemicos em geral

- Gestão de Envio de Mensagens
  - Histórico de envios com configuração de histórico de renteção (de acordo com o plano escolhido da igreja)
  - Pesquisa de mensagens enviados com filtros.
  - Possibilidade de criar automações para envios de mensagens vinculando diferentes tipos de eventos/ocorrências do sistema, os destinatários (membros, líderes ou ministérios), template e o tipo de mensagem (email ou whatsapp)
  - Automações pré-configuradas
    - envios automáticos de emails para os eventos do sistema
    - Aniversariantes do mẽs, semana e dia
    - Eventos importantes para os lideres

### **5.10. Gestão Financeira**

- **Contas Físicas e Virtuais**, podendo vincular cada conta a um ministério. Com controle detalhado de saldo.
- **Cadastro de novas formas de pagamento**, permitindo:
  - Gestão de parcelamentos similar à gestão de faturas de cartões de crédito, permitindo, por exemplo, gerir pagamentos e recebimentos de uma venda/compra de equipamentos via **PIX parcelado**
- **Categorias**: Controle detalhado de entradas e saídas.
- **Centro de Custos**: Classificação das despesas e receitas por departamento.
- **Receitas e Despesas**: Inclusão de lançamentos financeiros.
- **Pagamentos**: Gestão de **boletos, cartões de crédito e PIX**.
- **Relatórios**: Visualização e exportação de relatórios financeiros detalhados.
- **Doações Online**:
  - Link personalizado para doações externas.
  - Integração com **Google Pay, Apple Pay e PIX QR Code**.
  - Lançamento automático no respectivo centro de custo e conta configurados.

### **5.11.  Gestão de Produção de Mídia**