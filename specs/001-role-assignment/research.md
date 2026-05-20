# Research: Teaching Secretary Role Assignment

## Decision: Build a new dedicated admin page for teaching secretary role assignment

**Rationale**: The requirement is not general role-menu authorization and not personnel creation. Existing pages split responsibilities across 人员管理, 角色管理, 专业负责人弹窗, and 课程负责人弹窗. A dedicated page keeps the workflow centered on selecting role scope, seeing authorized users, and adding/removing normal teacher accounts.

**Alternatives considered**:
- Extend `Peoplemangt.vue`: rejected because the user workflow is scope-based and batch-oriented, while the personnel page is account CRUD.
- Extend `Rolemangt.vue` or `Rolepurview.vue`: rejected because those pages manage role definitions and menu permissions, not user-role-scope bindings.

## Decision: Use a unified backend API for this page

**Rationale**: The current system has role-specific APIs:
- `GET /sysmangt/professionmangt/professionRP`
- `POST /sysmangt/professionmangt/professionRP/create`
- `POST /sysmangt/professionmangt/professionRP/delete`
- `POST /coursemangt/course/courseRP`
- `POST /coursemangt/course/courseRP/create`
- `POST /coursemangt/course/courseRP/delete`

These endpoints were designed for existing edit dialogs. They do not provide a single contract for all three roles, batch result details, authorized/addable split, or the new rule that role grants are not limited to the current term. `CourseController#createCourseRP` currently sets `termid` from current term, which conflicts with the clarified requirement.

**Alternatives considered**:
- Reuse existing endpoints directly in frontend: rejected because it would duplicate business rules in the frontend and still not cover 任课教师 batch assignment cleanly.
- Add frontend-only adapters over existing endpoints: rejected because duplicate prevention, disabled scope handling, and single 任课教师 cardinality must be backend-authoritative.

## Decision: Role IDs stay backend-owned, frontend consumes assignable-role metadata

**Rationale**: SQL and backend code show stable known IDs for the target roles, but hardcoding IDs in the frontend makes future backend data repair or migration expensive. The page should request the allowed role set from backend and use `roleKey`, `roleId`, `scopeType`, and `multipleAllowed`.

**Alternatives considered**:
- Hardcode the three role IDs in `UserRoleAssign.vue`: acceptable only as a temporary fallback, rejected for the plan because it couples UI to seed data.
- Query all roles through `/sysmangt/rolemangt` and filter by name: rejected because old roles still exist and the allowed set is a business rule, not a text filter.

## Decision: Scope-first workflow

**Rationale**: The clarified requirement says that after selecting role scope, the page must display both already-authorized users and addable users. A scope-first flow also maps naturally to the cardinality rule: professional/course responsible roles allow multiple users per scope, while one classroom can have only one 任课教师.

**Alternatives considered**:
- User-first workflow: useful for reviewing a single user's assignments, but it makes batch operations and scope-level cardinality less direct.
- Two independent modes: deferred to future scope because it increases UI complexity without changing the core requirement.

## Decision: New assignments are term-independent; term appears only as display context

**Rationale**: The user clarified that all roles are not bound to a term, and the login panel can show the user's roles across terms. However, course and classroom scopes may belong to terms, so the role list still needs enough term/scope context for users to distinguish entries.

**Alternatives considered**:
- Keep current-term assignment behavior from course responsible API: rejected because it conflicts with the clarified requirement.
- Remove term information from display entirely: rejected because the spec requires enough context for same role names across different scopes and term contexts.

## Decision: Backend validates duplicate and cardinality rules; frontend mirrors them for fast feedback

**Rationale**: The backend owns `st_roleuser` and can reliably prevent duplicate records and enforce the single 任课教师 per classroom rule. The frontend should disable impossible actions and show clear messages, but final correctness must not depend on UI state.

**Alternatives considered**:
- Frontend-only validation: rejected because concurrent edits or direct API calls could violate constraints.
- Backend-only validation with no frontend hints: rejected because the page would provide poor user feedback.

## Decision: Batch operations return itemized results

**Rationale**: The spec requires success/failure counts and per-failure reasons. Returning itemized results allows the frontend to keep successful rows updated and display actionable failures without guessing.

**Alternatives considered**:
- All-or-nothing transaction: rejected because the spec explicitly allows partial success.
- Boolean success response: rejected because it cannot satisfy failure reason requirements.
