# Tasks: Teaching Secretary Role Assignment

**Input**: Design documents from `specs/001-role-assignment/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: No TDD or automated test requirement was requested in the spec. Per user instruction, do not run build for this feature unless explicitly requested; verification uses code review and the manual flow in [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story so US1 can ship as the MVP while US2 and US3 remain independently testable increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are satisfied because it touches different files or isolated sections.
- **[Story]**: Maps to the user story in [spec.md](./spec.md).
- Every task includes an exact file path.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the frontend implementation surface and preserve the API contract traceability.

- [X] T001 Review existing route/menu behavior for teaching secretary pages in `apps/main-project/src/router/index.js`
- [X] T002 [P] Review existing request client behavior and response rejection rules in `apps/main-project/src/utils/request.js`
- [X] T003 [P] Review existing admin page layout patterns in `apps/main-project/src/components/admin/Peoplemangt.vue`
- [X] T004 [P] Review existing role-related UI patterns in `apps/main-project/src/components/admin/Rolemangt.vue`
- [X] T005 [P] Review existing responsible-person add/remove patterns in `apps/main-project/src/components/admin/subcomponents/EditHeadofProfession.vue`
- [X] T006 [P] Review existing course responsible-person add/remove patterns in `apps/main-project/src/components/course/subcomponents/EditCourseDialog.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared frontend primitives that all user stories depend on.

**CRITICAL**: No user story implementation should start until this phase is complete.

- [X] T007 Create role assignment API wrapper functions for bootstrap, scopes, assignments, users, assign, and remove in `apps/main-project/src/api/userRoleAssign.js`
- [X] T008 Define frontend constants for role keys, scope types, error codes, and temporary fallback role metadata in `apps/main-project/src/components/admin/userRoleAssign.constants.js`
- [X] T009 Create reusable normalization helpers for bootstrap, scope, assignment, user, and batch result payloads in `apps/main-project/src/components/admin/userRoleAssign.helpers.js`
- [X] T010 Create the base `UserRoleAssign.vue` component shell with page layout, loading state, and empty state placeholders in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T011 Register the `sysmangt/userroleassign` child route pointing to `UserRoleAssign.vue` in `apps/main-project/src/router/index.js`
- [X] T012 Document the required backend menu permission entry and 教学秘书 role binding in `specs/001-role-assignment/contracts/api-contract.md`

**Checkpoint**: The route and shared client/helper layer exist; user-story work can begin.

---

## Phase 3: User Story 1 - Assign a Role to an Available User (Priority: P1) MVP

**Goal**: Teaching secretary can select an allowed role and scope, see already-authorized and addable users, add one or more available teachers, and get clear result feedback.

**Independent Test**: Login as teaching secretary, open `/homes/secretariatehome/sysmangt/userroleassign`, choose an allowed role and valid scope, add a normal teacher account, and confirm the target user sees the new role after login or role-list refresh.

### Implementation for User Story 1

- [X] T013 [US1] Load bootstrap data on mount and render backend school name plus assignable roles in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T014 [US1] Implement role selection state and reset dependent scope/user state when role changes in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T015 [US1] Implement scope search and scope selection using `listRoleScopes` from `apps/main-project/src/api/userRoleAssign.js`
- [X] T016 [US1] Render selected scope summary with role name, scope name, parent name, and term context in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T017 [US1] Load selected scope details with authorized users and addable users using `getScopeAssignments` in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T018 [US1] Render the authorized users table with name, login/job number, organization, role, scope, term context, and status columns in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T019 [US1] Render the addable users table with selectable normal-status teacher rows in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T020 [US1] Implement addable teacher keyword search using `searchAddableTeachers` from `apps/main-project/src/api/userRoleAssign.js`
- [X] T021 [US1] Implement single and batch assignment submission using `assignRoleUsers` in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T022 [US1] Implement duplicate and classroom-teacher frontend guardrails before assignment submit in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T023 [US1] Render batch add result summary with success count, failure count, and per-failure reason in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T024 [US1] Refresh authorized and addable user tables after successful add results in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T025 [US1] Add US1 manual verification steps and expected backend response assumptions in `specs/001-role-assignment/quickstart.md`

**Checkpoint**: US1 is complete and independently testable as the MVP.

---

## Phase 4: User Story 2 - Review and Remove Existing Assignments (Priority: P2)

**Goal**: Teaching secretary can inspect existing assignments in a selected role scope and remove one or more assignments only after second confirmation.

**Independent Test**: Select a scope with existing assignments, remove one assignment after confirmation, cancel another removal confirmation, then verify removed roles disappear from the target user's login or role-switch list.

### Implementation for User Story 2

- [X] T026 [US2] Add row-level remove actions to the authorized users table in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T027 [US2] Add authorized-user multi-select state and batch remove toolbar action in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T028 [US2] Implement second confirmation dialog for single remove and batch remove in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T029 [US2] Implement remove submission using `removeRoleUsers` from `apps/main-project/src/api/userRoleAssign.js`
- [X] T030 [US2] Preserve assignments and local table state when teaching secretary cancels the remove confirmation in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T031 [US2] Render batch remove result summary with success count, failure count, and per-failure reason in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T032 [US2] Refresh authorized and addable user tables after successful remove results in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T033 [US2] Add US2 manual verification steps for confirmed remove, canceled remove, and target-user role-list refresh in `specs/001-role-assignment/quickstart.md`

**Checkpoint**: US2 is complete and can be validated without changing role selection rules.

---

## Phase 5: User Story 3 - Limit Role Choices to the New Organization Model (Priority: P3)

**Goal**: The page exposes only the new role model: school as display context, assignable roles restricted to 专业负责人、课程负责人、任课教师, and role scopes restricted to profession/course/classroom.

**Independent Test**: Open the page when legacy roles still exist in the system and confirm only the three approved roles are selectable; each role only loads its valid scope type, and school is not assignable.

### Implementation for User Story 3

- [X] T034 [US3] Filter bootstrap roles against approved role keys and hide all legacy role data in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T035 [US3] Render school only in the page header context and ensure no school option appears in role or scope selectors in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T036 [US3] Enforce role-to-scope mapping before scope API calls in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T037 [US3] Disable unavailable or inactive backend-provided roles with clear status text in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T038 [US3] Show empty or blocked states for unavailable professional, course, or classroom scope lists in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T039 [US3] Add US3 manual verification steps for legacy-role exclusion and valid scope mapping in `specs/001-role-assignment/quickstart.md`

**Checkpoint**: US3 is complete and validates the new organization model independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, UX cleanup, and implementation safety checks.

- [X] T040 [P] Review text consistency and translate mixed English/Chinese requirement-facing UI labels in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T041 [P] Add scoped styles for dense table layout, responsive controls, and stable button widths in `apps/main-project/src/components/admin/UserRoleAssign.vue`
- [X] T042 [P] Update the API contract with any backend-confirmed endpoint or payload changes in `specs/001-role-assignment/contracts/api-contract.md`
- [X] T043 Review changed frontend code paths without running build
- [ ] T044 Execute the manual acceptance flow from `specs/001-role-assignment/quickstart.md`
- [X] T045 Record any unresolved backend dependency or rollout risk in `specs/001-role-assignment/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 because it uses observed local patterns.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2 and the authorized-users table from US1 tasks T017-T018.
- **Phase 5 US3**: Depends on Phase 2 and can run in parallel with much of US1 after bootstrap and role state exist.
- **Phase 6 Polish**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 only; delivers MVP assignment capability.
- **US2 (P2)**: Requires Phase 2 and the authorized users table from US1.
- **US3 (P3)**: Requires Phase 2; can be implemented alongside US1 role/scope controls.

### Parallel Opportunities

- T002-T006 can run in parallel during setup.
- T013-T016 and T019-T020 can be split after T010-T012 are complete, but final integration remains in `UserRoleAssign.vue`.
- US2 tasks T026-T027 can run before T028-T032.
- US3 tasks T034-T038 can run after bootstrap and role selection state exist.
- T040-T042 can run in parallel during polish.

---

## Parallel Example: User Story 1

```text
Task: "Implement scope search and scope selection using listRoleScopes from apps/main-project/src/api/userRoleAssign.js"
Task: "Render the addable users table with selectable normal-status teacher rows in apps/main-project/src/components/admin/UserRoleAssign.vue"
Task: "Implement addable teacher keyword search using searchAddableTeachers from apps/main-project/src/api/userRoleAssign.js"
```

## Parallel Example: User Story 2

```text
Task: "Add row-level remove actions to the authorized users table in apps/main-project/src/components/admin/UserRoleAssign.vue"
Task: "Add authorized-user multi-select state and batch remove toolbar action in apps/main-project/src/components/admin/UserRoleAssign.vue"
```

## Parallel Example: User Story 3

```text
Task: "Filter bootstrap roles against approved role keys and hide all legacy role data in apps/main-project/src/components/admin/UserRoleAssign.vue"
Task: "Show empty or blocked states for unavailable professional, course, or classroom scope lists in apps/main-project/src/components/admin/UserRoleAssign.vue"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 setup review.
2. Complete Phase 2 foundational files and route registration.
3. Complete Phase 3 US1.
4. Stop and validate US1 with a teaching secretary account and target teacher account.

### Incremental Delivery

1. Deliver US1 for role assignment and table refresh.
2. Add US2 for confirmed removal and batch removal.
3. Add US3 hardening for legacy-role exclusion and strict role-scope mapping.
4. Run final code review and manual acceptance checks; do not run build unless the user asks for it.

### Notes

- Frontend must use existing project APIs only. Role IDs come from `GET /sysmangt/rolemangt`; no mock assignment API or hardcoded role IDs are allowed.
- Keep backend validation authoritative for duplicate assignments, disabled users, unavailable scopes, and the one-任课教师-per-classroom rule.
- Do not modify unrelated admin, course, login, or role-management pages beyond route registration and documented integration points.
