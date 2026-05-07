CULTO / EVENTO
│
├── 1️⃣ CAPTURA
│   ├── Filmagem
│   │     └── iPhone / Android
│   │
│   ├── Fotos
│   │     └── iPhone / Android
│   │
│   ├── Live
│   │     └── PTZ + OBS
│   │
│   └── Marcações de momento
│         └── Stream Deck
│               → gera JSON com timestamps + tags
│
├── 2️⃣ INGESTÃO
│   ├── Upload via App próprio (PWA ou App)
│   │     ├── Upload local (Wi-Fi igreja)
│   │     ├── Associação com evento (Google Calendar API)
│   │     ├── Tags (louvor, palavra, etc.)
│   │     └── Vinculação a Target
│   │
│   ├── Storage temporário local
│   │     └── Servidor local (opcional)
│   │
│   └── Storage principal
│         └── Cloudflare R2 (ou S3)
│
├── 3️⃣ ORQUESTRAÇÃO
│   └── n8n
│         ├── Detecta upload concluído
│         ├── Cria Job de processamento
│         ├── Define fluxo (Short / Reel / Feed)
│         └── Gerencia estados
│
├── 4️⃣ ANÁLISE (Assistência IA)
│   ├── Transcrição
│   │     └── Whisper.cpp / Faster-Whisper (local)
│   │
│   ├── Detecção de silêncio
│   │     └── Silero VAD
│   │
│   ├── Detecção de aplausos / picos
│   │     └── Análise de áudio (Python + Librosa)
│   │
│   ├── Sugestão de cortes
│   │     └── LLM (via OpenClaw + Gemini OAuth)
│   │
│   └── Geração de EDL (Edit Decision List)
│         └── JSON estruturado
│
├── 5️⃣ PROCESSAMENTO DE VÍDEO
│   │
│   ├── 🔹 5A. CORTES (Shorts)
│   │     ├── Engine:
│   │     │     └── Worker FFmpeg (Docker)
│   │     │
│   │     ├── Funções:
│   │     │     ├── Trim / Concat
│   │     │     ├── loudnorm (áudio)
│   │     │     ├── Legendas SRT burn-in
│   │     │     └── Resize 9:16
│   │     │
│   │     └── Saída:
│   │           └── MP4 final no R2
│   │
│   └── 🔹 5B. COMPOSITION (Reels / Aftermovie)
│         ├── Engine:
│         │     └── DaVinci Resolve (Headless)
│         │           └── Automação via Python API
│         │
│         ├── Templates:
│         │     ├── Transições pré-definidas
│         │     ├── Motion graphics (Fusion)
│         │     ├── Lower thirds animados
│         │     ├── Micro zoom dinâmico
│         │     └── Trilha com ducking
│         │
│         └── Saída:
│               └── MP4 final no R2
│
├── 6️⃣ PROCESSAMENTO DE IMAGENS
│   ├── Seleção automática
│   │     └── Metadata + LLM
│   │
│   ├── Crop inteligente
│   │     └── OpenCV (Python)
│   │
│   ├── Ajuste de cor
│   │     └── PIL / OpenCV
│   │
│   └── Montagem carrossel
│         └── FFmpeg ou PIL
│
├── 7️⃣ PÓS-PROCESSAMENTO
│   ├── Thumbnail automática
│   │     └── FFmpeg frame capture
│   │
│   ├── Título / descrição
│   │     └── LLM via OpenClaw + Gemini OAuth
│   │
│   ├── Hashtags
│   │     └── LLM
│   │
│   └── Envio para revisão
│         └── Telegram Bot API
│
├── 8️⃣ APROVAÇÃO HUMANA
│   ├── Telegram
│   │     ├── Visualizar preview
│   │     ├── Botões Aprovar / Reprocessar
│   │     └── Solicitar ajustes
│   │
│   └── n8n recebe resposta
│
└── 9️⃣ PUBLICAÇÃO
    ├── Postiz (Self-Hosted)
    │     ├── Agendamento
    │     ├── Cross-posting
    │     └── API controlada via n8n
    │
    ├── Instagram
    ├── YouTube Shorts
    ├── Feed
    └── Stories