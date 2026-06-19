# Admin Mobile Dashboard Redesign: Codex Implementation Directive

This document is the exact implementation direction for rebuilding the **admin dashboard mobile experience**. It is written to be handed directly to Codex so the work can be executed with minimal ambiguity.

The goal is not to “make the desktop dashboard responsive.” The goal is to build a **mobile-first operations interface** for admins while preserving the existing desktop dashboard behavior.

## 1. Objective

Rebuild the **mobile view** of the admin dashboard so it behaves like a **manual operations app** rather than a compressed desktop table.

The admin should be able to do these things quickly on a phone:

- understand what needs attention right now
- scan multiple enquiries without long vertical cards
- search and filter without losing screen space
- open an enquiry and take action in a focused workspace
- message the customer on WhatsApp quickly
- update status, notes, quote, and assignments without fighting the layout
- add new enquiry/driver/fleet records in a full-screen mobile flow

## 2. Non-Negotiable Rules

These rules must be followed during implementation.

- Keep the **desktop admin dashboard** working as it does today.
- Build a **separate mobile presentation layer** instead of continuing to patch the current shared layout.
- Reuse the **existing data fetching and action handlers** from [src/pages/AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx) wherever possible.
- Do **not** change backend contracts, API shapes, database schema, authentication logic, or enquiry business rules in this redesign pass.
- Do **not** add heavy UI dependencies just for drawers, sheets, or animations.
- Do **not** create fake loading states for direct WhatsApp links or instant actions.
- Keep all recent accessibility/loading improvements intact:
  - `aria-busy`
  - `aria-live`
  - `LoadingButton`
  - `SectionLoader`
  - `LoadingOverlay`
  - skeleton states
- Preserve current route protection and admin access through `/admin` and `/admin/dashboard`.

## 3. Scope

### In scope

- Mobile-only redesign of the admin dashboard UI
- Mobile-only layout, navigation, filtering, list views, detail views, and entry flows
- Mobile interaction patterns: sticky top bar, bottom nav, bottom sheet/full-screen sheet behavior
- Mobile-safe loading, error, success, and empty states
- Mobile-safe new entry creation flow

### Out of scope

- Desktop dashboard redesign
- Backend/API changes
- New database fields
- Major auth redesign
- WhatsApp service/backend changes
- Rebuilding the enquiry model again
- Changing public website pages outside admin

## 4. Current Codebase Reality

The current admin dashboard is centered in:

- [src/pages/AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx)

Related existing components already in use:

- [src/components/admin/AdminForms.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/admin/AdminForms.jsx)
- [src/components/ui/LoadingState.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/components/ui/LoadingState.jsx)

Existing data/services already wired in [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx):

- `getEnquiries`
- `getEnquiryById`
- `getDrivers`
- `getFleet`
- `updateEnquiryStatus`
- `updateEnquiryNotes`
- `updateEnquiryQuote`
- `assignDriverToEnquiry`
- `assignVehicleToEnquiry`
- `assignRoomToEnquiry`
- `assignPackageToEnquiry`
- `archiveEnquiryRecord`
- `addBooking`
- `addDriver`
- `addFleet`
- `changePassword`
- `generateAdminSetupKey`
- `getAdminProfile`
- `logoutAdmin`

Existing useful logic in [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx) that should be **reused, not rewritten**:

- `syncOperationalData`
- `openEnquiryDetail`
- `refreshSelectedEnquiry`
- `runEnquiryAction`
- `markEnquiryContacted`
- `filteredEnquiries`
- `filteredDrivers`
- `filteredFleet`
- `overviewCounts`
- `categoryCounts`
- `recentEnquiries`
- helper functions like:
  - `getCustomerName`
  - `getPhoneNumber`
  - `getWhatsAppNumber`
  - `getServiceLabel`
  - `getAssignedResourceSummary`
  - `summarizeEnquiry`
  - `getServiceDetailEntries`
  - `buildCustomerReplyHref`
  - `buildEnquiryDraft`

## 5. Architecture Decision

### Required approach

Split the dashboard into **desktop** and **mobile** render paths while keeping one shared data/state owner.

Recommended pattern inside [src/pages/AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx):

- `AdminDashboard` remains the parent container and owns:
  - data fetching
  - filters
  - selected enquiry
  - detail draft
  - saving actions
  - modal/sheet open state
  - create-entry state
- render:
  - `DesktopAdminDashboard` for `md` and up
  - `MobileAdminDashboard` below `md`

### Important

Do not create separate duplicated business logic for mobile and desktop. The **data and handlers stay in the parent**. The **layout and presentation split**.

## 6. File and Component Plan

Create a dedicated mobile admin component set under:

- `/Users/basiljoy/VS code/roughnote/cabwebsit/src/components/admin/mobile/`

Create these components:

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

Optional shared UI helpers if needed:

- `src/components/ui/BottomSheet.jsx`
- `src/components/ui/StickyActionBar.jsx`
- `src/components/ui/FilterChip.jsx`

If safe-area utility classes are needed, update:

- [src/index.css](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/index.css)

## 7. Routing Decision

### For Phase 1 implementation

Do **not** add new admin routes yet.

Use **in-dashboard mobile full-screen sheets/overlays** for:

- enquiry detail
- new entry chooser
- add enquiry form
- add driver form
- add fleet form
- optional driver detail
- optional fleet detail

Why:

- preserves existing auth/protected route behavior
- avoids routing complexity during redesign
- keeps parent state available without duplication
- faster to ship and easier to QA

If route-based mobile detail pages are desired later, they can be a follow-up phase.

## 8. Breakpoint Strategy

Use the existing Tailwind breakpoint behavior already present in the project.

Mobile behavior should apply below `md`.

Use:

- desktop: `hidden md:block`
- mobile: `block md:hidden`

Do not introduce a custom JS media hook unless truly necessary.

## 9. Mobile UX Model

The mobile dashboard should behave like an **operations inbox**.

The admin should be able to answer these questions immediately:

- what is new?
- what is waiting?
- what needs follow-up?
- who can I contact right now?
- what needs assignment?

### Prioritization

Default mobile emphasis:

1. New enquiries
2. Awaiting Customer
3. Follow-up due
4. Pending assignment
5. Quick WhatsApp reply and view actions

## 10. Mobile Shell Specification

### Top bar

Replace the current large header stack on mobile with a compact sticky top bar.

Required mobile top bar behavior:

- sticky
- compact height
- safe-area aware
- light shadow/border when scrolling
- title based on active tab

Recommended contents by tab:

- `Overview`
  - title
  - optional mini summary like `12 total • 7 new`
- `Enquiries`
  - title
  - search button or inline search
  - filter button
- `Drivers`
  - title
  - search button/input
- `Fleet`
  - title
  - search button/input
- `Settings`
  - title only

### Bottom navigation

Replace mobile horizontal top navigation chips with a fixed bottom nav.

Required tabs:

- Overview
- Enquiries
- Drivers
- Fleet
- Settings

Rules:

- fixed to bottom
- safe-area aware
- active state clearly visible
- must not cover content or sticky action bars

### Primary action

Use a mobile floating action button or sticky action button for `New Entry`.

Recommended:

- floating `+ New`
- appears above the bottom nav
- only active on:
  - Enquiries
  - Drivers
  - Fleet

On Overview/Settings it can still exist, but keep behavior intentional.

## 11. Mobile Overview Specification

The mobile overview page should be a **command center**, not a full reporting dashboard.

### Section order

1. `Attention Now`
2. `Today`
3. `Quick Actions`
4. `Recent Activity`

### Attention Now

Must include:

- New Enquiries
- Awaiting Customer
- Pending Assignment
- Follow-ups Due

Implementation notes:

- compact 2-column grid
- tappable cards
- tapping applies the right filter and opens the Enquiries tab

### Today

Show compact metrics like:

- Contacted Today
- Assigned Today
- Completed Today
- Quoted Today

If “today” metrics are not currently available in state:

- either derive them from `submitted_at`, `last_contacted_at`, or audit data where practical
- or explicitly mark this as a follow-up enhancement and keep this section limited in Phase 1

Do not invent fake metrics.

### Quick Actions

Include tappable shortcuts:

- New Enquiry
- View New Enquiries
- View Pending Assignment
- Open Drivers

### Recent Activity

Show only 3 to 5 recent enquiries.

Each item should be compact:

- reference ID
- customer name
- service type
- status

## 12. Mobile Enquiries Inbox Specification

This is the highest-priority mobile screen.

### Default structure

Use a compact inbox card, not a full desktop-style card.

Required visible fields:

- reference ID
- status pill
- customer name
- enquiry type
- travel date
- submitted date/time
- quick actions

### Hidden-by-default details

Do not show these on the default collapsed card:

- full phone block
- full WhatsApp block
- large service summary paragraph
- assignment detail block
- audit detail block
- long notes

These should appear only when:

- the user taps `View`
- or the card expands

### Quick action row

Required default actions:

- WhatsApp
- View
- Mark Contacted when status is `New`

Optional contextual actions:

- Assign
- Quote
- Complete

Only show extra actions if the card still stays readable.

### Density target

At least 3 enquiry cards should be visible on a normal phone screen without excessive scrolling.

## 13. Search and Filter Specification

### Search

Use a compact mobile search experience.

Rules:

- keep it near the top of the Enquiries view
- do not use a large desktop-style search block
- keyboard should not cover key actions unnecessarily

### Filters

Filters should open in a **bottom sheet** or full-screen mobile drawer.

Required filter fields:

- enquiry type
- status
- travel date
- submitted from
- submitted to
- search term

Optional:

- assigned resource only if already supported cleanly by current data/state

### Active filters

After applying, show active filters as compact removable chips.

Rules:

- each chip removable individually
- include a clear-all/reset inside the filter sheet
- do not show a giant filter card above the list on mobile

## 14. Enquiry Detail Mobile Workspace Specification

### Pattern

Use a **full-screen mobile sheet/workspace** inside the dashboard, not the desktop modal layout.

### Structure

Top area:

- reference ID
- customer name
- status pill
- close/back button

Sections:

- Customer Details
- Requirement
- Travel Details
- Status and Assignment
- Quote
- Notes
- Activity Log / Audit Trail

### Section behavior

Use accordion/collapsible sections where appropriate.

Default-open sections:

- Customer Details
- Requirement
- Status and Assignment

Collapsed by default:

- Audit Trail
- long notes/history sections

### Sticky bottom action bar

Required actions:

- WhatsApp
- Save Changes

Secondary actions can live in:

- an overflow menu
- a secondary section action row

Secondary actions may include:

- Mark Contacted
- Change Status
- Archive

### Critical rule

Do not scatter many unrelated save buttons all over the mobile detail page unless absolutely necessary.

Preferred approach:

- one consolidated `Save Changes`

If grouped section-save is required, keep it limited and visually consistent.

## 15. New Entry Mobile Flow

### Entry launcher

When tapping `New Entry`, open an action sheet:

- Add Enquiry
- Add Driver
- Add Fleet Vehicle
- Cancel

### Entry forms

Open each form as a **full-screen mobile form**, not a cramped desktop modal.

Required form rules:

- sticky top bar with back/close
- sticky bottom submit button
- grouped sections
- full-width inputs
- safe-area aware bottom padding
- preserve existing save/loading/error behavior

### Form sources

Do not rewrite backend submission logic.

Reuse existing `handleAddEntry` flow and shared save handlers from [AdminDashboard.jsx](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/pages/AdminDashboard.jsx).

## 16. Drivers Mobile View Specification

### Default view

Use compact list rows or compact cards.

Required visible fields:

- driver name
- status
- assigned vehicle
- phone

Quick actions can include:

- WhatsApp if available
- View

### Filters

Required quick filters:

- All
- Active
- Unavailable
- Assigned

### Detail view

On tap, show:

- phone
- assigned vehicle
- availability status
- notes
- relevant assignment context

Do not create oversized desktop-like cards on mobile.

## 17. Fleet Mobile View Specification

### Default view

Use compact operational rows/cards.

Required visible fields:

- vehicle ID or plate
- model/type
- status
- assigned driver if available
- insurance expiry / warning

### Filters

Recommended:

- All
- Available
- Assigned
- Maintenance
- Expired Documents

Only implement filters that can be supported cleanly by existing data.

### Detail view

On tap, show:

- full vehicle identity
- status
- assigned driver
- insurance details
- service/notes if available

## 18. Visual Design Rules

The mobile redesign must reduce current heaviness.

### Reduce

- nested bordered panels
- big empty header space
- repeated metadata boxes
- excessive uppercase noise
- giant paddings

### Prefer

- card padding around `14px` to `16px`
- radius around `18px` to `22px`
- gap around `8px` to `12px`
- inline metadata rows where appropriate
- fewer “box inside box inside box” patterns

### Status and action emphasis

- bright colors reserved for actions and important status
- neutral metadata stays quiet
- action buttons should be thumb-friendly

## 19. Loading, Error, and Accessibility Rules

Continue using the loading/accessibility system already established in the project.

### Required

- `LoadingButton` for saving actions
- `SectionLoader` and `SkeletonBlock` for section data loading
- `role="status"` and `aria-live="polite"` for non-error loading/success states
- `role="alert"` for errors
- `aria-busy` on forms and section containers where appropriate

### Mobile UX constraints

- never replace the entire mobile dashboard with a full-screen spinner if only one section is loading
- preserve layout with skeletons
- avoid layout jump in detail sheets and lists
- direct WhatsApp links must stay instant, no fake loader

## 20. State Ownership and Prop Rules

### Parent state remains in `AdminDashboard`

Keep these in the parent:

- `activeTab`
- `searchQuery`
- `enquiryFilters`
- `enquiries`
- `drivers`
- `fleet`
- `dashboardError`
- `isLoading`
- `selectedEnquiry`
- `detailDraft`
- `isDetailLoading`
- `savingAction`
- `isEntryModalOpen` or new mobile equivalent
- password/settings state if still shown in mobile settings

### Children receive props

Child mobile components should receive:

- data slices
- derived counts
- current filters
- open/close callbacks
- action handlers
- save handlers

Do not let child mobile components independently call API functions if the parent already owns the flow.

## 21. Recommended Component Props

These do not need to match exactly, but they should stay close to this model.

### `MobileAdminDashboard`

Props:

- `activeTab`
- `setActiveTab`
- `enquiries`
- `drivers`
- `fleet`
- `overviewCounts`
- `categoryCounts`
- `recentEnquiries`
- `searchQuery`
- `setSearchQuery`
- `enquiryFilters`
- `setEnquiryFilters`
- `dashboardError`
- `isLoading`
- `onOpenEnquiryDetail`
- `onMarkContacted`
- `onOpenNewEntry`

### `MobileEnquiries`

Props:

- `enquiries`
- `filters`
- `setFilters`
- `isLoading`
- `onOpenDetail`
- `onMarkContacted`

### `MobileEnquiryDetail`

Props:

- `enquiry`
- `draft`
- `drivers`
- `fleet`
- `isLoading`
- `savingAction`
- `onClose`
- `onDraftChange`
- `onSaveStatus`
- `onSaveNotes`
- `onSaveQuote`
- `onSaveFollowUp`
- `onSaveDriver`
- `onSaveVehicle`
- `onSaveRoom`
- `onSavePackage`
- `onArchive`

### `MobileNewEntrySheet`

Props:

- `isOpen`
- `type`
- `onClose`
- `onSelectType`
- `onSubmit`
- `isSubmitting`

## 22. Interaction and Motion Rules

### Required

- sticky top bar shadow appears on scroll
- bottom nav fixed
- sheets slide from bottom or full-screen smoothly
- detail open/close should feel deliberate
- tap targets minimum ~44px
- forms and sticky bars must respect safe-area insets

### Avoid

- long exaggerated transitions
- heavy animation libraries
- multiple simultaneous motion layers that make the UI feel slow

## 23. Safe Area and Layout Protection

Make mobile layout safe for:

- iPhone bottom safe areas
- Android bottom browser UI overlap
- virtual keyboard interactions
- sticky bottom nav + sticky action bar coexistence

If needed, add utility classes in [src/index.css](/Users/basiljoy/VS%20code/roughnote/cabwebsit/src/index.css) for:

- bottom safe-area padding
- sheet bottom spacing
- sticky action bar offset

## 24. Build Order

Implement in this order.

### Milestone 1: Mobile shell and enquiries

1. create mobile component folder structure
2. split desktop vs mobile render path
3. build mobile shell:
   - top bar
   - bottom nav
   - floating `New Entry`
4. build mobile enquiries inbox
5. build mobile search/filter sheet
6. build mobile enquiry detail workspace

### Milestone 2: Overview and support sections

7. build mobile overview
8. build mobile drivers
9. build mobile fleet
10. build mobile new entry sheet and mobile forms

### Milestone 3: Polish and QA

11. reduce visual density
12. add motion polish
13. safe-area cleanup
14. accessibility and loading verification
15. final responsive QA

## 25. Testing Checklist

Test at minimum on these viewport widths:

- `360px`
- `390px`
- `412px`

### Functional testing

- overview cards open filtered enquiry lists correctly
- search works on mobile
- filter sheet apply/reset works
- active filter chips can be removed
- enquiry list remains usable with many items
- `View` opens detail workspace
- `WhatsApp` opens direct link without fake loading
- `Mark Contacted` updates status and UI
- status/note/quote/assignment save actions work in mobile detail
- archive works
- new entry flow works for:
  - enquiry
  - driver
  - fleet
- drivers and fleet search/filter work
- mobile settings page still supports password change and setup key where appropriate

### UX testing

- bottom nav does not cover action buttons
- sticky action bars remain visible
- cards are readable without excessive scrolling
- 3 enquiry cards should fit on a normal phone screen or close to it
- no horizontal scroll on main mobile admin pages
- filter sheet does not trap the user
- close/back is always visible in mobile sheets/forms

### Loading/error/accessibility testing

- mobile loading states preserve layout
- no unlabeled infinite spinners
- errors appear as alerts
- success/loading states announce properly
- keyboard navigation is not broken for basic actions

## 26. Definition of Done

The mobile admin dashboard is done when:

- desktop dashboard still works
- mobile no longer reuses the desktop dashboard layout visually
- horizontal top admin tab row is removed on mobile
- search/filters no longer dominate the screen
- mobile enquiries feel like an inbox
- mobile detail feels like a workspace
- new entry feels like a full-screen phone flow
- drivers/fleet are compact and scan-friendly
- loading/error/accessibility patterns remain correct
- `npm run build` passes
- `npm run lint` passes

## 27. Final Instruction to Codex

Use this exact operating principle while implementing:

> Build a separate mobile admin UI layer that reuses the current dashboard data and actions, preserves desktop behavior, prioritizes enquiries as an operational inbox, and replaces bulky desktop-responsive patterns with a compact, app-like phone workflow.

Do not stop after partial layout cleanup. Carry the redesign through:

- shell
- enquiries
- filters
- detail workspace
- overview
- drivers/fleet
- new entry
- polish
- QA

