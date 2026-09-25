# Produce Structured JSON

Use Structured Output when another program needs predictable JSON fields instead of prose. In this example, a paper review returns a claim, supporting evidence, and a confidence number.

1. Open **Model Configuration → Structured Output**. Turn off **Drafter** if it is enabled; the two modes cannot run together.
2. Enable **Enforce JSON schema** and set **Schema name** to `PaperReview`.
3. Paste this schema into **JSON schema**:

```json
{
  "type": "object",
  "properties": {
    "claim": { "type": "string" },
    "evidence": { "type": "array", "items": { "type": "string" } },
    "confidence": { "type": "number" }
  },
  "required": ["claim", "evidence", "confidence"],
  "additionalProperties": false
}
```

Nativ shows an error below the editor if the schema cannot be parsed. Once it is valid, send a new paper-review prompt to test the output.

{% annotatedimage src="/assets/features/model-configuration/06-structured-output-in-use.png" alt="Structured Output enabled with the PaperReview schema for claim, evidence, and confidence" width=700 points="93|25|Enable schema enforcement;93|35|Name the schema;93|53|Paste a valid JSON Schema" caption="The PaperReview example asks the model for claim, evidence, and confidence fields." /%}

The schema constrains the answer's **shape**, not its truth. Check important claims and values before using them downstream.
