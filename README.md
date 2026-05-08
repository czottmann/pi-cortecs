# pi-cortecs

[Cortecs](https://cortecs.ai/) provider extension for [pi coding agent](https://pi.dev).

The extension fetches the current model catalog from the Cortecs API on startup and registers tool-capable models under the `cortecs` provider.

## Prerequisites

```bash
# Install pi coding agent globally
npm install -g @earendil-works/pi-coding-agent
```

## Installation

```bash
# Install the extension using pi's package manager
pi install npm:pi-cortecs
```

## Setup

```bash
# Get an API key from Cortecs, then expose it to pi
export CORTECS_API_KEY=your-key-here
```

## Usage

```bash
# List available models to verify installation
pi --list-models | grep cortecs
```

In interactive mode, use `/cortecs-models` to list all available Cortecs models.

## Development

```bash
# Build the TypeScript
npm run build

# Test locally from the project directory
cd path/to/pi-cortecs
pi -e . --provider cortecs
```

## How it works

On startup the extension:

1. Reads `CORTECS_API_KEY` from the environment. If it is missing, the extension does nothing.
2. Fetches `GET /v1/models` from `https://api.cortecs.ai`.
3. Filters the catalog for models tagged with `Tools`.
4. Registers them as the `cortecs` provider with `pi.registerProvider()`.

Cortecs uses an OpenAI-compatible chat completions API. This extension configures pi to use `openai-completions` with `max_tokens` and system-role messages for compatibility.

## Acknowledgements & Thanks

This project started as a fork of [tokenfactory-pi](https://github.com/mosquito/tokenfactory-pi/) by [mosquito](https://github.com/mosquito). Thanks to the original author for the clean starting point.
