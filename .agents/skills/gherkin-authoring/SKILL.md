---
name: gherkin-authoring
description: Use when drafting, reviewing, or improving Gherkin, Cucumber scenarios, BDD acceptance criteria, feature examples, Scenario Outlines, Backgrounds, Rules, Doc Strings, Data Tables, tags, or Gherkin embedded in Markdown. Provides syntax reference, best practices, Reqnroll integration, and canonical spec mapping.
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Gherkin Authoring

Write Gherkin as executable examples of business behavior. Optimize for domain language, concrete examples, and observable outcomes; keep implementation and UI mechanics inside step definitions.

## Scope

Use for standalone `.feature` files and Gherkin embedded in Markdown or other prose. When Gherkin is inside a Markdown wrapper, review or rewrite only the Gherkin section unless the user asks for broader document edits. Preserve fences, headings, and surrounding prose. If the input includes Markdown around the Gherkin, return the Markdown wrapper with only the Gherkin block changed.

## Workflow

1. Identify the Gherkin region: whole `.feature` file, fenced `gherkin` block, indented block, quoted acceptance criteria, or inline scenario text.
2. Preserve the surrounding wrapper unless explicitly asked to change it. For Markdown input, return the heading/prose/fence context, not just the fenced Gherkin block.
3. Clarify the behavior as examples: initial state, event, observable outcome.
4. Choose the smallest structure that expresses the behavior: `Feature`, optional `Rule`, `Background`, `Scenario`/`Example`, or `Scenario Outline` with `Examples`.
5. Keep scenarios concrete and short, usually 3-5 steps.
6. Review syntax and readability before returning: colons, step keywords, duplicate step text, observable outcomes, and table/doc string formatting.

## Quick Reference

| Construct | Use for | Syntax note |
| --- | --- | --- |
| `Feature:` | One high-level capability per feature document or block | Requires `:` |
| `Rule:` | Group scenarios under one business rule | Requires `:` |
| `Scenario:` / `Example:` | One concrete example | Requires `:` |
| `Background:` | Short shared context for following scenarios | Requires `:`; one per `Feature` or `Rule` |
| `Scenario Outline:` | Same behavior with varied data | Requires `Examples:` and `<parameter>` placeholders |
| `Examples:` | Data rows for an outline | Requires `:` and a table |
| `Given` | Known state or precondition | No `:` |
| `When` | Event or action | No `:` |
| `Then` | Observable outcome | No `:` |
| `And` / `But` | Continue the previous step type | No `:` |
| `*` | Bullet-like step list | Use sparingly for list-style setup |
| `@tag` | Group or filter features/scenarios | Place above the item tagged |
| `#` | Line comment | Line comments only; no block comments |
| `"""` | Doc String | Passed as final step argument |
| `\|` | Data Table | Passed as final step argument |

## Authoring Rules

- Use the language domain experts use. Avoid translating business behavior into UI clicks, HTTP calls, database rows, queues, mocks, or implementation details.
- `Given` puts the system in a known state. Avoid user interaction in `Given` steps.
- `When` describes one meaningful event.
- `Then` describes an outcome visible to a user or external system. Do not assert hidden database state unless that is the actual external contract.
- Use `And` and `But` to improve flow, not to hide new phases of the scenario.
- Avoid identical step text under different step keywords; Cucumber ignores `Given`/`When`/`Then` when matching step definitions.
- Use two-space indentation unless preserving existing style.
- Keep `Background` short and vivid (1-4 steps). If it grows beyond about four lines, use higher-level steps or split by `Rule`/`Feature`.
- Use `Scenario Outline` only when examples share the same behavior and differ by data. Avoid for only 1-2 examples.
- Escape `|` as `\|`, newline as `\n`, and backslash as `\\` inside Data Table cells.
- Write step text that can be reused: prefer parameterized steps over hardcoded values.

## Step Patterns

### Given (Arrange) — establish context

```gherkin
Given a registered user
Given a user "Alice" with role "manager"
Given the cart contains 3 items
Given an order "ORD-001" with status "pending"
```

### When (Act) — describe the event

```gherkin
When the user submits the form
When the customer adds the product to cart
When the payment is processed
When the timer expires
```

### Then (Assert) — verify observable outcome

```gherkin
Then the order status is "confirmed"
Then a success message is displayed
Then an email is sent to the user
Then no error is displayed
```

## Background

Use Background for common setup shared by all scenarios in a Feature or Rule:

```gherkin
Feature: Shopping Cart

  Background:
    Given a customer is logged in
    And the store is open

  Scenario: Add item to cart
    When the customer adds a product to cart
    Then the cart contains 1 item

  Scenario: Remove item from cart
    Given the cart contains a product
    When the customer removes the product
    Then the cart is empty
```

Background also nests inside `Rule`:

```gherkin
Feature: E-commerce

  Background:
    Given the store is available

  Rule: Cart Management

    Background:
      Given a customer is logged in

    Scenario: Add to cart
      ...
```

## Rule Keyword

Groups scenarios under one business rule:

```gherkin
Feature: Account Management

  Rule: Password Requirements

    Scenario: Password too short
      ...

    Scenario: Password missing special character
      ...

  Rule: Account Lockout

    Background:
      Given a user with valid credentials

    Scenario: Lock after 3 failed attempts
      ...
```

## Scenario Outline

```gherkin
Scenario Outline: Validate password strength
  When the user enters password "<password>"
  Then the validation result is "<result>"

  Examples: Valid passwords
    | password    | result |
    | Str0ng!Pass | valid  |
    | C0mpl3x#Pwd | valid  |

  Examples: Too short
    | password | result  |
    | Ab1!     | invalid |
    | Xy2@     | invalid |
```

Use Scenario Outline for: same logic with different data, boundary testing, error message variations, multiple valid/invalid inputs.
Avoid when: scenarios have fundamentally different flows, setup differs significantly, only 1-2 examples.

## Tags

```gherkin
@authentication @e2e
Feature: User Login

  @smoke @critical
  Scenario: Successful login
    ...

  @security @negative
  Scenario: Account lockout after failed attempts
    ...
```

Tags cascade down: Feature -> Rule -> Scenario Outline -> Examples.

| Category | Examples |
| --- | --- |
| Priority | @critical, @high, @medium, @low |
| Type | @smoke, @regression, @e2e, @integration |
| Feature | @authentication, @checkout, @search |
| State | @wip, @pending, @manual, @flaky |
| Non-functional | @security, @performance, @accessibility |
| Environment | @dev, @staging, @prod |

## Data Tables

```gherkin
Given the following products exist:
  | name   | price | category    |
  | Laptop | 999   | Electronics |
  | Shirt  | 29    | Clothing    |

Given a product with:
  | name     | Gaming Laptop |
  | price    | 1299          |
  | category | Electronics   |
  | stock    | 50            |
```

## Doc Strings

```gherkin
When I send a POST request with:
  """json
  {
    "name": "New Product",
    "price": 99.99
  }
  """
```

Supported type hints: `json`, `xml`, `sql`, `markdown`, etc.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Complaining about Markdown around a Gherkin block | Preserve the wrapper and work only on the Gherkin section. |
| Returning only a fenced Gherkin block when the input was Markdown | Return the original Markdown wrapper with only the Gherkin content changed. |
| Feature Checkout or Scenario: Place order: | Add the missing colon after Feature; remove extra colon from the scenario title. |
| Given I click the checkout button | Move interaction to When; describe state in Given. |
| Then an order row exists in the database | Prefer an observable result, such as an order confirmation. |
| Reusing the same step text for Given and Then | Change the wording so the domain meaning is distinct. |
| Long scripts with many UI actions | Raise the abstraction and keep the scenario to the behavior. |
| Large Background sections | Use higher-level context or split scenarios by Rule or Feature. |

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
| --- | --- | --- |
| Feature-length scenarios | Hard to maintain | Split into focused scenarios |
| Imperative steps | Brittle, verbose | Use declarative style |
| Technical jargon | Not business-readable | Use domain language |
| UI coupling | Breaks on UI changes | Focus on behavior |
| Missing Background | Duplicated Given steps | Extract common setup |
| Too many Outline Examples | Slow, redundant | Test boundary cases only |
| Hardcoded fixtures | Not reusable | Parameterize or abstract |

## Integration with Canonical Spec

```yaml
requirements:
  - id: "REQ-001"
    text: "WHEN a user submits valid credentials, the system SHALL authenticate the user"
    acceptance_criteria:
      - id: "AC-001"
        given: "a registered user with valid credentials"
        when: "the user submits the login form"
        then: "the user is authenticated"
        and:
          - "a session is created"
          - "the user is redirected to dashboard"
```

| Canonical Field | Gherkin Element |
| --- | --- |
| acceptance_criteria.given | Given step(s) |
| acceptance_criteria.when | When step(s) |
| acceptance_criteria.then | Then step(s) |
| acceptance_criteria.and | Additional And/But steps |

## Reqnroll Integration (.NET)

```csharp
[Binding]
public class LoginSteps
{
    private readonly ScenarioContext _context;

    public LoginSteps(ScenarioContext context) => _context = context;

    [Given(@"a registered user exists")]
    public void GivenARegisteredUserExists()
    {
        _context["user"] = new User("test@example.com", "password123");
    }

    [When(@"the user enters valid credentials")]
    public void WhenTheUserEntersValidCredentials()
    {
        var user = _context.Get<User>("user");
        _context["loginResult"] = _authService.Login(user.Email, user.Password);
    }

    [Then(@"the user is logged in")]
    public void ThenTheUserIsLoggedIn()
    {
        _context.Get<LoginResult>("loginResult").Success.Should().BeTrue();
    }
}
```

```xml
<PackageReference Include="Reqnroll" Version="2.*" />
<PackageReference Include="Reqnroll.NUnit" Version="2.*" />
```

Use [BeforeScenario] / [AfterScenario] hooks for setup/teardown. Share state via ScenarioContext.

## Validation Checklist

Before finalizing a Gherkin scenario:

- [ ] Single behavior per scenario
- [ ] Declarative, not imperative
- [ ] Uses domain language
- [ ] Given establishes context only (no user interaction)
- [ ] When contains one meaningful event
- [ ] Then asserts observable outcomes
- [ ] No implementation details or UI mechanics
- [ ] Scenario name describes the behavior and outcome
- [ ] Markdown wrapper preserved (if applicable)

## References

- [Syntax Reference](references/syntax-reference.md) - Complete Gherkin syntax with examples
- [Best Practices](references/best-practices.md) - BDD best practices and patterns

**Related Skills:** canonical-spec-format, ears-authoring, spec-management

---

**Version:** 3.0.0 (merge of gherkin-authoring v1 + gherkin-authoring2)
