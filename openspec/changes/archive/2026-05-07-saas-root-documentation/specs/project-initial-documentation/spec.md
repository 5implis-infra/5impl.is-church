# Spec: project-initial-documentation (delta)

## ADDED Requirements

### Requirement: AGENTE.md dos submodules referencia o AGENTE.md root como template
Os `AGENTE.md` criados em cada submodule (escopo de mudança futura) SHALL seguir a estrutura estabelecida no `AGENTE.md` root do monorepo.

#### Scenario: Estrutura compatível com o template root
- **WHEN** se cria um `AGENTE.md` em qualquer submodule
- **THEN** as seções usam os mesmos nomes e ordem definidos no `AGENTE.md` root
- **THEN** a seção "Integra com" referencia os componentes do monorepo pelos caminhos canônicos (ex: `services/api`, `services/media-workflow`)

### Requirement: AGENTE.md dos submodules é agnóstico de ferramenta de IA
Os `AGENTE.md` de cada submodule SHALL seguir o mesmo requisito de agnosticismo do `AGENTE.md` root.

#### Scenario: Sem referências a ferramentas específicas
- **WHEN** se lê o `AGENTE.md` de qualquer submodule
- **THEN** NÃO existe referência a "Claude", "Cursor", "Copilot" ou qualquer ferramenta específica de IA
