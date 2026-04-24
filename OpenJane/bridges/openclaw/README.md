# OpenJaneChat OpenClaw Channel

Text-first OpenClaw channel plugin for the OpenJane bridge.

The primary v1 contract is event-based:

- OpenJane sends inbound events to `POST /OpenJaneChat/events`.
- OpenClaw sends outbound events to `POST {baseUrl}/events`.
- The older `POST /OpenJaneChat/webhook` payload is still accepted as a temporary compatibility path.

Audio and video are reserved in the event schema but are not active in this plugin slice.

## Install Locally On Mac

Copy or clone this folder onto the Mac, then from the plugin folder run:

```sh
npm install
npm run typecheck
npm test
```

Configure OpenClaw with:

```json
{
  "channels": {
    "OpenJaneChat": {
      "token": "shared-local-token",
      "baseUrl": "http://localhost:3000",
      "allowFrom": ["jane"],
      "dmSecurity": "allowlist"
    }
  }
}
```

Install/test this as a local OpenClaw plugin package from this folder path.

## OpenJane Receives From OpenClaw

OpenJane should implement:

```http
POST /events
Authorization: Bearer shared-local-token
Content-Type: application/json
Idempotency-Key: evt_...
```

Example body:

```json
{
  "schemaVersion": "openjane.bridge.v1",
  "eventId": "evt_01",
  "eventType": "assistant.message",
  "sentAt": "2026-04-24T18:10:00.000Z",
  "source": { "system": "openclaw", "instanceId": "local" },
  "target": { "system": "openjane", "channel": "OpenJaneChat" },
  "conversation": { "id": "lobster-control", "type": "direct" },
  "actor": { "id": "openclaw", "role": "agent" },
  "content": [
    { "type": "text", "text": "Parser slice completed. Tests passed." }
  ],
  "intent": { "kind": "chat" },
  "correlation": {},
  "meta": {}
}
```

Expected response:

```json
{
  "ok": true,
  "eventId": "evt_01",
  "acceptedAt": "2026-04-24T18:10:01.000Z",
  "status": "accepted"
}
```

## OpenJane Sends Into OpenClaw

OpenJane can send the same event envelope to:

```http
POST /OpenJaneChat/events
Authorization: Bearer shared-local-token
Content-Type: application/json
Idempotency-Key: evt_...
```

Text input example:

```json
{
  "schemaVersion": "openjane.bridge.v1",
  "eventId": "evt_user_01",
  "eventType": "user.message",
  "sentAt": "2026-04-24T18:10:00.000Z",
  "source": { "system": "openjane", "instanceId": "openjane-local" },
  "target": { "system": "openclaw", "channel": "OpenJaneChat" },
  "conversation": { "id": "lobster-control", "type": "direct" },
  "actor": { "id": "jane", "displayName": "Jane", "role": "human" },
  "content": [{ "type": "text", "text": "approve this?" }],
  "intent": { "kind": "chat" },
  "correlation": {},
  "meta": {}
}
```

Compatibility input still accepted:

```http
POST /OpenJaneChat/webhook
Authorization: Bearer shared-local-token
Content-Type: application/json
```

```json
{
  "channelId": "lobster-control",
  "userId": "jane",
  "text": "approve this?",
  "messageId": "msg_123",
  "threadId": "thread_456"
}
```

## Curl Smoke Tests

OpenJane receiver smoke test:

```sh
curl -i http://localhost:3000/events \
  -H "Authorization: Bearer shared-local-token" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: evt_01" \
  -d '{"schemaVersion":"openjane.bridge.v1","eventId":"evt_01","eventType":"assistant.message","sentAt":"2026-04-24T18:10:00.000Z","source":{"system":"openclaw","instanceId":"local"},"target":{"system":"openjane","channel":"OpenJaneChat"},"conversation":{"id":"lobster-control","type":"direct"},"actor":{"id":"openclaw","role":"agent"},"content":[{"type":"text","text":"hello from OpenClaw"}],"intent":{"kind":"chat"},"correlation":{},"meta":{}}'
```

OpenClaw inbound event smoke test:

```sh
curl -i http://localhost:PORT/OpenJaneChat/events \
  -H "Authorization: Bearer shared-local-token" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: evt_user_01" \
  -d '{"schemaVersion":"openjane.bridge.v1","eventId":"evt_user_01","eventType":"user.message","sentAt":"2026-04-24T18:10:00.000Z","source":{"system":"openjane","instanceId":"openjane-local"},"target":{"system":"openclaw","channel":"OpenJaneChat"},"conversation":{"id":"lobster-control","type":"direct"},"actor":{"id":"jane","role":"human"},"content":[{"type":"text","text":"approve this?"}],"intent":{"kind":"chat"},"correlation":{},"meta":{}}'
```

Replace `PORT` with the OpenClaw gateway port.

## Known Boundary

The plugin parses and authenticates inbound events, then normalizes them into a text inbound event. The final concrete dispatch into a running OpenClaw host is isolated in `handleOpenJaneChatInbound` and may need one SDK-specific hookup once tested inside the actual OpenClaw runtime.
