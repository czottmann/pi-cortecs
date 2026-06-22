# AGENTS.md

## Project overview

This repository is `@czottmann/pi-cortecs`, a Pi extension package that registers a `cortecs` provider for the [Cortecs](https://cortecs.ai/) API (`https://api.cortecs.ai/v1`).

On startup the extension fetches the Cortecs model catalog, keeps the tool-capable models, and registers them with Pi using the `openai-completions` API adapter. It started as a fork of [tokenfactory-pi](https://github.com/mosquito/tokenfactory-pi/).

## Important files

- `extensions/cortecs.ts` — the extension. Fetches the catalog and registers the provider and the `/cortecs-models` command.
- `README.md` — user-facing install, auth, and usage docs.
- `CHANGELOG.md` — per-release notes, shipped in the npm package.
- `package.json` — npm package metadata, Pi manifest, scripts, peer/dev dependencies.
- `.github/workflows/publish.yml` — publishes to npm on a GitHub Release via Trusted Publishing.

## How the extension works

On load it fetches `GET https://api.cortecs.ai/v1/models`, keeps models tagged `Tools`, and registers them under the `cortecs` provider via `pi.registerProvider()` with the `openai-completions` adapter. Model metadata is derived from the catalog: `context_size` becomes the context window, `pricing.*` becomes pi cost metadata, the `Image` tag adds image input, and the `Reasoning` tag marks a model as reasoning-capable.

`CORTECS_API_KEY` is sent with the catalog request when present, but the catalog is public, so models register without it. Inference needs a saved API key from `/login` or `CORTECS_API_KEY`. The extension also registers `/cortecs-models` to list the registered models.

## Development commands

```bash
npm run check          # tsc --noEmit
npm pack --dry-run     # for package/release-sensitive changes
```

`npm run build` is an alias for `tsc --noEmit`. This package ships TypeScript source loaded by pi's jiti runtime; there is no compiled `dist/`.

## Coding conventions

- TypeScript is strict, ESM, NodeNext (`tsconfig.json`).
- Keep code simple and explicit. Avoid abstractions without multiple call sites.
- Pi core imports (`@earendil-works/*`) belong in `peerDependencies` with `"*"`; pinned development versions go in `devDependencies`. Do not add runtime dependencies.

## Packaging and releases

- The package ships the source files listed in `files` (`extensions`, `README.md`, `CHANGELOG.md`), not a build. `npm` also includes `package.json` and `LICENSE.md` automatically.
- Releases run through GitHub Releases: add a `CHANGELOG.md` entry, bump the version, commit, tag `vX.Y.Z`, and create a matching GitHub Release. `publish.yml` triggers on `release: published` and runs `npm publish --provenance` via Trusted Publishing.
- Publish a given version either manually or via a GitHub Release, never both — a duplicate publish fails.

## Git hygiene

- Check `git status --short` before committing or broad edits.
- Do not overwrite unrelated user changes.
- Commit only when explicitly asked.
