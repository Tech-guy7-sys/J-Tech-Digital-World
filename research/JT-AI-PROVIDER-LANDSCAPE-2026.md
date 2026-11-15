# JT AI Provider Landscape and Integration Policy

Research snapshot: 15 November 2026. This is a candidate catalogue, not a claim that every adapter is implemented, enabled, free, or available in every region. Verify current model IDs, pricing, quotas, data handling, account eligibility and commercial terms before integration.

## Provider catalogue

### General chat, reasoning, coding and multimodal APIs
- **OpenRouter** — multi-provider model catalogue and routing. https://openrouter.ai/docs
- **Google Gemini API** — multimodal chat and supported image/audio/video tasks. https://ai.google.dev/gemini-api/docs
- **OpenAI API** — Responses/agent tools, chat, vision, image, audio and embeddings. https://platform.openai.com/docs
- **Anthropic Claude** — reasoning, coding, tool use and vision. https://docs.anthropic.com
- **Groq** — hosted low-latency inference and supported audio models. https://console.groq.com/docs
- **Mistral AI** — chat, code, embeddings and document/OCR capabilities. https://docs.mistral.ai
- **DeepSeek** — reasoning and coding models. https://api-docs.deepseek.com
- **xAI** — Grok chat and supported multimodal APIs. https://docs.x.ai
- **Cohere** — enterprise chat, embeddings and reranking. https://docs.cohere.com
- **Together AI** — hosted open-model catalogue and task APIs. https://docs.together.ai
- **Fireworks AI** — hosted open models and task-specific endpoints. https://docs.fireworks.ai
- **Cerebras** — hosted inference for supported models. https://inference-docs.cerebras.ai
- **NVIDIA NIM** — hosted inference endpoints. https://docs.api.nvidia.com
- **Hugging Face Inference Providers** — partner model routing. https://huggingface.co/docs/inference-providers
- **Cloudflare Workers AI / AI Gateway** — edge inference and multi-provider gateway, including logging, caching and rate limiting. https://developers.cloudflare.com/workers-ai/ and https://developers.cloudflare.com/ai-gateway/usage/rest-api/
- **Azure OpenAI**, **Amazon Bedrock**, **Google Vertex AI** — managed enterprise deployments. https://learn.microsoft.com/azure/ai-services/openai/ · https://docs.aws.amazon.com/bedrock/ · https://cloud.google.com/vertex-ai/generative-ai/docs
- **Perplexity**, **Alibaba Model Studio/Qwen**, **Z.ai/GLM**, **Moonshot/Kimi**, **MiniMax** — additional search-grounded or regional model APIs. https://docs.perplexity.ai · https://www.alibabacloud.com/help/en/model-studio/ · https://docs.z.ai · https://platform.moonshot.ai/docs · https://platform.minimaxi.com/document

### Image generation and editing
- OpenAI Images: https://platform.openai.com/docs/guides/images
- Google Gemini image-capable models: https://ai.google.dev/gemini-api/docs
- Stability AI: https://platform.stability.ai/docs
- Black Forest Labs / FLUX: https://docs.bfl.ai
- Recraft: https://www.recraft.ai/docs
- Ideogram: https://developer.ideogram.ai
- fal.ai: https://docs.fal.ai
- Replicate: https://replicate.com/docs

### Video and creative media
- Google Veo via Gemini/Vertex: https://ai.google.dev/gemini-api/docs
- Runway: https://docs.dev.runwayml.com
- Luma: https://docs.lumalabs.ai
- fal.ai and Replicate: https://docs.fal.ai · https://replicate.com/docs
- Together AI: https://docs.together.ai

Video services commonly use asynchronous jobs. JT Motion should track job IDs, status, cancellation, output expiry and user-approved storage; do not promise instant rendering.

### Speech, audio and transcription
- ElevenLabs: https://elevenlabs.io/docs
- Deepgram: https://developers.deepgram.com
- AssemblyAI: https://www.assemblyai.com/docs
- Cartesia: https://docs.cartesia.ai
- OpenAI Audio: https://platform.openai.com/docs/guides/audio
- Hume: https://dev.hume.ai
- Gemini and Mistral: https://ai.google.dev/gemini-api/docs · https://docs.mistral.ai

### Embeddings, reranking, OCR and retrieval
- Cohere: https://docs.cohere.com
- Voyage AI: https://docs.voyageai.com
- Jina AI: https://jina.ai/reader/
- OpenAI: https://platform.openai.com/docs/guides/embeddings
- Mistral: https://docs.mistral.ai

### AI search and web extraction
- Exa: https://docs.exa.ai
- Tavily: https://docs.tavily.com
- Brave Search: https://api.search.brave.com/app/documentation
- Firecrawl: https://docs.firecrawl.dev
- Perplexity: https://docs.perplexity.ai

### Isolated cloud execution (not model providers)
- E2B: https://e2b.dev/docs
- Modal: https://modal.com/docs
- Daytona: https://www.daytona.io/docs
- Browserbase: https://docs.browserbase.com

## JT implementation rules

1. Cloud-hosted providers only in hosted JT products; do not add local runtimes to the hosted provider selector.
2. JT AI Core exposes capability-specific contracts: chat, vision, image generation/editing, video jobs, transcription, speech synthesis, embeddings, reranking and search.
3. Each model declares supported modalities, context size, streaming/tool/JSON support and availability. Never assume a provider's every model supports every capability.
4. Preserve the agreed JT AI Core v1 order: NVIDIA Nemotron 3 Ultra Free, then Google Gemma 4 26B A4B Free through OpenRouter. Gemini 2.5 Flash and Groq are optional cloud providers, not silent replacements for v1.
5. Routing is sequential and bounded; return the first successful result, record safe diagnostic metadata, and never merge multiple model outputs by default.
6. Store server credentials in Cloudflare secrets or user credentials in an approved encrypted store. Never expose keys in browser code, localStorage, Git, logs, release notes or installers.
7. Disclose the actual upstream provider and data path in privacy/settings surfaces even when the customer-facing product identity is JT/Jeff.
8. Add spend caps, per-user rate limits, timeouts, bounded retries, cancellation, usage accounting and clear quota errors.
9. Media jobs need asynchronous state tracking, cancellation, retention/expiry handling and explicit consent before storing results in JT Cloud.
10. Mark a provider as connected only after a live request using the configured credential. Mock tests prove adapter behavior only.
11. Before approval, verify official docs, pricing, quotas, region availability, retention/training policy, commercial rights and account requirements.

## Product priorities

- JT AI Agent / Jeff AI: chat, reasoning, coding, vision, tools, research/search and retrieval.
- JT Design: image generation/editing, brand assets, vector workflows and exports.
- JT Motion: storyboard plus queued video/image generation and render-job tracking.
- JT Studio: transcription, speech synthesis, audio analysis and approved audio-production integrations.
- JT Cloud: consent-based storage, versioning and user-controlled retention for generated assets.
- JT Desktop Agent: explicit push-to-talk/dictation and permission-gated actions; voice never authenticates or independently approves sensitive desktop operations.

## Release discipline

When a user requests an improvement, update the relevant app's source, tests and app-specific release notes in the same change. Validate the app and build, then prepare a versioned release candidate. Publish a GitHub Release only after the build/tests and packaged artifacts pass. Do not label an unbuilt change as a published release, and do not silently replace existing release assets. Keep cross-app changes in each affected app's own repository.
