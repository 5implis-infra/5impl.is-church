## workflow

1. Ideation (exploração aberta)
2. Discovery (validação + contexto)
3. Architecture / Proposal (decisão)
4. Spec (contratos claros)
5. Task Breakdown (execução planejada)
6. Implementation (código)
7. Review / Refactor (loop)


| Etapa                       | Objetivo                                  | Modelo Ideal                | Alternativos                          |
| --------------------------- | ----------------------------------------- | --------------------------- | ------------------------------------- |
| **Ideation**                | Exploração aberta, brainstorming          | ChatGPT                     | GLM                                   |
| **Discovery**               | Entendimento de domínio, requisitos       | GLM                         | ChatGPT                               |
| **Architecture / Proposal** | Decisões críticas, trade-offs             | Claude (via Zen, on-demand) | GLM                                   |
| **Spec**                    | Definir contratos claros (inputs/outputs) | GLM                         | OpenCode Go                           |
| **Task Breakdown**          | Quebrar em tarefas executáveis            | GLM                         | OpenCode Go                           |
| **Implementation (Code)**   | Gerar código, iterar                      | GLM                         | OpenCode Go / Claude (casos difíceis) |
| **Review / Refactor**       | Melhorar qualidade, detectar problemas    | GLM                         | Claude (fallback), OpenCode Go        |


|                    | Gemini    | Claude       | GLM          |
| ------------------ | --------- | ------------ | ------------ |
| 🧠 raciocínio      | 🟡 bom    | 🟢 excelente | 🟡 bom       |
| 💻 coding          | 🟡 ok     | 🟢 excelente | 🟢 muito bom |
| 🔁 loops longos    | 🟡 médio  | ❌ ruim       | 🔥 excelente |
| 🚫 limites         | 🟡 médios | 🔴 pesados   | 🟢 leves     |
| 💰 custo escalável | ❌ ruim    | ❌ ruim       | 🔥 excelente |
