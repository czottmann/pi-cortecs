# Changelog

## 1.1.0 - 2026-06-14

- Update the Cortecs provider API key reference to pi's current `$CORTECS_API_KEY` syntax, removing the startup deprecation warning.

## 1.0.0 - 2026-05-08

Initial release.

- Registers Cortecs as a pi provider.
- Fetches the Cortecs model catalog on startup.
- Registers tool-capable models with context, pricing, image, and reasoning metadata.
- Supports pi's API-key login flow and the `CORTECS_API_KEY` environment variable.
- Adds `/cortecs-models` to list available Cortecs models.
