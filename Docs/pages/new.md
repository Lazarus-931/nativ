# What's new

Every Nativ release and what it brings — newest first.

{% timeline %}

{% release version="Nativ 0.3.6" date="Aug 31, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.6" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.6).

#### New features
- **Agent tools** — file writing, editing, and search, plus a terminal tool for shell commands.
- **Custom Kits & model registry** — manage your own Kits alongside a shared model registry.
- **Context window ring** — a live context-usage indicator in the chat composer.

#### Changed
- **Multi-window support** — synchronized data, coordinated inference, and window-scoped commands across windows.
- Standardized panels, status indicators, and typography across the app.
- LFM2.5-2.6B is the new fast default; faster builds and a lazy chat transcript.

#### Fixed
- Detect a busy server port before launch instead of reporting a crash.
- Fix port reuse when switching models and unknown-tool mislabeling.
{% /release %}

{% release version="Nativ 0.3.5" date="Aug 26, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.5" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.5).

#### New features
- **GLM-5.3-Flash (Z.ai)** added to the partner models.
- **Safe file reading** — an optional tool to read files from a folder you choose.
- Discover third-party server tools installed via Homebrew.

#### Changed
- Simplified custom MCP stdio setup; stabilized Kit definitions and activation.
- Improved file processing and documented the Homebrew install path.

#### Fixed
- Allow slow local models to start; keep models whose shard index describes another build.
{% /release %}

{% release version="Nativ 0.3.4" date="Aug 24, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.4" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.4).

#### New features
- **System stats** now report temperature, fans, and power.
- Hugging Face token stored in the Keychain, audio upload to the library, and live server settings.

#### Changed
- Reworked control panel with smooth animations and smoother sidebar resizing.
- Moved several stores off the main thread and onto `@Observable`.

#### Fixed
- Better gated-model download errors, multi-key audio shortcuts, long-prompt scrolling, and the dark-mode overlay.
{% /release %}

{% release version="Nativ 0.3.3" date="Aug 18, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.3" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.3).

#### New features
- **Scheduled tasks workspace** — a dedicated space for scheduled tasks.

#### Fixed
- Core audio callback isolation and audio transcription configuration lifetime.
{% /release %}

{% release version="Nativ 0.3.2" date="Aug 17, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.2" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.2).

#### New features
- **Reranking capability discovery**, conversation forks for prompt editing, and shared document extraction.

#### Changed
- Incremental fully-styled streamed markdown, Swift 6.3 with concurrency fixes, and polished sidebar and model controls.

#### Fixed
- Recover from a frozen chat instead of locking the UI; microphone permission flow; download progress reporting.
{% /release %}

{% release version="Nativ 0.3.1" date="Aug 12, 2026" href="https://github.com/Blaizzy/nativ/releases/tag/v0.3.1" %}
New version of Nativ. [View the release on GitHub](https://github.com/Blaizzy/nativ/releases/tag/v0.3.1).

#### New features
- **Parallel Search** in the MCP catalog, a model README details panel, and global model folder access.

#### Changed
- Improved model discovery, downloads, and provider branding; polished navigation, composers, and Artifacts; better chat markdown.

#### Fixed
- Stabilized onboarding model metadata loading.
{% /release %}

{% /timeline %}

Looking for older versions? See the [full release history on GitHub](https://github.com/Blaizzy/nativ/releases).
