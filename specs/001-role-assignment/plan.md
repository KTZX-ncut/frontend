# Implementation Plan: Teaching Secretary Role Assignment

**Branch**: `001-role-assignment` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-role-assignment/spec.md`

## Summary

在 `main-project` 的教学秘书菜单下新增一个“用户角色配置”页面，让教学秘书基于新的组织模型为正常状态教师账号配置 专业负责人、课程负责人、任课教师 三类角色。学校名称仅作为顶层组织上下文展示，由后端下发，不作为可授权角色。

技术路线采用现有 Vue 3 + Vite + Element Plus 页面模式，继续使用 `apps/main-project/src/utils/request.js` 的 `request.admin` / `request.course` 封装。现有专业负责人和课程负责人接口已分散在专业、课程编辑弹窗内，且课程负责人现有接口会写入当前学期；本功能应规划统一的教学秘书角色配置 API，避免前端拼接多个历史接口并满足“角色不与学期绑定”的新规则。

## Technical Context

**Language/Version**: JavaScript with Vue 3.3.11 single-file components; Vite 5.0.8.

**Primary Dependencies**: Vue Router 4.2.5, Pinia 2.1.7, Element Plus 2.5.1, axios 1.6.5, json-bigint 1.0.0.

**Storage**: Frontend uses sessionStorage for token and user context. Persistent role assignment storage is backend-owned, currently centered on `st_roleuser` with related `st_roles`, `st_users`, `sm_obs`, course and classroom tables.

**Testing**: No existing automated test script is defined for `main-project`. Per user instruction, do not run build as routine verification for this change; use focused code review and manual workflow checks. If test infrastructure is introduced later, integration and component workflow tests should cover the new page.

**Target Platform**: Browser-based web application served by Vite/build output.

**Project Type**: Frontend web application with backend API contracts.

**Performance Goals**:
- Teaching secretary can complete a single assignment in under 2 minutes.
- Teaching secretary can complete batch add/remove for 10 selected users in under 3 minutes.
- Page interactions should keep scope/user searches usable for large teacher lists by server-side filtering or scoped loading where backend supports it.

**Constraints**:
- Only `apps/main-project` frontend is in implementation scope for this repo, but the plan records required backend contracts for `smarttt-backend`.
- Only normal-status teacher accounts may be addable.
- Role choices are restricted to 专业负责人、课程负责人、任课教师.
- 学校 is display-only and cannot be submitted as a role or assignment scope.
- New role grants must not be restricted to the current term; role visibility follows login/role-list refresh.
- Add saves directly; remove requires second confirmation.
- Batch operations must report success count, failure count, and per-item failure reason.

**Scale/Scope**:
- One new teaching-secretary page in `main-project`.
- One route under `/homes/:rolehome/sysmangt`.
- One menu permission entry expected for 教学秘书.
- Three assignable role types with distinct scope types.
- Four planning artifacts: research, data model, API/UI contracts, quickstart.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The current constitution file is still the default template with placeholder principle names and descriptions. No concrete project-specific gate can be evaluated.

Gate result: PASS with no enforceable constitution constraints. Re-check after design remains PASS for the same reason.

## Project Structure

### Documentation (this feature)

```text
specs/001-role-assignment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contract.md
│   └── ui-contract.md
├── checklists/
│   ├── requirements.md
│   └── role-assignment.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/main-project/
├── package.json
└── src/
    ├── router/
    │   └── index.js
    ├── utils/
    │   └── request.js
    ├── components/
    │   ├── admin/
    │   │   ├── Peoplemangt.vue
    │   │   ├── Rolemangt.vue
    │   │   ├── Rolepurview.vue
    │   │   └── UserRoleAssign.vue
    │   └── course/
    │       └── subcomponents/
    │           ├── EditCourseDialog.vue
    │           └── EditClassroomDialog.vue
    └── views/
        └── redrawPages/
            ├── Login.vue
            └── teacherHomePage.vue

smarttt-backend/
├── smarttt-admin/
│   └── src/main/java/com/example/smartttadmin/
└── smarttt-course/
    └── src/main/java/com/example/smartttcourse/
```

**Structure Decision**: Implement the frontend page in `apps/main-project/src/components/admin/UserRoleAssign.vue`, register the route in `apps/main-project/src/router/index.js`, and use `apps/main-project/src/api/userRoleAssign.js` as a frontend integration layer over existing project APIs. Backend work is documented only where current permissions or API behavior affect rollout.

## Technical Decisions

1. Use the project’s existing role-specific APIs through a single frontend wrapper.
   - Existing endpoints:
     - `GET /sysmangt/professionmangt/professionRP`
     - `POST /sysmangt/professionmangt/professionRP/create`
     - `POST /sysmangt/professionmangt/professionRP/delete`
     - `POST /coursemangt/course/courseRP`
     - `POST /coursemangt/course/courseRP/create`
     - `POST /coursemangt/course/courseRP/delete`
   - Role metadata must come from `GET /sysmangt/rolemangt`; the frontend only filters by allowed role names and must not hardcode role IDs.

2. Place the route under the teaching secretary system-management menu.
   - Proposed route: `/homes/secretariatehome/sysmangt/userroleassign`
   - Router child path: `sysmangt/userroleassign`
   - Component: `../components/admin/UserRoleAssign.vue`
   - Menu permission: add backend menu record under 基础信息管理 or the teaching-secretary system section, and bind it to 教学秘书 role.

3. Keep role IDs backend-owned.
   - The frontend filters the role list by `rolename` values: 专业负责人, 课程负责人, 任课教师.
   - The returned `id`/`roleid` is passed through to assignment calls.
   - If `GET /sysmangt/rolemangt` returns 暂无权限 for 教学秘书, backend menu/API permission must be granted before the page can initialize.

4. Model the page around scope-first assignment.
   - Select role type.
   - Select valid scope for that role.
   - Display school name context.
   - Load already-authorized users and addable normal teacher accounts.
   - Batch add selected addable users.
   - Batch remove selected authorized users after confirmation.

## Phase 0: Research Summary

Detailed research is captured in [research.md](./research.md).

Resolved decisions:
- Use existing Vue 3 + Element Plus + axios patterns.
- Add a single `UserRoleAssign.vue` page rather than embedding in People/Role management.
- Prefer a backend unified admin API for role assignment.
- Treat term as display context from scoped objects, not as an assignment limiter.
- Keep duplicate and cardinality rules backend-authoritative with frontend pre-validation for UX.

## Phase 1: Design Summary

Design artifacts:
- [data-model.md](./data-model.md)
- [contracts/api-contract.md](./contracts/api-contract.md)
- [contracts/ui-contract.md](./contracts/ui-contract.md)
- [quickstart.md](./quickstart.md)

Primary entities:
- AvailableUser
- AssignableRole
- RoleScope
- UserRoleAssignment
- AssignmentBatchResult

Primary API groups:
- bootstrap data
- scope list
- scope assignment list
- teacher search
- batch assign
- batch remove

## Post-Design Constitution Check

The constitution remains a placeholder with no concrete gates. Phase 1 design introduces no known conflict with enforceable project rules.

Gate result: PASS.

## Complexity Tracking

No constitution violations require justification.

## Implementation Notes

- Frontend implementation uses `apps/main-project/src/api/userRoleAssign.js` as the single integration layer over existing project endpoints.
- No new `/sysmangt/userroleassign/*` backend endpoints are required by the frontend implementation.
- Production rollout remains blocked until backend binds `/sysmangt/userroleassign` to the 教学秘书 menu permission.
- Existing login and role-switch endpoints must return newly assigned roles without current-term-only filtering.
