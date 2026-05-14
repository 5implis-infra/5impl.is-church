# Design — AD Ponte SaaS

> Constituição visual e de UX: princípios, semântica de tokens, padrões de composição, e regras transversais. A implementação vive em `packages/ui`.

> Este documento estabelece intent, não valores de token, não código de componentes.

---

## Princípios Visuais

### 1. Funcionalidade antes de ornamentação
Cada elemento visual deve justificar sua existência por uma função. Decoração que não comunica é ruído.

### 2. Clareza sobre personalidade
Interfaces são ferramentas, não expressões artísticas. A estética deve servir a legibilidade e eficiência, não o inverso.

### 3. Consistência estrutural
Os mesmos padrões de layout, cor e tipografia se aplicam em todo o produto. Um usuário que aprende o sistema em um módulo não precisa reaprender básico em outro.

### 4. Feedback imediato
Toda ação do usuário gera resposta visual em < 100ms. Estados de loading, erro e sucesso são explícitos e não ambíguos.

### 5. Acessibilidade como padrão
Contrast ratios WCAG AA para texto, focus indicators visíveis, labels em todos os inputs. Acessibilidade não é feature flag — é linha de base.

---

## Semântica de Cores

Cores carregam significado, não apenas estética. O sistema de cores do AD Ponte usa um subconjunto restrito de tons com significados fixos:

| Role | Quando usar |
|---|---|
| **Brand primary** | Ações principais, links, destaques de navegação. Um tom de azul ou roxo que identifica o produto. |
| **Success** | Operações concluídas, confirmações, estados positivos. Verde. |
| **Warning** | Estados que requerem atenção mas não são erros. Amarelo/laranja. |
| **Danger** | Erros, ações destrutivas, alertas críticos. Vermelho. |
| **Neutral** | Backgrounds, bordas, texto secundário. Escalas de cinza. |
| **Surface** | Cards, modais, painéis. Fundo claro com borda sutil. |

**Regras:**
- Nunca usar cor como único meio de distinguir informação (sempre combinar com ícone ou texto)
- Status colors (success/warning/danger) nunca em backgrounds largos — apenas badges, ícones, bordas
- Brand primary em até 10% da área visível por tela

---

## Tipografia

O sistema tipográfico segue três níveis funcionais:

| Nível | Uso | Regras |
|---|---|---|
| **Display** | Títulos de página, heros | Font weight bold ou semibold. Escalas grandes (32px+). Line-height 1.2. |
| **Body** | Conteúdo principal, descrições | Font weight regular. 14-16px. Line-height 1.5-1.6. |
| **Label** | Botões, badges, legendas | Font weight medium. 12-14px. Text-transform opcional para badges. Line-height 1.4. |

**Regras:**
- Uma família de fonte para UI (sans-serif com boa legibilidade em tela)
- Escala tipográfica fixa (não valores arbitrários)
- Line-height maior em body text do que em display (leitura confortável)

---

## Espacamento

Sistema de espaçamento baseado em múltiplos de 4px (0.25rem na escala base):

- `xs`: 4px — espaço intra-elemento (entre ícone e label)
- `sm`: 8px — entre elementos relacionados
- `md`: 16px — entre grupos de elementos
- `lg`: 24px — entre seções
- `xl`: 32px — entre blocos maiores
- `2xl`: 48px — margem de página, separações major

**Regras:**
- Preencher espaço vertical com breathing room, não com divisores
- Cards usam padding interno consistente (sm ou md)
- Listas usam gap padronizado (sm ou md), não margin bottom em items individuais

---

## Padrões de Composição

### Layout de página
```
[Header — logo, nav, user menu]
[Page title + actions]
[Content area — cards, tables, forms]
[Footer — minimal]
```

### Navegação lateral (admin)
- Sidebar fixa à esquerda com ícones + labels colapsáveis
- Seções agrupadas por módulo funcional
- Badge de contagem em itens que precisam atenção (notificações pendentes, etc.)

### Cards
- Background surface, border sutil, border-radius 8px
- Header com título e ações (三条杠 menu)
- Padding interno consistente
- Shadow elevado apenas para elementos sobrepostos (modais, tooltips)

### Formulários
- Labels acima de inputs
- Helper text em cor neutral abaixo do input
- Erro em cor danger abaixo do input, com ícone
- Botão primário à direita (ou centralizado em mobile)

---

## Regras UX Transversais

### Empty states
Quando uma lista/página está vazia, mostrar:
1. Ilustração ou ícone que comunique a ausência
2. Texto explicativo do que ainda não existe
3. CTA para criar o primeiro item (se aplicável)

### Loading states
- Skeleton screens para conteúdo que carrega
- Spinner apenas para ações em botão ou operações < 1s
- Progress bar para operações longas (uploads, processamento)

### Error states
- Mensagem de erro próxima ao elemento que falhou
- Evitar modais de erro genéricos
- Toast notifications para feedback de ações (salvo com sucesso, etc.)

### Confirmaçōes destrutivas
- Modal de confirmação para ações que não podem ser desfeitas
- Nome do recurso explicitado no texto de confirmação
- Botão de ação destrutiva em cor danger

### Data fetching
- Server components para leitura inicial
- Cliente polling ou SWR para dados que mudam com frequência
- Otimistic updates para operações que用户的反馈