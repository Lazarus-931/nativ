# Reduce Memory Use

Use KV-cache quantization when a long conversation or document pushes memory use too high. It reduces the attention cache, **not** the model weights. If the model itself will not fit, choose a smaller model instead.

1. Open a chat with the model you want to tune, then open **Model Configuration**.
2. Enable **Quantize KV cache**. Start with the default bit and group-size values; lower bits save more memory but may change output quality.
3. If you want the beginning of each prompt kept at full precision, set **Quantize after** to a token count such as `256`.
4. Restart the server when Nativ shows **Server restart required**. Run the same representative prompt and compare memory use and the answer with your earlier result.

{% annotatedimage src="/assets/features/model-configuration/04-kv-quantization-in-use.png" alt="KV quantization enabled with 4-bit cache values, group size 64, and quantization after 256 tokens" width=700 points="93|24|Enable cache quantization;93|51|Lower bits save more cache memory;93|65|Keep group size at its default to start;93|79|Leave the first 256 tokens unquantized" caption="This example uses 4-bit cache values and keeps the first 256 tokens at full precision. It requires a server restart." /%}

If quality worsens, raise the bit setting or turn quantization off and restart again. **TurboQuant** is a separate advanced scheme; compare it only after you have a baseline.
