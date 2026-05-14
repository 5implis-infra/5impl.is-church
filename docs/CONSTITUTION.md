# Constituição — AD Ponte SaaS

> Identidade, valores e princípios que guiam todas as decisões no AD Ponte SaaS.

---

## Identidade

**AD Ponte** é uma plataforma SaaS multi-tenant para gestão de igrejas. Nossa missão é servir a igreja local com tecnologia que libera líderes para focar no que importa: discipulado, comunhão e missão.

Cada igreja (church) é um tenant independente com dados isolados. O sistema suporta sede e múltiplas filiais, permitindo que cada comunidade local tenha sua própria configuração, usuários e fluxos.

---

## Valores

### 1. Simplicidade sobre complexidade
Escolhemos a abordagem mais simples que resolve o problema. Isso vale para arquitetura, UI, e fluxos de usuário. Sistemas simples são mais baratos de manter, mais fáceis de entender, e mais resilientes.

### 2. Dados pertencem à igreja
Dados de cada igreja são propriedade exclusiva dela. Não monetizamos dados de membros, não cruzamos informações entre churches, e não vendemos inteligência artificial derived from church data.

### 3. Foco no essencial
O sistema resolve problemas administrativos reais: gestão de pessoas, eventos, finanças e comunicações. Não tentamos ser tudo para todos — cada módulo existe porque resolve uma dor real de igrejas com múltiplas filiais.

### 4. Transparência técnica
Decisões arquiteturais são documentadas como ADRs. O sistema é operável por técnicos que não escreveram o código. Infraestrutura é código, logs são estruturados, e failures são auditáveis.

### 5. Evolução gradual
Não reescrevemos do zero. Evolímos incrementalmente. Cada decisão é localmente ótima given current understanding. ADRs existentes são ammendable when reasons change.

---

## Princípios

### Multi-tenancy
- Cada church é isolada no nível de dados (`churchId`/`slug` em todos os modelos)
- Planos de assinatura controlam módulos disponíveis e limites
- Feature flags permitem rollout gradual de funcionalidades

### Separação de responsabilidades
- `services/api` = CRUD/regras de negócio (request/response)
- `services/media-workflow` = orquestração de mídia (event-driven)
- Workers são stateless e idempotentes
- Frontends nunca chamam workers diretamente

### Agentes primeiro
- `AGENTS.md` é a referência primária de contexto para agentes de IA
- Documentação aponta para specs OpenSpec, não duplica conteúdo
- Cada documento tem exatamente um propósito авторитетний

### Operabilidade
- Todos os serviços deployáveis têm Dockerfile + docker-compose
- CI/CD via GitHub Actions → GHCR → Coolify webhook
- Logs estruturados, métricas, e health checks em todos os serviços

---

## O que NÃO somos

- Não somos um CMS de conteúdo genérico
- Não somos uma plataforma de mídia social
- Não somos um sistema de gestão deProjects genérico
- Não somos uma plataforma de e-commerce
- Não monetizamos dados de igrejas ou membros

---

## See also

- [Visão macro do produto e módulos](docs/PRODUCT.md)
- [Princípios visuais e padrões de UX](docs/DESIGN.md)