# OpenJane

OpenJane is a local-first personal operating layer for iPhone/iPad: chat, memory, documents, recordings, lists, calendar, trackers, plans, and goals in one app. The goal is not just another assistant UI, but a private workspace where Jane can understand the user’s current context, help organize life domains, and activate the right tools or views when needed.

A primary goal is also to simplify / consolidate a basic set of user tools for use on the fly, file managment, documents, images, videos, contacts and events all stored in correlation to one another and overseen by a friend that never truly sleeps.

The current iOS prototype includes an iMessage-style chat surface, tabbed app shell, audio/video recording , and 3d capture and scanning scaffolds, markdown texts, markdown lists, layered calendar direction, public/private/business file storage lanes, and a file manager for moving user files between visibility levels. Public files are designed to be available through iOS Files under OpenJane, while private/business files stay inside the app container.

OpenJane includes an openclaw channel plugin to communicate with your lobster and use it's tools.

OpenJane is structured and intended to become a **SPINE-aware endpoint** the Jetsen Software Foundry: a way for users to speak into the system, receive meaningful updates back from it, and stay aligned with distributed agents, build tools, models, queues, and project workflows.

Some surfaces are scaffolds rather than finished products, but the foundation is being shaped around a durable contract: user-owned data, local-first storage, clear visibility controls, and an assistant that can work across real life domains without flattening everything into one generic chat box.

The goal is a practical, inspectable interface between human intent and machine execution.

---

## Vision

OpenJane is built around a simple idea:

> A useful assistant should not only answer questions.  
> It should help you stay oriented while work is happening.

Modern AI systems are becoming less like single tools and more like networks of agents, queues, models, workers, artifacts, and review loops. That creates a new interface problem: humans need a clean way to understand what the system is doing, guide it, interrupt it, approve it, and learn from it.

OpenJane explores that interface.

The long-term goal is a companion that can:

- listen through voice or wearable devices
- receive slice completion updates from agent systems
- surface blockers before they disappear into logs
- accept seed prompts for project acceleration
- route user intent into the correct project, queue, node, or agent
- summarize what changed while the user was away
- support human approval checkpoints
- quietly provide context at the right moment

OpenJane should feel less like opening an app and more like having a trusted project companion at the edge of the workflow.

---

## Intended Role

OpenJane is the human input and notification endpoint for a software foundry.

It does not replace the orchestrator, agents, build tools, or worker nodes. Instead, it provides a clean interface to them.

-----

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


---

OpenJane should eventually support:

-  project seed prompts
-  blocker notifications
-  voice-first task creation
-  slice completion notifications
-  build/test status updates
-  agent-to-human questions
-  human approval moments
-  lightweight project summaries
-  wearable context delivery
-  local-first assistant workflows

---

## Relationship to SPINE

SPINE is the connective layer for the Jetsen Software Foundry.

It links projects, agents, queues, nodes, artifacts, events, and decision loops into an operational software-building/Project Completion fabric.

OpenJane is intended to become a SPINE-aware companion endpoint.

In practical terms, that means OpenJane should be able to understand and surface events such as:

- slice.completed
- slice.blocked
- agent.question
- build.failed
- build.completed
- artifact.ready
- review.required
- project.seeded
- queue.waiting
- node.available
- node.offline

OpenJane’s job is not to perform all of this work directly.

Its job is to keep the human in the loop without forcing the human to stare at dashboards all day.

Design Philosophy

OpenJane follows a “from dust” design approach.

That means:

- build the smallest useful loop first
- keep dependencies intentional
- avoid unnecessary wrappers
- prefer clear contracts over framework magic
- make system behavior inspectable
- keep local-first options available
- document the reasoning path, not just the final code
- treat latency as a product problem, not just a technical problem
- separate interface, orchestration, execution, and memory concerns

Earlier prototypes leaned too heavily on wrappers and suffered from latency, unclear boundaries, and dependency drag.

OpenJane is the consolidation pass.

Background

OpenJane grows out of three earlier experiments:

- X1 — early smart-glasses assistant exploration
- KillerView — alternate wearable interface experiment
- BlueT33th — Bluetooth / Custom Prosthetic exploration

Those prototypes were useful but incomplete, or waiting for their time.

They helped clarify what this project should become:

not a glasses demo,
not a chatbot skin,
not a pile of wrappers,
but a durable human interface for agentic work.

Foundry Context

OpenJane is being developed alongside the Jetsen Software Foundry, a local-first multi-node software creation environment.

The foundry direction includes:

- project planning loops
- agent-assisted implementation
- task slicing
- queue-based execution
- local and cloud model routing
- distributed worker nodes
- artifact logging
- build/test feedback
- human review checkpoints

OpenJane is intended to sit at the edge of that system as the human-facing companion interface.

For example:

A coding agent completes a slice.

↓

SPINE emits slice.completed.

↓

OpenJane receives the event.

↓

The user hears or sees:
“Parser slice completed. Tests passed. Next slice is ready for review.”

Or (hopefully):

A robot's power is low in the field and no powerbank is within range

↓

SPINE receives Emergency Communication - forwards to user through OpenJane

↓

OpenJane summarizes the failure.

↓

User is informed of the situation and allocates resources

↓

OpenJane communicates to the LabOverseer to create a tpm to monitor the robot retrieval by a fresh robot

↓

Overseer checks availability of another robot, dispatches it and informs OpenJane of success or Failure

↓

Another robot is dispatched to limp the first robot home

↓

User is informed through OpenJane when the process completes

---


OpenClaw

A local agent/runtime interface for coordinating model-backed work.

OpenJane can now receive status from OpenClaw and send commands or prompts into it  using an extensible api / chat app.

NEMOClaw

A related local-agent direction focused on NVIDIA/Nemotron-style model workflows and local inference experiments.

OpenJane should treat this as another capable endpoint in the foundry environment.

Incredibuild

A distributed build acceleration system that may provide useful build-node and compilation workflow signals.

OpenJane’s initial relationship to Incredibuild should be observational:

- build started
- build completed
- build failed
- duration changed
- warnings/errors surfaced
- artifact produced

Deeper integration can come later.

Wearable / Mobile Interfaces

OpenJane should remain compatible with voice-first and wearable-first interaction patterns, including smart glasses and mobile devices.  Meta smart glasses were integrated as a first class user input & notifier in 0.1 and compatibility will be maintained and extended where possible.

The wearable layer is not the whole project. 

It is one interface surface.

Architectural Principle

OpenJane is not the worker.

OpenJane should not own compilation, model execution, queue management, or artifact generation directly.

Those responsibilities belong to the foundry systems underneath it.

OpenJane is responsible for:

- intent capture
- notification delivery
- context summarization
- human approval moments
- conversation continuity
- command routing
- project awareness
- interface presence

Execution belongs elsewhere.

This keeps the system modular, testable, and replaceable.

Initial Milestone

The first milestone is a minimal working loop:

User speaks or types a seed prompt.

↓

OpenJane records the intent.

↓

OpenJane creates or forwards a structured event.

↓

A foundry/agent system receives it.

↓

A completion, blocker, or question comes back.

↓

OpenJane notifies the user clearly.

A successful early version does not need to be magical.

It needs to be reliable.

Example Use Cases
Slice Completion

“The README architecture slice is complete. The agent produced one document update and one decision note.”

Blocker Notification

“The build failed because the mobile target is missing a signing configuration. Do you want to defer signing or configure it now?”

Project Acceleration

“Seed a planning pass for OpenJane’s event model. Keep it minimal, local-first, and compatible with SPINE events.”

Review Prompt

“The agent has proposed three interface contracts. Review now, summarize, or continue to implementation?”

Wearable Context

“You are about to discuss OpenJane. Current project status: event model pending, README drafted, first milestone not implemented.”


---


Why This Exists

AI work is moving from prompt-response interaction toward ongoing systems of delegated work.

That shift creates a human-interface gap.

A person should not need to manually poll logs, dashboards, terminals, build tools, agent windows, and chat threads just to understand what happened.

OpenJane is an experiment in closing that gap.

It asks:

- What should a human-facing interface for agentic work feel like?
- How should agents ask humans for help?
- How should blockers surface?
- How should context follow the user across devices?
- How can local-first systems remain understandable?
- How do we make persistent assistance useful without making it intrusive?

Jane Agent Summary

Jane is the agent inside OpenJane: a memory-aware assistant meant to shift fluidly between roles like tutor, planner, budget helper, document finder, health/logging companion, family organizer, and business support agent. Jane is not meant to be one static persona. She is designed as a flexible agent that can change mode depending on context while keeping continuity across the user’s life.

The core idea is actionable memory. Jane should not merely retrieve notes; she should activate relevant clusters of memory, tools, templates, risks, obligations, and current theories. A question like “Can we afford this trip?” should bring forward budget state, calendar timing, household goals, recent spending, trip plans, risk paths, and the right interface. A question like “Find that form again” should use the user’s document memory instead of re-searching the web.

Jane’s memory model is built around graph concepts: sources, nodes, edges, clusters, blueprints, action maps, and active inquiries. Blueprints represent durable mental or world models. ActionMaps represent repeatable workflows and procedural patterns. Active inquiries preserve uncertainty through a BestWorkingTheory and BestCompetingTheory so Jane can reason without pretending unresolved things are settled.

Jane’s intended contract is privacy-first and local-first. Sensitive areas like health, money, children/school records, secrets, contracts, and relationships require explicit policy checks before writes or cloud sharing. The long-term vision is an assistant that can grow with the user from daily notes and trackers into serious life infrastructure while keeping ownership and visibility in the user’s hands.

Status

OpenJane’s iOS app now has a much more capable local-first workspace surface:

The current iOS prototype includes an iMessage-style chat surface, tabbed app shell, 3d capture & storage, image capture & storage, audio/video recording scaffolds, markdown texts, markdown lists, layered calendar direction, public/private/business file storage lanes, and a file manager for moving user files between visibility levels. Public files are designed to be available through iOS Files under OpenJane, while private/business files stay inside the app container.

- **File visibility lanes** remain `Private`, `Business`, and internal `public`, but the user-facing label for `public` is now **FileDrop** (Files-visible) to reduce “public == world” confusion.
- The **Files** tab now supports preview/open for common formats: `md/txt/pdf`, `m4a/mp3/m4b/wav`, `mov/mp4`, and images (`jpg/png/heic`). Basic `md <-> txt` conversion is implemented; other conversions are stubbed behind menus.
- **Audio/Video/Images** recording flows save into lane-aware folders with a consistent filename prompt and visibility picker. Saved recordings/captures can be moved between lanes.
- The **3D** tab is now functional and split into practical surfaces:
  - **Captures**: session-based multi-photo collections saved into `3D/Captures/<session>/images/` with `manifest.json`. Includes a **Capture Wizard** (Object + Turntable modes) with a checklist and completion gating, plus a **Stage Build-Ready** action for users without an immediate reconstruction pipeline.
  - **Scans**: LiDAR shot capture (when available) that saves `color.jpg`, `depth_f32.bin`, `depth_meta.json`, and `intrinsics.json` per shot into `3D/Scans/<scan>/SHOT_00001/…`.
  - **Sites**: ARKit world-space scanning with a bounded capture box (size, anchor corner, yaw, height offset). Exports `site.json` and (when mesh is supported) a clipped `mesh.obj` into `3D/Sites/<site>/…`.
  - **Room wizard**: a guided room flow that reuses the Sites scanner and records `includeDoors` in `site.json`.
- **Capture Appearance Frames** is now supported during Sites/Room scanning: each tap saves a registered camera frame as `FRAME_00001.jpg` plus a sidecar JSON containing camera pose and intrinsics. These are exported into `appearance_frames/` alongside the site export to support later texture baking / appearance reconstruction.

All of this is built as a **single universal iPhone/iPad app**, with features gated at runtime based on device capability (e.g., LiDAR mesh support).

OpenJane includes an openclaw channel plugin to communicate with your lobster and use it's tools.

Near-term work:
metal integration to power/lora Jane locally
trillian like comms (could have... lobster kinda makes it trivial)
Robust calendar data model, persistence, filtering UI, and Jane access.
Full trackers/plans/goals/documents products.
Real Notion-like markdown editor polish.
Implement planned knowledge trees and graph visualization.
Production RAG/vector store.
Jane policy layer for sensitive writes/export.
App state scraping/indexing pass so Jane can notice recent files/events/lists/friends/etc.

Copyright TheTinkeringWizard 2026 
---

License

TBD.
