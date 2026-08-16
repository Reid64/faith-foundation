# Phase 19 — Board Meeting Room: Video, AI Minutes, Digital Signatures

## Objective
A fully branded board meeting room built inside the FaithProof Command Center.
Board members join video meetings without leaving the app. AI transcribes and
drafts minutes automatically. Board approves and signs minutes digitally inside
FaithProof. Everything logged to the immutable audit trail.

## Design
The meeting room uses the FaithProof admin design system:
- Page bg: #e8e6e1
- Meeting room chrome: #013e37 deep green
- Video tile borders: rgba(255,239,179,0.3) butter
- Active speaker highlight: #ffefb3 butter border 2px
- Controls bar: #013e37 bg with butter icons
- Participant name labels: #ffefb3 on dark overlay
- FAITH FOUNDATION logo top-left of meeting room
- "FaithProof Board Meeting" header in butter text

## Video Technology
Use Jitsi Meet iFrame API (open source, free, self-hostable).
For initial build use Jitsi's public server (meet.jit.si) — no setup required.
Room naming: faithproof-board-[meeting-id] — unique per board meeting record.
Jitsi iFrame API script: https://meet.jit.si/external_api.js

The JitsiMeetExternalAPI constructor accepts:
- domain: 'meet.jit.si'
- roomName: string
- parentNode: DOM element
- configOverwrite: object (controls Jitsi internal settings)
- interfaceConfigOverwrite: object (controls Jitsi UI)

Use interfaceConfigOverwrite to hide Jitsi's own toolbar and branding:
  TOOLBAR_BUTTONS: [] (empty — we build our own controls)
  SHOW_JITSI_WATERMARK: false
  SHOW_WATERMARK_FOR_GUESTS: false
  SHOW_BRAND_WATERMARK: false
  DEFAULT_BACKGROUND: '#013e37'
  DISABLE_JOIN_LEAVE_NOTIFICATIONS: false

Use configOverwrite:
  startWithAudioMuted: false
  startWithVideoMuted: false
  enableWelcomePage: false
  prejoinPageEnabled: false (skip Jitsi's prejoin screen — we have our own)

## Custom Controls Bar
Build a custom controls bar below the video grid:
- Mute/Unmute microphone button (butter icon, toggles)
- Camera on/off button
- Screen share button
- End meeting button (red, admin only)
- Participant count badge
- Meeting duration timer (counts up from join time)
- "Start Recording" button (admin only) — calls Jitsi recording API
All controls call Jitsi iFrame API methods: api.executeCommand('toggleAudio') etc.

## Video Grid Layout
Custom CSS grid wrapping the Jitsi iFrame:
- 2 participants: side by side, equal width
- 3-4 participants: 2x2 grid
- 5-6 participants: 2x3 grid
Active speaker detection via Jitsi dominantSpeakerChanged event — highlight active tile with butter border
Each tile: participant name label bottom-left in butter text on dark overlay
iFrame itself fills the grid cell

## Pre-Join Screen
Before entering the meeting room, show a branded pre-join screen:
- "FAITH FOUNDATION Board Meeting" heading in #013e37
- Meeting name and scheduled date
- Camera preview (use browser getUserMedia)
- Name field (pre-filled from profile.full_name)
- Microphone and camera toggles
- "Join Meeting" button in #013e37 bg #ffefb3 text
- List of other participants already in the room (via Jitsi participantsInfoUpdated event)

## Database Changes
File: supabase/migrations/014_board_meeting_room.sql

ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS jitsi_room_name TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS ai_draft_minutes TEXT;
ALTER TABLE board_meetings ADD COLUMN IF NOT EXISTS minutes_status TEXT DEFAULT 'draft';
-- minutes_status: draft, under_review, approved, certified

CREATE TABLE meeting_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_data TEXT, -- base64 encoded drawn signature image
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(meeting_id, profile_id)
);

ALTER TABLE meeting_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board can manage approvals"
  ON meeting_approvals FOR ALL
  USING (current_user_role() IN ('admin', 'board'));

## Pages to Build

### /admin/board/meetings/[id]/room — Meeting Room
Client component (needs browser APIs).
Full-screen layout using entire viewport.
Three zones:
  LEFT: sidebar 240px #013e37 — participant list, meeting info, chat panel toggle
  CENTER: video grid area — Jitsi iFrame filling available space
  BOTTOM: custom controls bar 64px #013e37

On mount:
  1. Show pre-join screen
  2. On "Join Meeting" click: initialize JitsiMeetExternalAPI
  3. Set actual_start on board_meetings if first to join (via server action)
  4. Listen for participantJoined, participantLeft, dominantSpeakerChanged, recordingStatusChanged events

On "End Meeting" (admin only):
  1. Call api.executeCommand('hangup') for all participants
  2. Set actual_end on board_meetings
  3. Redirect all participants to /admin/board/meetings/[id]/minutes

### /admin/board/meetings/[id]/minutes — Post-Meeting Minutes
Server component with client islands for interactive parts.

Layout:
  Top: meeting summary card (date, duration, attendees)
  Section 1 — AI Draft Minutes (white card):
    Status badge: "AI Draft" / "Under Review" / "Approved" / "Certified"
    If ai_draft_minutes exists: show formatted minutes in a rich display
    If transcript_text exists but no ai_draft_minutes: "Generate AI Minutes" button
    If neither: "No recording available — enter minutes manually" with textarea
    "Edit Minutes" button — makes the minutes text editable inline (textarea)
    "Save Changes" server action

  Section 2 — Approval Panel (dark green panel):
    Heading: "Board Approval Required" in butter
    Subtext: "All board members must approve before minutes are certified"
    List of all board profiles with approval status:
      Approved: green checkmark + "Approved [date]" + signature thumbnail
      Pending: amber clock + "Awaiting approval"
    If current user has not approved:
      "Review and Approve" button → opens approval modal
    If all board members approved and current user is admin:
      "Certify Minutes" button (Juan Valdez as Secretary, or admin)
      → sets minutes_status=certified, generates PDF, saves to Proof Vault

  Section 3 — Signature Canvas (shown in approval modal):
    Modal overlay with:
      Display of current minutes text (read-only, scrollable)
      "I have read and approve these minutes as an accurate record of the [date] board meeting"
      Signature canvas: HTML5 canvas element, 400x150px, dark border
      Instructions: "Sign above using your mouse or finger"
      "Clear" button resets canvas
      "Approve Minutes" button:
        Captures canvas as base64 PNG
        Calls approveMinutes() server action
        Inserts meeting_approvals record with signature_data, ip_address, user_agent
        Logs to audit_log: action='minutes.approved', entity_type='board_meetings'
        Closes modal, refreshes approval panel

### /admin/board/meetings/new — Updated
Add fields: scheduled_start (datetime), scheduled_end (datetime)
On create: auto-generate jitsi_room_name = 'faithproof-board-' + meeting.id
Add "Join Meeting" button on meeting detail page — only active when scheduled_start within 30 minutes or past

### /admin/board/meetings/[id] — Updated
Add "Join Meeting" button (green, large) when meeting time is current
Add link to minutes when meeting is complete
Show minutes_status badge

## AI Minutes Generation

### API Route: POST /api/board/generate-minutes
Auth: session required, role must be admin or board
Body: { meeting_id: string }
Logic:
  1. Fetch board_meeting by id, verify transcript_text exists
  2. Fetch all board_votes for this meeting
  3. Call Anthropic API (claude-sonnet-4-6) with this system prompt:
    "You are a professional nonprofit board secretary. Generate formal board meeting minutes from the provided transcript. Format as follows:
    
    MINUTES OF THE [MEETING TYPE] MEETING
    FOUNDATION FOR AFFORDABLE INSTRUCTION AND TENANCY HOPE
    [DATE] at [TIME]
    
    ATTENDEES: [list]
    
    CALL TO ORDER: [from transcript]
    
    AGENDA ITEMS DISCUSSED:
    [numbered list of topics discussed with brief summary]
    
    MOTIONS AND VOTES:
    [list each motion, mover, seconder if mentioned, vote result]
    
    ACTION ITEMS:
    [list action items with responsible party]
    
    ADJOURNMENT: [time if mentioned]
    
    Keep language formal and professional. Use third person. Do not add information not present in the transcript."
  4. User message: "Transcript:\n\n[transcript_text]\n\nVotes recorded:\n[votes as JSON]"
  5. Save response to board_meetings.ai_draft_minutes
  6. Set minutes_status = 'under_review'
  7. Send email via sendEmail() to all board profiles: "AI draft minutes are ready for review at [link]"
  8. Log to audit_log
  9. Return { ok: true }

## PDF Generation for Certified Minutes

### Server Action: generateCertifiedMinutesPDF(meeting_id)
Uses @react-pdf/renderer
Document includes:
  - FAITH Foundation letterhead (logo, name, EIN 33-2640449, address)
  - Meeting type, date, duration
  - Attendees list
  - Full minutes text
  - Votes table
  - Approval section: each board member's name, approval date/time, signature image
  - Certification statement: "These minutes are hereby certified as an accurate record..."
  - Juan Valdez Secretary signature line
  - Audit trail reference: "Digital approval record ID: [meeting_id]"
Saves PDF to Supabase Storage: board-minutes/[meeting_id].pdf
Creates proof_documents record: type=board_minutes, is_public=false, verified=true
Logs to audit_log

## Recording + Transcription Note
Jitsi recording on meet.jit.si requires a paid Jitsi account (8x8.vc).
For the initial build: implement a manual transcript upload field on the minutes page.
Admin can paste a transcript or upload a .txt file.
Future: when self-hosted Jitsi is running on the spare laptop server, recording
is free and unlimited. Whisper transcription can also run locally on the same server.
Add a note in SECRETS_PENDING.md about this.

## Sidebar Updates
On /admin/board/meetings/[id]: show "Join Meeting" button prominently when meeting time is within 30 min.
On admin dashboard Command Center: add to "Requires Attention" panel — board meetings scheduled today with "Join" link.

## Environment Variables
No new env vars required for initial Jitsi build (uses public meet.jit.si server).
Future self-hosted: JITSI_SERVER_URL=https://[laptop-ip-or-domain]

## Security Note
Jitsi room names are not secret — anyone who knows the room name can join.
Mitigate by:
1. Using UUIDs as room names (already done — meeting.id is UUID)
2. Enabling Jitsi lobby mode via configOverwrite: { enableLobbyMode: true }
   Admin must admit each participant — prevents uninvited guests
3. Adding lobby to interfaceConfigOverwrite

## Build Sequence
1. Migration 014
2. Update board_meetings new/detail pages with scheduled times + Join button
3. Build /room page with Jitsi integration and custom UI
4. Build /minutes page with AI generation, approval panel, signature canvas
5. Add generateCertifiedMinutesPDF server action
6. Add /api/board/generate-minutes route
7. Update Command Center dashboard attention panel
8. Build, deploy, commit
