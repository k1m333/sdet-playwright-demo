# LLM Reliability Evaluation Platform

A small platform for **testing LLM reliability classification** using deterministic rules and automated evaluation.

The system generates reliability events, computes a deterministic ground truth, and verifies that a model correctly classifies system severity.

---

## Architecture

Dataset Generator → Ground Truth Oracle → LLM Classifier → Evaluation Harness

- **Dataset Generator**  
  Audit Console API (Node.js + Express) generates reliability events  
  201 Created  
  200 Idempotent Replay  
  409 Immutable Conflict  
  429 Rate Limited  
  503 Dependency Failure  

- **Ground Truth Oracle**  
  Deterministic rules map status codes to severity levels

- **LLM Classifier (Model Under Test)**  
  Model predicts system severity and returns a label with rationale

- **Evaluation Harness**  
  Playwright tests compare model output with deterministic ground truth

Result: **PASS / FAIL**

---

## Severity Rules

| Status Code | Severity |
|-------------|----------|
| 200 / 201   | NONE |
| 409         | LOW |
| 429         | MEDIUM |
| 503         | HIGH |

Example:

events: [429, 503]  
severity: HIGH

---

## LLM Output Format

The classifier returns a severity label and evidence-based rationale.

Example:

```json
{
  "label": "MEDIUM",
  "rationale": "Severity MEDIUM due to rate limiting (429)."
}