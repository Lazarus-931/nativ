# Model Controls

Use this reference when a setting has a specific job to do. For a first experiment, follow the [Model Configuration walkthrough](/features/model-configuration) instead of changing everything here.

## When changes take effect

| Timing | Controls |
| --- | --- |
| **Next message** | System prompt, Thinking, sampling, and Structured Output. Send a new message or regenerate to evaluate the change. |
| **After server restart** | Max output and context-window launch limits, KV quantization, speculative decoding, and prefix caching. Wait until the orange **Server restart required** message disappears. |

## Context and sampling

| Control | What to know |
| --- | --- |
| **Max output** | Maximum response length in tokens. A ceiling, not a target. Check it if answers end abruptly. |
| **Context window** | How much conversation, attachment text, and instruction content the server can retain. Larger windows use more memory; start with the model's declared size. The composer shows current context usage. |
| **System prompt** | Persistent behavior for the conversation. Leaving the field empty keeps the model template's default, if it has one. Put one-off questions in the chat instead. |
| **Temperature** | Variation in token choice. `0` is useful for repeatable extraction; `0.2–0.5` allows modest variation; higher values can help creative drafting but may be less consistent. |
| **Top K** | Limits choices to the `K` most likely tokens. `0` disables this filter. |
| **Top P** | Keeps a probability-based set of likely tokens. `1` leaves the full set available. |
| **Min P** | Filters tokens far below the most likely token. `0` disables it. Aggressive values can remove useful uncommon terms. |
| **Repetition penalty** | Use when a model loops. Strong values can damage legitimate repetition in code, names, and tables. |

Change one sampling value at a time and compare the same prompt before and after. Temperature does not add knowledge or reasoning ability.

## Thinking

**Thinking** is for a model that supports reasoning on multi-step tasks. **Limit thinking** gives it a token budget; a smaller budget can reduce latency. Keep **Start token** and **EOS token** at their defaults unless the model's documentation specifies different markers. Nativ disables Thinking when the selected model does not advertise reasoning support and remembers supported model-specific profiles when you switch models. A limited thinking budget is unavailable with speculative decoding.

## Memory and speed

| Control | What to know |
| --- | --- |
| **Quantize KV cache** | Stores the growing attention cache at lower precision to reduce memory use. Lower **KV bits** save more memory but may affect output quality. |
| **Group size / Quantize after** | Keep the default group size unless reproducing a known configuration. Quantize after leaves the first specified tokens at full precision. |
| **TurboQuant** | Alternate cache scheme that changes the suggested bits and hides uniform-quantization group size. Compare quality and memory before keeping it. |
| **Drafter** | Enables speculative decoding with a compatible smaller draft model. A mismatched target or hidden size can prevent the server from loading. |
| **Family / Block size** | Leave family on **Auto** unless the drafter requires DFlash, EAGLE3, or MTP. Block size `0` lets the backend choose; larger blocks help only when draft acceptance is high. |
| **Prefix Caching** | Reuses blocks at the beginning of similar long prompts. **Cache blocks** sets capacity; **Tokens per block** sets block size. It is not useful when requests share little opening text. |

For a measured memory problem, follow [Reduce memory use](/features/model-configuration/reduce-memory). KV cache, drafter, and prefix-cache changes need a server restart.

## Structured Output and reset

**Structured Output** constrains generation with a named JSON Schema. Nativ validates the schema, but valid JSON shape does not guarantee true values. [Produce structured JSON](/features/model-configuration/structured-output) shows a complete example.

Structured Output and speculative decoding cannot be active together. The circular-arrow **Reset** button restores the complete Nativ settings object, not merely the last field you changed. Review your model and server settings after using it.
