# @czottmann/pi-cortecs

Cortecs provider extension for [pi](https://pi.dev). It registers tool-capable [Cortecs](https://cortecs.ai/) models under the `cortecs` provider.

## Requirements

```bash
npm install -g @earendil-works/pi-coding-agent
```

## Install

From npm:

```bash
pi install npm:@czottmann/pi-cortecs
```

From a local checkout:

```bash
cd path/to/pi-cortecs
npm install
pi install "$PWD"
```

## Set up auth

Use pi's API-key flow:

```bash
pi
/login
# Choose "Use an API key", then "Cortecs".
```

Or set an environment variable before starting pi:

```bash
export CORTECS_API_KEY=your-key-here
```

Cortecs currently uses static API keys. It should appear under API keys in `/login`, not under subscriptions.

## Use

List registered models:

```bash
pi --list-models | grep cortecs
```

Start pi with Cortecs:

```bash
pi --provider cortecs
```

In interactive mode, `/cortecs-models` lists the Cortecs models registered by the extension.

## How it works

On startup, the extension fetches `GET https://api.cortecs.ai/v1/models`, keeps models tagged with `Tools`, and registers them with `pi.registerProvider()` using pi's `openai-completions` API adapter.

Model metadata is derived from the Cortecs catalog:

- `context_size` becomes pi's context window.
- `pricing.input_token`, `pricing.output_token`, `pricing.cache_read_cost`, and `pricing.cache_write_cost` become pi cost metadata.
- `Image` adds image input support.
- `Reasoning` marks a model as reasoning-capable.

If `CORTECS_API_KEY` is present, it is sent when fetching the catalog. The catalog is public at the time of writing, so models can still be registered without the key. Inference still needs either a saved API key from `/login` or `CORTECS_API_KEY`.

## Development

```bash
npm run check
npm run build
pi -e . --provider cortecs
```

## Publishing

GitHub Actions publishes the package to npm when a GitHub Release is published. The release tag must match `package.json` exactly, with or without a leading `v` (`v1.0.0` and `1.0.0` both work for version `1.0.0`).

The workflow uses npm Trusted Publishing, so it does not need an npm token secret. Configure this package on npm with this repository and workflow file (`.github/workflows/publish.yml`). The workflow builds the package, runs `npm run check`, and publishes with npm provenance.

## Acknowledgements & thanks

This project started as a fork of [tokenfactory-pi](https://github.com/mosquito/tokenfactory-pi/) by [mosquito](https://github.com/mosquito). Thanks to the original author for the clean starting point.
