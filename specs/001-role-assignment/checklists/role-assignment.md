# Checklist: Teaching Secretary Role Assignment Form

**Purpose**: Review whether the role-assignment page/form requirements are complete, clear, and ready for planning.
**Created**: 2026-05-16
**Feature**: [spec.md](../spec.md)
**Audience**: Spec author and reviewer before implementation planning.

## Requirement Completeness

- [ ] CHK001 Are all three assignable roles named consistently as 专业负责人、课程负责人、任课教师 in the scenarios, requirements, and entities? [Requirements, FR-006]
- [ ] CHK002 Is the exclusion of 学校 as an assignable role explicitly stated wherever the organization model is described? [Requirements, FR-007]
- [ ] CHK003 Does the spec define the exact searchable user population as normal-status teacher accounts only? [Requirements, FR-003, FR-009]
- [ ] CHK004 Does the spec state which user identity fields must appear before assignment so the teaching secretary can distinguish similar users? [Requirements, FR-004]
- [ ] CHK005 Does the spec define the required assignment scope for each role: 专业, 课程, and 课堂? [Requirements, FR-008]
- [ ] CHK006 Does the spec include both adding new assignments and removing existing assignments as first-class workflows? [User Story 1, User Story 2]
- [ ] CHK007 Does the spec cover viewing already-authorized users and addable users after a role scope is selected? [Requirements, FR-019]
- [ ] CHK008 Does the spec define batch add and batch remove expectations for the same selected role scope? [Requirements, FR-016, FR-021]
- [ ] CHK009 Does the spec state that roles are not limited to the current term and must be visible across applicable terms in the login or role-switch list? [Requirements, FR-017]

## Requirement Clarity

- [ ] CHK010 Is "可用用户" defined without relying on implementation-specific account status codes? [Key Entities, Available User]
- [ ] CHK011 Is "角色范围" defined clearly enough for professional, course, and classroom scopes to be selected and displayed without ambiguity? [Key Entities, Role Scope]
- [ ] CHK012 Does the spec make the direct-save rule for additions and the confirmation rule for removals unambiguous? [Requirements, FR-020]
- [ ] CHK013 Does the spec clarify how duplicate user-role-scope assignments are identified? [Requirements, FR-010]
- [ ] CHK014 Does the spec distinguish same user plus same role in different scopes from a true duplicate? [Edge Cases]
- [ ] CHK015 Does the spec clearly describe the single-teacher constraint for 任课教师 at classroom scope? [Requirements, FR-018]
- [ ] CHK016 Does the spec define enough display context to distinguish same role names with different scopes and term context? [Requirements, FR-015, FR-017]
- [ ] CHK017 Are all mixed-language functional requirements phrased consistently enough for reviewers to interpret them the same way? [Requirements, FR-006, FR-009, FR-010, FR-011, FR-014, FR-015]

## Consistency And Conflicts

- [ ] CHK018 Do the user stories, functional requirements, and clarifications all agree that assignable roles exclude 课程负责人 typo corrections and include no 课堂负责人 role? [Clarifications, Requirements]
- [ ] CHK019 Do the scenarios and requirements align on whether professional and course responsible roles can have multiple users in the same scope? [Clarifications, FR-018]
- [ ] CHK020 Do the removal scenarios align with the requirement that batch removal always requires second confirmation? [User Story 2, FR-021]
- [ ] CHK021 Does the spec avoid conflict between "school as top-level display context" and any scope selection behavior? [Requirements, FR-007, Key Entities]
- [ ] CHK022 Does the spec consistently treat historical legacy roles as visible only where needed for compatibility and unavailable for new assignment? [User Story 3, FR-014]

## Scenario Coverage

- [ ] CHK023 Is there an acceptance scenario for assigning each role type to its valid scope type? [User Story 3]
- [ ] CHK024 Is there an acceptance scenario for successful single-user assignment? [User Story 1]
- [ ] CHK025 Is there an acceptance scenario for duplicate-assignment prevention? [User Story 1]
- [ ] CHK026 Is there an acceptance scenario for the classroom already having an 任课教师? [User Story 1]
- [ ] CHK027 Is there an acceptance scenario for successful removal after confirmation? [User Story 2]
- [ ] CHK028 Is there an acceptance scenario for canceling removal confirmation without changing assignments? [User Story 2]
- [ ] CHK029 Is there an acceptance scenario for partial failure in batch add and batch remove operations? [User Story 1, User Story 2, FR-022]

## Edge Case Coverage

- [ ] CHK030 Does the spec cover disabled users, no search results, no available scope data, and no existing authorized users? [Edge Cases]
- [ ] CHK031 Does the spec define expected behavior when a scope object is deleted or disabled after an assignment exists? [Edge Cases]
- [ ] CHK032 Does the spec identify how failures are surfaced when only part of a batch operation succeeds? [Edge Cases, FR-022]
- [ ] CHK033 Does the spec state what happens when a newly assigned user is already online at the time of assignment? [Edge Cases, Assumptions]

## Acceptance Criteria Quality

- [ ] CHK034 Are all success criteria measurable without depending on a specific frontend component implementation? [Success Criteria]
- [ ] CHK035 Does each P1 workflow have an independently testable outcome visible to the teaching secretary or target user? [User Story 1]
- [ ] CHK036 Do the timing criteria for single and batch operations define the expected user workload and normal-use conditions sufficiently? [SC-001, SC-007]
- [ ] CHK037 Does the 95% clear-message target define what qualifies as an actionable error message? [SC-005]
- [ ] CHK038 Does the 100% visibility criterion specify the trigger point as login or role-list refresh rather than immediate session invalidation? [SC-002, Assumptions]

## Dependencies And Assumptions

- [ ] CHK039 Are existing menu permission, login role list, and role-switch mechanisms identified as dependencies instead of being redesigned in this spec? [Assumptions]
- [ ] CHK040 Does the spec state that user, professional, course, and classroom creation remain outside this feature? [Assumptions]
- [ ] CHK041 Does the spec identify any backend-provided school name dependency clearly enough for implementation planning? [Clarifications, FR-007]
- [ ] CHK042 Does the spec define whether the new page depends on existing role IDs, role names, or a backend-provided assignable-role list? [Gap]
- [ ] CHK043 Does the spec define whether assignment failures should be grouped by user, role, scope, or backend validation reason in batch results? [Gap]

## Ambiguities To Resolve Before Planning

- [ ] CHK044 Is the navigation location under 教学秘书 menu named clearly enough for users and menu-permission configuration? [FR-001, FR-002]
- [ ] CHK045 Is the expected default view of the page defined: search by user first, select role scope first, or both available? [Gap]
- [ ] CHK046 Are required filters for selecting 专业、课程、课堂 scopes defined sufficiently for large datasets? [Gap]
- [ ] CHK047 Is the distinction between 课程负责人 scope and 任课教师课堂 scope clear where courses may have multiple classroom instances? [FR-008, Key Entities]
- [ ] CHK048 Is there a requirement for audit visibility, such as who assigned or removed a role and when, or is it intentionally out of scope? [Gap]
