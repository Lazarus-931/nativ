# Your First Chat

This walkthrough takes you from an empty chat to a reply from a model running on your Mac. First, [download a model](/getting-started/downloading-models) and [start the server](/getting-started/starting-server).

## 1. Start a chat and choose a model

Select **New chat** in the sidebar. Open the model menu beside the message box and choose an installed model. Its name appears next to the send button.

{% image src="/assets/getting-started/first-chat/01-select-model.png" alt="An empty Nativ chat with SmolLM2-135M-Instruct selected beside the composer" caption="Check the model name before sending your first message." /%}

## 2. Send a clear request

Type a small task into the message box, such as:

```text
Give me three simple tips for staying focused while working.
```

Press **Return** or select the blue send arrow. Use **Command+Return** when you want a new line without sending.

{% image src="/assets/getting-started/first-chat/02-compose-prompt.png" alt="The first-chat prompt written in Nativ's composer with a local model selected" caption="Write the request, then send it with Return or the blue arrow." /%}

## 3. Read the reply

The answer appears below your message. A model's first response can take longer while it loads into unified memory. Once the answer finishes, type a follow-up in the same chat; Nativ keeps the earlier messages as context. Use **New chat** when you change subjects.

If you cannot send, check that a model is selected and the server is running. If generation fails, open **Dev → Developer → Server Output** for the error.

Next, [adjust appearance and chat text size](/getting-started/customization), or learn how to [find files in Artifacts](/features/artifacts).
