# Admin Mobile Dashboard: Phase-by-Phase LLM Build Plan

This document is the **implementation blueprint** to hand to another LLM so it can code the mobile admin dashboard redesign with minimal ambiguity.

Use this file together with:

- [admin-mobile-dashboard-codex-directive.md](/Users/basiljoy/VS%20code/roughnote/cabwebsit/docs/admin-mobile-dashboard-codex-directive.md)

This file focuses on:

- exact coding phases
- file creation/edit plan
- what each phase must output
- how data and UI state should be wired
- what to verify before moving to the next phase

## Copy-Paste Instruction Header for the Next LLM

Use the following as the opening instruction for the next coding run:

> Implement the admin mobile dashboard redesign in phased order. Keep desktop behavior intact. Build a separate mobile presentation layer using the existing admin data/actions from `src/pages/AdminDashboard.jsx`. Do not change backend contracts or business logic. Reuse existing loading/accessibility patterns. Complete each phase fully, verify with `npm run build` and `npm run lint` when appropriate, and do not stop at partial layout cleanup.

---

# 1. Global Build Rules

These rules apply to every phase.

## 1.1 Do not break existing behavior

- Desktop admin must continue to function.
- Existing admin data actions must still work:
  - enquiry load
  - enquiry detail load
  - status update
  - notes save
  - quote save
  - assignment save
  - archive
  - add enquiry
  - add driver
  - add fleet
  - password change
  - setup key generation

## 1.2 Parent state stays centralized

The parent [src/pages/AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx) remains the source of truth for:

- all loaded admin data
- filters
- selected enquiry
- draft state
- loading states
- saving states
- entry flow state
- settings state

Child mobile components are presentational plus event-emitting. They should not independently own API logic if the parent already does.

## 1.3 No heavy dependencies

Do not install modal, drawer, or animation libraries unless absolutely required. Prefer:

- React state
- Tailwind classes
- existing CSS
- lightweight internal helpers

## 1.4 Reuse existing helpers

Do not rewrite these unless necessary:

- `getCustomerName`
- `getPhoneNumber`
- `getWhatsAppNumber`
- `getServiceLabel`
- `summarizeEnquiry`
- `getAssignedResourceSummary`
- `getServiceDetailEntries`
- `buildCustomerReplyHref`
- `buildEnquiryDraft`

## 1.5 Preserve the current loading/accessibility improvements

Continue using:

- `LoadingButton`
- `SectionLoader`
- `LoadingOverlay`
- `SkeletonBlock`
- `aria-busy`
- `aria-live`
- `role="alert"`
- `role="status"`

## 1.6 Use apply_patch for edits

Follow repository editing rules:

- use `apply_patch` for manual file edits
- do not use destructive git commands
- do not revert unrelated user changes

---

# 2. Target File Structure

Create the mobile admin component suite under:

- `/Users/basiljoy/VS code/roughnote/cabwebsit/src/components/admin/mobile/`

Required components:

- `MobileAdminDashboard.jsx`
- `MobileAdminTopBar.jsx`
- `MobileAdminBottomNav.jsx`
- `MobileAdminFab.jsx`
- `MobileAdminSectionHeader.jsx`
- `MobileOverview.jsx`
- `MobileMetricCard.jsx`
- `MobileRecentActivityList.jsx`
- `MobileEnquiries.jsx`
- `MobileEnquiryCard.jsx`
- `MobileStatusPill.jsx`
- `MobileQuickActions.jsx`
- `MobileSearchBar.jsx`
- `MobileFilterSheet.jsx`
- `MobileActiveFilterChips.jsx`
- `MobileEnquiryDetail.jsx`
- `MobileDetailAccordion.jsx`
- `MobileBottomActionBar.jsx`
- `MobileNewEntrySheet.jsx`
- `MobileAddEnquiryForm.jsx`
- `MobileAddDriverForm.jsx`
- `MobileAddFleetForm.jsx`
- `MobileDrivers.jsx`
- `MobileDriverRow.jsx`
- `MobileDriverDetail.jsx`
- `MobileFleet.jsx`
- `MobileFleetRow.jsx`
- `MobileFleetDetail.jsx`
- `MobileEmptyState.jsx`

Optional helper components:

- `src/components/ui/BottomSheet.jsx`
- `src/components/ui/StickyActionBar.jsx`
- `src/components/ui/FilterChip.jsx`

Files likely to edit:

- [src/pages/AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx)
- [src/components/admin/AdminForms.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/admin/AdminForms.jsx)
- [src/components/ui/LoadingState.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/ui/LoadingState.jsx) if minor shared helpers are needed
- [src/index.css](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/index.css) for safe-area or mobile utility classes

---

# 3. Shared State Plan

Before building the mobile UI, the next LLM should formalize the state model in the parent dashboard.

## 3.1 Existing parent state to preserve

Already in [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx):

- `activeTab`
- `searchQuery`
- `isEntryModalOpen`
- `oldPassword`
- `newPassword`
- `confirmPassword`
- `pwdError`
- `pwdMessage`
- `isPwdLoading`
- `enquiries`
- `fleet`
- `drivers`
- `adminProfile`
- `dashboardError`
- `isLoading`
- `setupKeyData`
- `isSetupKeyLoading`
- `selectedEnquiry`
- `detailDraft`
- `isDetailLoading`
- `savingAction`
- `enquiryFilters`

## 3.2 Additional mobile parent state to add

Add new parent state in [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx):

- `isMobileFilterSheetOpen`
- `isMobileEnquiryDetailOpen`
- `mobileDetailSection` if needed for focus management
- `isMobileNewEntrySheetOpen`
- `mobileEntryType` with values:
  - `''`
  - `'bookings'`
  - `'drivers'`
  - `'fleet'`
- `isMobileDriverDetailOpen`
- `selectedDriver`
- `isMobileFleetDetailOpen`
- `selectedFleet`

Only add state that is actually used.

## 3.3 Derived mobile-only data to compute in parent

Add parent-level derived values:

- `mobileEnquiryStatusChips`
- `attentionNowCounts`
- `todayCounts` if feasible
- `mobileRecentActivity`

If `todayCounts` cannot be computed honestly from the current data, do not fake them. Use only what is truly derivable.

---

# 4. Phase 0: Pre-Refactor Preparation

## Goal

Prepare the parent dashboard so mobile extraction is clean and controlled.

## Tasks

1. Read and understand the current [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx) structure.
2. Identify which JSX belongs to:
   - desktop sidebar/shell
   - desktop overview
   - desktop enquiry table/list
   - desktop drivers
   - desktop fleet
   - settings
   - detail modal
3. Extract reusable render helpers if needed before adding the mobile branch.

## Code outputs

- No visual redesign yet.
- Only light internal cleanup if needed to make extraction safer.

## Done criteria

- `AdminDashboard` is easier to split into desktop and mobile render branches.
- Existing desktop build still passes.

---

# 5. Phase 1: Split Desktop and Mobile Render Paths

## Goal

Introduce a separate mobile rendering layer without changing data flow.

## Tasks

1. In [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx), split UI rendering into:
   - `DesktopAdminDashboard`
   - `MobileAdminDashboard`
2. Keep parent state/data/actions in `AdminDashboard`.
3. Pass only the required props into the desktop and mobile layers.

## Create

- `src/components/admin/mobile/MobileAdminDashboard.jsx`

## Suggested prop contract

`MobileAdminDashboard` should receive:

- `activeTab`
- `setActiveTab`
- `enquiries`
- `drivers`
- `fleet`
- `overviewCounts`
- `categoryCounts`
- `recentEnquiries`
- `filteredEnquiries`
- `filteredDrivers`
- `filteredFleet`
- `searchQuery`
- `setSearchQuery`
- `enquiryFilters`
- `setEnquiryFilters`
- `dashboardError`
- `isLoading`
- `selectedEnquiry`
- `detailDraft`
- `isDetailLoading`
- `savingAction`
- all required open/close callbacks
- all required save/action callbacks

## Important

Do not yet change how the mobile UI looks in detail. Just establish the split.

## Done criteria

- desktop still renders as before
- mobile render path exists and is isolated
- `npm run build` passes

---

# 6. Phase 2: Build the Mobile Shell

## Goal

Replace the mobile desktop-like shell with an app-like shell.

## Create

- `MobileAdminTopBar.jsx`
- `MobileAdminBottomNav.jsx`
- `MobileAdminFab.jsx`
- `MobileAdminSectionHeader.jsx`

## Tasks

1. Remove the current horizontal mobile tab strip from the mobile render path.
2. Build a sticky compact top bar for mobile.
3. Build a fixed bottom navigation for:
   - Overview
   - Enquiries
   - Drivers
   - Fleet
   - Settings
4. Build a floating `+ New` action button above the bottom nav.
5. Make sure safe-area spacing is correct.

## Visual behavior

Top bar:

- compact
- sticky
- title changes by tab
- light border or shadow on scroll

Bottom nav:

- fixed
- active item highlighted
- does not overlap content

FAB:

- visible on mobile
- opens new entry flow
- positioned above bottom nav

## CSS tasks

If needed, add mobile safe-area utilities to [src/index.css](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/index.css), for example:

- bottom safe-area padding
- sticky offset helper
- sheet bottom padding

## Done criteria

- mobile no longer depends on the desktop sidebar or horizontal top nav chips
- first mobile screen has much less header clutter
- navigation is app-like

---

# 7. Phase 3: Rebuild the Mobile Enquiries Inbox

## Goal

Make the enquiries screen the central mobile workflow.

## Create

- `MobileEnquiries.jsx`
- `MobileEnquiryCard.jsx`
- `MobileStatusPill.jsx`
- `MobileQuickActions.jsx`
- `MobileEmptyState.jsx`

## Tasks

1. Replace the current heavy mobile enquiry cards with compact inbox cards.
2. Keep default visible fields limited to:
   - reference ID
   - status
   - customer name
   - enquiry type
   - travel date
   - submitted date/time
   - quick actions
3. Keep hidden-by-default:
   - phone/WhatsApp blocks
   - long summaries
   - assignment details
   - notes
   - audit info
4. Add quick actions:
   - WhatsApp
   - View
   - Mark Contacted when applicable

## Data rules

Reuse existing helpers:

- `getCustomerName`
- `getServiceLabel`
- `getTravelDateLabel`
- `formatDate`
- `formatDateTime`
- `buildCustomerReplyHref`

## Layout target

At least 3 compact enquiry cards should be visible or nearly visible on a normal phone screen.

## Done criteria

- enquiry list feels like an inbox
- much less vertical density per card
- actions are visible without expanding the card

---

# 8. Phase 4: Build Mobile Search, Filters, and Active Chips

## Goal

Move filters out of the main screen flow.

## Create

- `MobileSearchBar.jsx`
- `MobileFilterSheet.jsx`
- `MobileActiveFilterChips.jsx`
- optional `src/components/ui/BottomSheet.jsx`

## Tasks

1. Add compact search at the top of the Enquiries screen.
2. Add a `Filter` button that opens a bottom sheet.
3. Put all filters into the sheet:
   - type
   - status
   - travel date
   - submitted from
   - submitted to
   - search term if needed
4. Add:
   - `Apply Filters`
   - `Reset Filters`
5. Show active filters as small chips above the list.
6. Allow individual chip removal.

## Important

Do not keep the current large filter card above the list on mobile.

## Done criteria

- filters no longer dominate the viewport
- search/filter actions feel light and quick
- enquiry list remains visible immediately

---

# 9. Phase 5: Build the Mobile Enquiry Detail Workspace

## Goal

Make enquiry review and editing usable on phone.

## Create

- `MobileEnquiryDetail.jsx`
- `MobileDetailAccordion.jsx`
- `MobileBottomActionBar.jsx`
- optional `StickyActionBar.jsx`

## Pattern

Do not reuse the desktop detail modal layout directly.

Use a mobile full-screen sheet/workspace with:

- sticky top bar
- scrollable content
- sticky bottom action bar

## Required sections

- Customer Details
- Requirement
- Travel Details
- Status and Assignment
- Quote
- Notes
- Activity Log / Audit Trail

## Required actions

Bottom sticky actions:

- WhatsApp
- Save Changes

Secondary actions:

- Mark Contacted
- Archive
- maybe status shortcut if clean

## Data handling

Keep the parent as the owner of:

- `selectedEnquiry`
- `detailDraft`
- `savingAction`

Pass all update handlers down from the parent.

## Save strategy

Preferred:

- one consolidated save path where practical

Acceptable:

- grouped section saves if needed

Avoid:

- many scattered desktop-style save buttons on mobile

## Loading rules

- use `SectionLoader` / `LoadingOverlay` / skeleton sections for detail loading
- keep layout stable

## Done criteria

- opening an enquiry feels like entering a workspace
- editing is easier than current stacked card/modal behavior
- actions remain thumb-reachable

---

# 10. Phase 6: Build Mobile Overview

## Goal

Turn overview into a command center instead of a stack of large metric cards.

## Create

- `MobileOverview.jsx`
- `MobileMetricCard.jsx`
- `MobileRecentActivityList.jsx`

## Required overview sections

1. `Attention Now`
2. `Today`
3. `Quick Actions`
4. `Recent Activity`

## Attention Now

Include at least:

- New Enquiries
- Awaiting Customer
- Pending Assignment
- Follow-ups Due

Each card should be tappable and switch to the Enquiries tab with filters applied.

## Today

If real “today” metrics can be derived safely, show:

- Contacted Today
- Assigned Today
- Completed Today
- Quoted Today

If not, simplify this section instead of inventing fake counts.

## Quick Actions

Add shortcuts like:

- New Enquiry
- View New Enquiries
- View Pending Assignment
- Open Drivers

## Recent Activity

Show only 3 to 5 compact recent items.

## Done criteria

- the overview answers “what needs attention now?” within one screen
- the most important stats are actionable

---

# 11. Phase 7: Build Mobile New Entry Flow

## Goal

Replace the current generic mobile modal behavior with a real phone-first creation flow.

## Create

- `MobileNewEntrySheet.jsx`
- `MobileAddEnquiryForm.jsx`
- `MobileAddDriverForm.jsx`
- `MobileAddFleetForm.jsx`

## Flow

1. Tap `+ New`
2. Open action sheet:
   - Add Enquiry
   - Add Driver
   - Add Fleet Vehicle
   - Cancel
3. Open selected form in a full-screen mobile sheet

## Rules

- full-width inputs
- grouped sections
- sticky bottom submit
- visible close/back at all times
- use `LoadingButton` for submit
- reuse current `handleAddEntry` and `AdminForms` data contracts rather than rewriting backend payload logic

## Important

Do not keep a cramped desktop modal on mobile if it hurts UX.

## Done criteria

- adding records feels intentional on phone
- no trapped small modal experience

---

# 12. Phase 8: Build Mobile Drivers View

## Goal

Make drivers scan-friendly on mobile.

## Create

- `MobileDrivers.jsx`
- `MobileDriverRow.jsx`
- `MobileDriverDetail.jsx`

## Default row/card fields

- name
- status
- phone
- assigned vehicle

## Filters

Add compact filters:

- All
- Active
- Unavailable
- Assigned

## Detail view

On tap, show:

- phone
- assigned vehicle
- availability
- notes
- related context if available

## Done criteria

- more drivers visible per screen
- availability is obvious

---

# 13. Phase 9: Build Mobile Fleet View

## Goal

Make fleet usable for quick operational scanning.

## Create

- `MobileFleet.jsx`
- `MobileFleetRow.jsx`
- `MobileFleetDetail.jsx`

## Default row/card fields

- vehicle ID or plate
- type/model
- status
- assigned driver
- insurance expiry / warning

## Filters

Implement only if supported cleanly:

- All
- Available
- Assigned
- Maintenance
- Expired Documents

## Done criteria

- available vehicles are quickly recognizable
- document/expiry attention items are visible

---

# 14. Phase 10: Mobile Settings Cleanup

## Goal

Ensure settings still work well on mobile after the shell redesign.

## Tasks

1. Keep password change accessible and mobile-friendly.
2. Keep setup key generation visible for main admin only.
3. Convert the current settings area into compact stacked sections for mobile.

## Reuse

- existing password state
- existing setup key state
- existing loading/error/success rules

## Done criteria

- settings remains usable on phone
- no desktop spacing overload

---

# 15. Phase 11: Visual Density and Polish

## Goal

Reduce the heaviness shown in the screenshots.

## Tasks

1. Reduce nested bordered boxes.
2. Reduce large internal padding.
3. Replace repeated big metadata blocks with compact rows where appropriate.
4. Keep only critical actions visually loud.
5. Reduce excessive uppercase where readability suffers.

## Styling targets

- padding around `14px` to `16px`
- radius around `18px` to `22px`
- compact gaps
- fewer internal section boxes

## Done criteria

- the mobile UI feels lighter and easier to scan
- less “box inside box inside box”

---

# 16. Phase 12: Motion, Safe Area, and Interaction Polish

## Goal

Make the mobile admin feel like a real app, not a shrunk webpage.

## Tasks

1. Add sticky top-bar shadow on scroll.
2. Ensure bottom nav is safe-area aware.
3. Ensure sticky action bars do not overlap bottom nav.
4. Make sheets slide from bottom smoothly.
5. Add subtle accordion/collapse transitions.
6. Make search keyboard-friendly.
7. Ensure no important button is hidden behind browser UI or safe-area padding.

## CSS targets

If needed in [src/index.css](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/index.css):

- `.pb-safe`
- `.bottom-safe`
- `.mobile-sticky-action-offset`
- `.mobile-sheet-safe`

## Done criteria

- motion supports clarity
- bottom UI never blocks action buttons
- safe-area issues are solved

---

# 17. Phase 13: Regression QA and Verification

## Goal

Verify the redesign is complete and stable.

## Manual test matrix

Test on:

- 360px
- 390px
- 412px

## Core flows

- open dashboard on mobile
- switch tabs through bottom nav
- open overview shortcuts
- search enquiries
- open filter sheet
- apply filters
- clear filters
- open enquiry detail
- WhatsApp from enquiry
- mark contacted
- save notes
- save status
- save quote
- save assignment
- archive enquiry
- add enquiry
- add driver
- add fleet
- drivers search/filter
- fleet search/filter
- settings password change
- generate setup key

## Loading/error verification

- skeletons appear for loading sections
- no blank pop-in states
- buttons show correct loading labels
- errors return from loading into visible alerts
- success/loading states use accessible live regions

## Build verification

Required before completion:

- `npm run build`
- `npm run lint`

---

# 18. What the Next LLM Should Not Do

Do not:

- redesign the desktop dashboard in the same pass
- rewrite backend logic
- introduce route complexity unless explicitly needed
- install a UI framework for sheets/drawers without necessity
- replace all admin logic with a new state system
- stop after only making cards smaller

This is a full mobile workflow redesign, not a spacing-only patch.

---

# 19. Final Completion Standard

The work is complete only when:

- mobile admin has its own shell
- bottom nav replaces horizontal top mobile tabs
- enquiry list behaves like an inbox
- filters move into a sheet
- enquiry detail becomes a real mobile workspace
- new entry becomes a proper mobile flow
- drivers and fleet are compact and readable
- settings still work on mobile
- loading/accessibility rules remain correct
- desktop is preserved
- build and lint pass

---

# 20. Short Version Prompt for the Next LLM

If needed, use this shorter prompt:

> Implement the mobile admin dashboard redesign in phased order using the existing parent data/actions in `src/pages/AdminDashboard.jsx`. Keep desktop intact. Build separate mobile components under `src/components/admin/mobile/`. Replace the current mobile desktop-like UI with a compact sticky top bar, bottom nav, floating new-entry action, inbox-style enquiry cards, bottom-sheet filters, a full-screen mobile enquiry detail workspace, and compact drivers/fleet views. Reuse the existing loading/accessibility system and current action handlers. Complete the redesign through overview, enquiries, filters, detail, new entry, drivers, fleet, settings, polish, and QA. Verify with `npm run build` and `npm run lint`.

