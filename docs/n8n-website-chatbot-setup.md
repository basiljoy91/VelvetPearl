# n8n Website Chatbot Setup

This project now supports a safe hybrid chatbot setup:

- The website chat UI stays inside the React app.
- Final enquiry submission still goes directly to the existing backend `POST /api/enquiries`.
- `n8n` is optional and is used for:
  - AI intent hints
  - FAQ phrasing improvements
  - chatbot analytics events

This keeps the current system stable and avoids disturbing other team workflows.

## What Was Added In Code

- Website chatbot UI and structured flows:
  - [src/components/chat/ChatWidget.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/chat/ChatWidget.jsx:1)
- Chatbot config, service flows, FAQ rules, handoff payload shaping:
  - [src/components/chat/chatbotConfig.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/chat/chatbotConfig.js:1)
- Optional `n8n` integration and analytics client:
  - [src/services/chatbotService.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/services/chatbotService.js:1)

## Environment Variables

Add these to your frontend environment:

```env
VITE_CHATBOT_USE_N8N=true
VITE_CHATBOT_AI_ENABLED=true
VITE_N8N_CHATBOT_WEBHOOK_URL=https://your-n8n-domain/webhook/velvet-pearl/chat-assistant
VITE_N8N_CHATBOT_EVENTS_WEBHOOK_URL=https://your-n8n-domain/webhook/velvet-pearl/chat-events
```

Recommended rollout:

- Start with:
  - `VITE_CHATBOT_USE_N8N=false`
  - `VITE_CHATBOT_AI_ENABLED=false`
- Turn them on only after the workflows are ready in `n8n`.

## Recommended Architecture

Use this connection pattern:

1. Website chatbot -> optional `n8n` assistant webhook
2. Website chatbot -> optional `n8n` events webhook
3. Website chatbot -> existing backend `/api/enquiries`
4. Existing backend -> existing admin WhatsApp notification path

That means:

- Your backend remains the source of truth.
- The current admin notification logic in [backend/services/whatsappService.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/backend/services/whatsappService.js:1) continues to work.
- `n8n` improves conversation quality and observability without taking over booking storage.

## n8n Dashboard Steps

Create a new folder in `n8n`:

- `Velvet Pearl / Website Chatbot`

Inside that folder, create these workflows.

### Workflow 1: Chat Assistant

Purpose:

- Return AI-assisted intent hints to the website chatbot
- Never submit bookings directly
- Never confirm pricing or availability

Suggested workflow name:

- `VP Website Chat Assistant`

Suggested nodes:

1. `Webhook`
2. `Set` or `Edit Fields`
3. `Code`
4. Optional `OpenAI Chat Model`
5. `Respond to Webhook`

Webhook settings:

- Method: `POST`
- Path: `velvet-pearl/chat-assistant`
- Response mode: `Using Respond to Webhook`

Incoming payload from website:

```json
{
  "mode": "assistant_hint",
  "source": "website",
  "session_id": "uuid",
  "current_page": "/cab-booking",
  "message": "Need airport pickup for 4 people from Chennai",
  "context": {
    "selected_service": null,
    "current_field_key": null,
    "handoff_reason": null,
    "collected_fields": {}
  }
}
```

Your workflow should return JSON in this shape:

```json
{
  "intent": "cab",
  "service_key": "cab",
  "faq_id": "airport_pickup",
  "handoff_reason": null,
  "should_handoff": false,
  "reply_text": "Yes, airport pickup and drop can be arranged based on route and availability.",
  "extracted_fields": {
    "trip_type": "airport_pickup",
    "passengers": "4",
    "pickup": "Chennai"
  }
}
```

Supported output fields:

- `intent`
- `service_key`
- `faq_id`
- `handoff_reason`
- `should_handoff`
- `reply_text`
- `extracted_fields`

Strict rules for this workflow:

- Never invent pricing
- Never confirm live availability
- Never promise booking confirmation
- If user asks exact quote, urgent help, or guaranteed availability:
  - return `should_handoff: true`
- If confidence is low:
  - return only `reply_text` or empty JSON

### Workflow 2: Chat Events

Purpose:

- Capture chatbot analytics
- Track drop-off
- Track FAQ usage
- Track handoff rate

Suggested workflow name:

- `VP Website Chat Events`

Suggested nodes:

1. `Webhook`
2. `Google Sheets`, `Airtable`, `Notion`, `Postgres`, or `n8n Data Store`
3. `Respond to Webhook`

Webhook settings:

- Method: `POST`
- Path: `velvet-pearl/chat-events`

Incoming event example:

```json
{
  "event_name": "field_completed",
  "source": "website",
  "occurred_at": "2026-06-03T12:00:00.000Z",
  "session_id": "uuid",
  "current_page": "/",
  "selected_service": "cab",
  "current_field_key": "pickup",
  "handoff_reason": null,
  "submitted_reference_id": null,
  "field_key": "pickup",
  "field_value_type": "text",
  "flow_type": "lead_capture",
  "service_key": "cab"
}
```

Recommended event names to store:

- `chat_opened`
- `service_selected`
- `faq_viewed`
- `field_started`
- `field_completed`
- `handoff_triggered`
- `enquiry_submitted`
- `chat_abandoned`

## Optional AI Node Prompt

If you add the `OpenAI Chat Model` node in `n8n`, use a strict system instruction like this:

```txt
You are a website travel assistant for Velvet Pearl.

You may help only with:
- intent detection
- FAQ phrasing
- field extraction
- handoff recommendation

You must never:
- invent final price
- confirm availability
- promise booking
- change business policy

Return JSON only with:
- intent
- service_key
- faq_id
- handoff_reason
- should_handoff
- reply_text
- extracted_fields
```

## What You Need To Do In The Current Backend

The current backend is already ready for submissions:

- Public submission route:
  - [backend/routes/enquiryRoutes.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/backend/routes/enquiryRoutes.js:1)
- Validation:
  - [backend/middleware/enquiryValidation.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/backend/middleware/enquiryValidation.js:1)
- Submission shaping:
  - [backend/controllers/bookingController.js](/Users/basiljoy/VS%20code/roughnote/cabwebsit/backend/controllers/bookingController.js:1)

You do not need a new backend endpoint for Phase 1 through Phase 4.

## What To Do First In n8n

1. Create the folder `Velvet Pearl / Website Chatbot`
2. Create `VP Website Chat Events`
3. Test the events webhook first
4. Create `VP Website Chat Assistant`
5. Start with rule-based `Code` node logic before adding AI
6. After that, optionally add the `OpenAI Chat Model` node
7. Turn on these frontend env vars only after both webhook URLs are live

## Safe Rollout Order

1. Deploy current code with `n8n` disabled
2. Build and test `chat-events` webhook
3. Turn on `VITE_N8N_CHATBOT_EVENTS_WEBHOOK_URL`
4. Build and test `chat-assistant` webhook
5. Turn on `VITE_CHATBOT_USE_N8N=true`
6. Turn on `VITE_CHATBOT_AI_ENABLED=true`
7. Watch event logs before widening AI behavior

## How This Connects To The Current System

The safe connection flow is:

- Customer talks to website chatbot
- Optional `n8n` assistant helps classify intent
- Website submits completed enquiry to current backend
- Current backend stores the enquiry
- Current backend sends admin WhatsApp notification if already configured

This avoids splitting business truth across multiple systems.
