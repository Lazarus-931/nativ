# Model Configuration

Use this walkthrough to give a model a consistent role and compare one small change. Leave advanced controls at their defaults until you have a specific problem to solve.

## 1. Open the panel

In a chat with a model selected, choose **Model Configuration** in the upper-right corner. The panel opens on the right. The circular arrow in its title bar resets **all Nativ settings**, so do not use it to close the panel; select the Model Configuration button again instead.

## 2. Give the model a role

Under **Model Context**, enter a short **System prompt**. For example:

```text
Act as a careful research assistant. Separate claims from evidence, preserve uncertainty, and use concise headings.
```

Leave **Context window** at the model-provided value for your first test. **Max output** is a response-length ceiling, not a target.

{% annotatedimage src="/assets/features/model-configuration/03-model-context-in-use.png" alt="Model Context with output limit, context window, and a research-assistant system prompt" width=700 points="93|40|Max output caps response length;93|50|Leave the model's context size unchanged for a first test;93|75|Put persistent behavior in System prompt" caption="The example uses a research prompt; your first test can leave the size controls at their defaults." /%}

## 3. Change one sampling control

Set **Temperature** to `0.2` for a fairly steady research response. Leave Top K, Top P, and Min P alone for now. Send a representative prompt and read the answer. Then change only Temperature and send the **same prompt** again to compare.

{% annotatedimage src="/assets/features/model-configuration/05-sampling-and-prefix-in-use.png" alt="Sampling settings with Temperature 0.2 and other advanced controls visible" width=700 points="93|13|Start by changing only Temperature" caption="Temperature is one useful first experiment; leave the other controls as they are until you need them." /%}

The panel tells you when edits **apply to the next message** and when a **server restart is required**. Do not judge a restart-required change until you restart. For specific controls, see the [reference](/features/model-configuration/controls); for task-focused instructions, see [reduce memory use](/features/model-configuration/reduce-memory) or [produce structured JSON](/features/model-configuration/structured-output).
