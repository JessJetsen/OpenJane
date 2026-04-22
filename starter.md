# OpenJane Starter Brief

## Project

**OpenJane**

A local-first companion interface for wearable AI, mobile devices, and agentic software foundries.

OpenJane is intended to become a **SPINE-aware human input and notification endpoint** for the Jetsen Software Foundry. It should help a human speak into the system, receive meaningful updates back from it, and stay aligned with distributed agents, build tools, models, queues, and project workflows.

This is not “just a chatbot wrapper” and not “just a smart glasses demo.”

It is a durable human-facing interface for agentic work.

---

## Current Repository State

The repo exists on GitHub and is synced on both machines:


Mac:
~/Documents/GitHub/openjane

PC:
J:\JetsenCybernetics\OpenJane

Codex is currently pointed at the repo root on the Mac.

The immediate build target is the iOS app in Xcode.

Current Platform Setup
Apple / iOS

An Xcode iOS AR project has been created.

Project choices:

Product Name: OpenJane
Team: Jens Jensen
Organization Identifier: com.thetinkeringwizard
Bundle Identifier: com.thetinkeringwizard.openjane
Interface: SwiftUI
Language: Swift
Content Tech: RealityKit
Testing System: Swift Testing

Apple Developer Team ID:

4MK62CJVLL
Meta Developer Setup

The project is registered with Meta as a developer app.

Meta app details were added for iOS using:

Team ID: 4MK62CJVLL
Bundle ID: com.thetinkeringwizard.openjane
Universal Link: https://openjane.thetinkeringwizard.com

Meta provided XML / plist entries that need to be added to the Xcode project’s Info.plist.

Important: Xcode’s Info.plist visual editor is a key/value plist editor. The generated Meta XML should either be added carefully as nested plist keys or pasted into Info.plist using:

Right click Info.plist
→ Open As
→ Source Code

The XML must be inserted inside the existing top-level <dict> ... </dict>, not as a second plist document.

Web / Universal Link Setup

The universal-link domain is:

https://openjane.thetinkeringwizard.com

The Apple app association file exists at:

https://openjane.thetinkeringwizard.com/.well-known/apple-app-site-association

Current association JSON:

{
  "applinks": {
    "details": [
      {
        "appIDs": [
          "4MK62CJVLL.com.thetinkeringwizard.openjane"
        ],
        "components": [
          {
            "/": "/*"
          }
        ]
      }
    ]
  }
}

The OpenJane subdomain currently returns HTTP 200 and serves static content.

The root domain and OpenJane subdomain had stale phishing/reputation flags from several vendors. False-positive review requests have been submitted to major vendors. Fortinet has already reclassified at least one result out of malicious/phishing into “Meaningless Content.” NordVPN support has escalated a Threat Protection false-positive review.

Cloudflare JavaScript Web Analytics was disabled temporarily to keep the site static and boring during reputation cleanup.

For now, do not add tracking scripts, external JavaScript, login forms, downloads, or redirects to the OpenJane web page.

Primary Development Seat

Use the Mac for iOS/Xcode work.

Use the PC later for broader foundry, contracts, bridge, OpenClaw, and SPINE integration work.

Preferred workflow:

Mac / Xcode:
- iOS app
- SwiftUI
- RealityKit
- Meta wearable integration
- signing
- plist/entitlements

PC / VS Code / Codex:
- docs
- contracts
- schemas
- OpenClaw bridge
- SPINE integration
- foundry tooling

Git rule:

Pull before editing.
Do one focused slice.
Commit with a clear message.
Push.
Pull on the other machine before continuing.
Core Vision

OpenJane should eventually feel like a trusted companion at the edge of the user’s workflow.

It should support:

voice-first interaction
wearable/mobile context delivery
project seed prompts
slice completion notifications
blocker notifications
build/test status updates
agent-to-human questions
human approval moments
lightweight project summaries
SPINE-aware routing
local-first assistant workflows

OpenJane should help the human stay oriented while work is happening.

It should not force the human to stare at dashboards, terminals, logs, build windows, and agent threads all day.

Role in the Foundry

OpenJane is the human input and notification endpoint for the Jetsen Software Foundry.

It does not replace:

SPINE
OpenClaw
NEMOClaw
build tools
worker nodes
local model runtimes
project queues
artifact stores

Instead, OpenJane provides a clean interface to them.

Conceptual flow:

Human
  ↓
OpenJane
  ↓
SPINE-aware Intent / Notification / Context Bridge
  ↓
Jetsen Software Foundry
  ↓
OpenClaw / NEMOClaw / Build Tools / Local Agents / Worker Nodes
  ↓
Artifacts, logs, decisions, completions, blockers

OpenJane is not the worker.

OpenJane is the companion/interface layer.

Architectural Principle

OpenJane should not own compilation, model execution, queue management, or artifact generation directly.

Those responsibilities belong to the systems underneath it.

OpenJane is responsible for:

intent capture
notification delivery
context summarization
human approval moments
conversation continuity
command routing
project awareness
interface presence

Execution belongs elsewhere.

This separation keeps the system modular, testable, secure, and replaceable.

Security Philosophy

OpenJane should be security-aware from the ground up.

Core principles:

OpenJane does not execute arbitrary commands by default.
OpenJane treats every external agent/build/tool message as untrusted input.
Commands require explicit routing and policy checks.
Dangerous actions require human approval.
Secrets never belong in event payloads.
Device surfaces receive summaries, not raw internal logs by default.
Local-first is preferred.
Cloud calls should be explicit and documented.
Bridges should be replaceable and inspectable.
Small, clear contracts are preferred over framework magic.

This project follows a “from dust” philosophy:

build the smallest useful loop first
keep dependencies intentional
avoid unnecessary wrappers
prefer clear contracts
make system behavior inspectable
treat latency as a product problem
document reasoning, not just code
Early Device Surfaces

OpenJane should treat devices as surfaces, not as the whole product.

Initial surfaces:

iOS app:
- primary current build target
- SwiftUI
- RealityKit
- Meta wearable toolkit integration path

Ray-Ban Meta / Meta AI glasses:
- mobile-app connected wearable surface
- not directly programmed as standalone glasses yet

Quest / XR:
- future Unity + Meta XR SDK surface

Desktop:
- future foundry/SPINE/OpenClaw endpoint

Voice:
- future input/output mode
Initial Event Vocabulary

OpenJane should eventually understand events like:

slice.completed
slice.blocked
agent.question
build.failed
build.completed
artifact.ready
review.required
project.seeded
queue.waiting
node.available
node.offline

This event language should remain platform-neutral.

The iOS app can start with mocked/local examples before any SPINE bridge exists.

Initial Data Concepts

Use these terms consistently:

OpenJane:
Human-facing companion endpoint.

SPINE:
Event/context backbone for the foundry.

Foundry:
Project execution environment.

Agent:
Capability-bearing worker/persona/tool endpoint.

Node:
Physical or logical machine/runtime.

Slice:
Small unit of planned work.

Flight:
Executed work attempt.

FlightPlan:
Reusable execution recipe.

Artifact:
Material output from a slice or task.

Event:
Something that happened.

Command:
Human or system request for action.

Notification:
Human-readable event delivery.

Blocker:
Event requiring attention before progress continues.

Surface:
Device/interface mode: desktop, XR, mobile, wearable, voice.

Bridge:
Adapter between OpenJane and another system.

Contract:
Shared schema/API agreement.

Policy:
Security, privacy, routing, or approval rule.
First Milestone

Build the smallest useful OpenJane loop.

The first milestone does not need live OpenClaw, SPINE, Meta glasses, or voice.

A good first milestone is:

OpenJane iOS app launches.
↓
Shows project identity and current status.
↓
Loads or defines a few local mock foundry events.
↓
Displays them as human-readable notifications/status cards.
↓
Allows the user to create a seed prompt locally.
↓
Stores the seed prompt as a structured local command/event.

This proves the interface shape before wiring external systems.

First Implementation Slice

Codex should begin with a small, safe slice:

Slice 1: Project Baseline and Status UI

Goals:

Confirm the Xcode project builds.
Add/verify Meta-provided plist configuration if available.
Add Associated Domains capability if not already present:
applinks:openjane.thetinkeringwizard.com
Create a simple SwiftUI app shell with:
app title
subtitle
current local project status
mock event list
seed prompt input field
“Create Seed Prompt” button
Keep all data local and mocked.
Add no external network calls yet.
Add no analytics.
Add no unnecessary dependencies.
Suggested Initial Swift Types

Start with simple local models.

enum OpenJaneEventSeverity: String, Codable, CaseIterable {
    case info
    case warning
    case critical
}

enum OpenJaneEventType: String, Codable, CaseIterable {
    case sliceCompleted = "slice.completed"
    case sliceBlocked = "slice.blocked"
    case agentQuestion = "agent.question"
    case buildFailed = "build.failed"
    case buildCompleted = "build.completed"
    case artifactReady = "artifact.ready"
    case reviewRequired = "review.required"
    case projectSeeded = "project.seeded"
}

struct OpenJaneEvent: Identifiable, Codable {
    var id: UUID
    var type: OpenJaneEventType
    var createdAt: Date
    var sourceSystem: String
    var sourceNode: String?
    var sourceAgent: String?
    var projectId: String
    var projectName: String
    var summary: String
    var severity: OpenJaneEventSeverity
    var requiresUser: Bool
}

struct OpenJaneCommand: Identifiable, Codable {
    var id: UUID
    var createdAt: Date
    var commandType: String
    var projectId: String
    var body: String
    var requiresApproval: Bool
}

Do not overbuild these yet.

The goal is a clean start, not a perfect event system.

Suggested UI Shape

Initial screen:

OpenJane
SPINE-aware companion endpoint

Status:
Local prototype mode

Events:
- Parser slice completed
- Unity build blocked
- Agent question waiting
- Artifact ready

Seed Prompt:
[ text field / editor ]

[ Create Seed Prompt ]

When the user creates a seed prompt, append a local event:

project.seeded

and store the command in memory for now.

Persistence can come later.

Do Not Do Yet

Do not do these in the first slice:

do not call OpenAI APIs
do not call Meta APIs unless required for build verification
do not wire live glasses yet
do not build a SPINE bridge yet
do not add package dependencies casually
do not add analytics
do not add login/auth
do not add cloud sync
do not add command execution
do not expose secrets
do not build a complex architecture before the UI loop exists
Desired First Commit Shape

A good first commit from Codex would be:

Add OpenJane prototype status UI and local event models

Expected changed files:

OpenJaneApp.swift
ContentView.swift
OpenJaneEvent.swift
OpenJaneCommand.swift
maybe Info.plist / entitlements if needed

Keep the commit small.

Longer-Term Roadmap

After Slice 1:

Slice 2: Local Persistence

Store mock events and seed prompts locally.

Possible options:

simple JSON file
SwiftData
UserDefaults for tiny temporary state

Prefer simple first.

Slice 3: Event Schema Alignment

Create JSON schema files under:

contracts/schemas/

For:

openjane.event.schema.json
openjane.command.schema.json
openjane.notification.schema.json
openjane.security.schema.json
Slice 4: Local Notification Prototype

Generate local iOS notifications for important mock events.

Example:

“Slice blocked: Unity build missing signing configuration.”
Slice 5: SPINE Bridge Stub

Create a local bridge abstraction, but do not wire live OpenClaw yet.

Example:

protocol OpenJaneEventSource {
    func loadEvents() async throws -> [OpenJaneEvent]
}
Slice 6: Meta Wearable Toolkit Integration

After baseline app stability, integrate the Meta wearable toolkit according to Meta’s official docs and generated configuration.

Do not hardcode secrets casually.

Slice 7: Voice / Wearable Surface

Explore voice-first input and wearable-safe summaries.

Public Positioning

The public story should stay low-key, serious, and useful:

OpenJane is an experiment in human-facing interfaces for agentic work.

It explores how a person can stay in the loop as AI systems move from prompt/response tools toward ongoing networks of agents, queues, models, workers, artifacts, and review loops.

Avoid hype.

Avoid overclaiming.

Show the build path.

Document decisions.

Build small useful loops.

Immediate Instruction for Codex

Read this file.

Then:

Inspect the repo structure.
Identify the Xcode project location.
Confirm the app target and bundle identifier.
Check whether the Meta plist block has already been inserted.
Check whether Associated Domains is configured.
Propose Slice 1 as a small implementation plan.
After approval, implement only Slice 1.

Do not make broad architecture changes without asking.

Do not add external dependencies without asking.

Do not add network calls yet.

Do not remove existing project configuration unless clearly broken.

Build the smallest useful OpenJane prototype loop first.