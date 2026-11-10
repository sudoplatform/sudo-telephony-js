import 'dotenv/config'
import WebSocket from 'ws'

/*
 * Provide a global `WebSocket` for the Vitest `node` environment, which does not
 * expose one in the test realm. Amplify's AppSync realtime provider constructs
 * subscriptions with the global `WebSocket`, so integration tests that exercise
 * subscriptions require it. Only set when absent, leaving environments that
 * already provide a `WebSocket` untouched.
 */
const globalRef = globalThis as unknown as { WebSocket?: unknown }

if (typeof globalRef.WebSocket === 'undefined') {
  globalRef.WebSocket = WebSocket
}
