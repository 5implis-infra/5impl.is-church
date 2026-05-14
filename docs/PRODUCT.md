# Produto — AD Ponte SaaS

> Visão macro do produto: superfícies de acesso, módulos funcionais, e conceitos de domínio.

---

## Superfícies de Acesso

O produto é acessado em três superfícies, todas consumindo exclusivamente `services/api`:

| App | Audiência | Plataforma |
|---|---|---|
| `admin-web` | Operadores (liderança, staff) — tudo gerencial | Web browser (Next.js 15) |
| `admin-app` | Operadores — subset gerencial em mobilidade | iOS / Android (Expo nativo) |
| `member-app` | Membros autenticados e visitantes anônimos | iOS / Android (Expo nativo) |

---

## Módulos Funcionais

| Módulo | O que faz |
|---|---|
| **Pessoas** | Cadastro de membros, visitantes, liderança, células e funções ministeriais |
| **Eventos e Cultos** | Eventos únicos, recorrentes e em série; cultos como tipo especial de evento |
| **Financeiro** | Contas, categorias, centros de custo, receitas/despesas, PIX, boleto, cartão |
| **Cursos** | Grades curriculares, turmas, inscrições, material didático, cronograma vinculado a agenda |
| **Pastoral** | Atendimentos, prontuários, histórico de visitas pastorais |
| **Teologia** | Publicações, artigos em série, credos, sistema de comentários |
| **Agendas** | Múltiplas agendas, integração Google Calendar, agenda geral e pública virtuais |
| **Notificações** | Eventos sistêmicos com pub/subscriber, templates, automações, canais configuráveis |
| **Mídia** | Captura, ingestão, processamento automatizado de vídeo/imagens, publicação social |
| **Plataforma** | Multi-tenancy, billing, onboarding de igrejas, domínios personalizados |

---

## Conceitos de Domínio

| Conceito | Definição |
|---|---|
| **church** | Unidade tenant. Cada igreja = cliente independente, dados isolados. Identificada por `churchId`/`slug`. |
| **filial** | Sub-unidade de uma church. Um usuário pode ter perfis diferentes em cada filial. |
| **plano de assinatura** | Define módulos, limites de usuários/filiais/armazenamento por tenant. |
| **operador** | Usuário gerencial. Acessa em Modo Administrativo via `admin-web` ou `admin-app`. Recebe perfis por filial. |
| **membro** | Usuário não-gerencial. Acessa em Modo Membro via `member-app`. Não recebe perfis de acesso. |
| **perfil de acesso** | Conjunto de permissões granulares por operador em uma filial específica. |

### Modos de operação

| Modo | Audiência | Apps |
|---|---|---|
| **Administrativo** | Operadores com perfil configurado | `admin-web`, `admin-app` |
| **Membro** | Membros autenticados | `member-app` |
| **Anônimo** | Visitantes não autenticados | `member-app` (público) |

---

## Arquitetura de Dados

Multi-tenancy via `churchId`/`slug` em todos os modelos de domínio. Schema único + Row-Level Security no PostgreSQL para o estágio atual.

Feature flags + planos de assinatura controlam quais módulos estão disponíveis por tenant.