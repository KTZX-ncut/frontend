# UI Contract: Teaching Secretary Role Assignment Page

## Route

- Path: `/homes/secretariatehome/sysmangt/userroleassign`
- Router child path: `sysmangt/userroleassign`
- Component: `apps/main-project/src/components/admin/UserRoleAssign.vue`
- Access: visible and accessible only for users with 教学秘书 permission and the new menu permission.

## Page Regions

### Header Context

Required content:
- School name from backend bootstrap response.
- Current page title, recommended: `用户角色配置`.
- Current role-scope selection summary after selected.

School is display-only. No school assignment control may be present.

### Role Selector

Allowed options:
- 专业负责人
- 课程负责人
- 任课教师

Behavior:
- Selecting a role determines the allowed scope selector.
- Legacy roles must not appear.
- If backend marks one of the three roles inactive, the option should be disabled with reason.

### Scope Selector

Role-to-scope mapping:

| Role | Scope Selector |
|------|----------------|
| 专业负责人 | 专业 |
| 课程负责人 | 课程 |
| 任课教师 | 课堂 |

Behavior:
- Scope list supports keyword search.
- Course/classroom rows should show term context when available.
- Disabled/deleted scopes cannot be selected for new assignment.

### Authorized Users Table

Displays users already assigned to the selected role scope.

Required columns:
- Name
- Login name or job number
- Organization
- Role name
- Scope name
- Term or scope context when available
- Status
- Remove action

Batch behavior:
- Supports selecting multiple authorized users.
- Batch remove action is enabled only when at least one row is selected.
- Remove action must open a second confirmation before submit.

### Addable Users Table

Displays normal-status teacher accounts that can be added to the selected role scope.

Required columns:
- Name
- Login name or job number
- Organization
- Status

Batch behavior:
- Supports selecting multiple addable users for 专业负责人 and 课程负责人.
- For 任课教师, only one addable user may be submitted when classroom has no active teacher.
- Add submits directly without second confirmation.

### Result Feedback

Single operation:
- Success message when all selected users succeed.
- Error or warning message when any selected user fails.

Batch operation:
- Display `successCount` and `failureCount`.
- Display per-failure `displayName`/`userId` and reason message.
- Successful items update the tables without requiring full page reload.

## Empty States

Required empty states:
- No selected role.
- No selected scope.
- No scope search results.
- No authorized users in selected scope.
- No addable users in selected scope.

## Frontend Guardrails

- Disable submit when role or scope is missing.
- Disable add for unavailable scopes.
- Disable add for 任课教师 when classroom already has one active teacher.
- Do not rely on frontend filtering as the only protection; backend result messages remain authoritative.
