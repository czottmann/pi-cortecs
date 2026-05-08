/**
 * Cortecs — pi extension
 *
 * Fetches the current Cortecs model catalog on startup and registers
 * tool-capable text-generation models as a "cortecs" provider.
 *
 * Environment:
 *   CORTECS_API_KEY — required, Cortecs API key
 *
 * Usage:
 *   pi -e /path/to/pi-cortecs
 *   pi -e /path/to/pi-cortecs --provider cortecs
 *   pi -e /path/to/pi-cortecs --provider cortecs --model claude-sonnet-4
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
export default function (pi: ExtensionAPI): Promise<void>;
