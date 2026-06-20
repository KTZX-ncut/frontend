# Quickstart: Teaching Secretary Role Assignment

## Prerequisites

- Work in repository root: `/Users/yangliu/Desktop/project/smt/frontend`
- Target frontend app: `apps/main-project`
- Backend reference service: `smarttt-backend`
- Feature branch: `001-role-assignment`

## Install

```bash
cd apps/main-project
npm install
```

## Run Frontend

```bash
cd apps/main-project
npm run dev
```

Use the Vite URL printed by the command.

## Build Verification

```bash
cd apps/main-project
# Do not run build unless explicitly requested by the user for this feature.
```

## Manual Verification Flow

1. Login as a teaching secretary user.
2. Open `/homes/secretariatehome/sysmangt/userroleassign` from the teaching-secretary menu.
3. Confirm the school name is displayed and cannot be assigned.
4. Confirm role options include only 专业负责人、课程负责人、任课教师.
5. Select 专业负责人 and choose a profession scope.
6. Confirm already-authorized users and addable normal teacher accounts are both visible.
7. Add one teacher; confirm success and role visibility after target user's login or role-list refresh.
8. Attempt duplicate add for the same user-role-scope; confirm it is blocked with a clear reason.
9. Batch add multiple teachers for 专业负责人 or 课程负责人; confirm success/failure counts and per-failure reasons.
10. Select 任课教师 and choose a classroom that already has a teacher; confirm a second teacher cannot be added.
11. Remove an assignment; confirm the second confirmation is shown before submit.
12. Batch remove multiple assignments; confirm success/failure counts and per-failure reasons.

## Story-Specific Checks

### US1: Add Assignment

- Select each allowed role once and verify the scope selector changes to 专业、课程、课堂 respectively.
- Select a scope and confirm the page displays 已授权用户 and 可新增用户 at the same time.
- Add one normal teacher account and confirm the table refreshes without a full page reload.
- Batch add multiple users for 专业负责人 or 课程负责人 and confirm itemized failures remain visible.

### US2: Remove Assignment

- Remove one row from 已授权用户 and confirm the second confirmation appears.
- Cancel a remove confirmation and confirm the row remains visible.
- Batch remove multiple rows and confirm success/failure counts and per-user failure reasons.
- Login or refresh role list as the target user and confirm removed roles no longer appear.

### US3: New Organization Model

- Confirm the page never shows 学校 as an assignable role or scope option.
- Confirm legacy roles such as 学院负责人、系主任、实验教师、助教 do not appear even if backend role data still contains them.
- Confirm 专业负责人 only loads professional scopes.
- Confirm 课程负责人 only loads course scopes.
- Confirm 任课教师 only loads classroom scopes.

## Backend Contract Checks

The page uses these existing backend endpoints:

- `GET /sysmangt/schoolmangt`
- `GET /sysmangt/professionmangt`
- `GET /sysmangt/professionmangt/professionRP`
- `POST /sysmangt/professionmangt/professionRP/create`
- `POST /sysmangt/professionmangt/professionRP/delete`
- `GET /coursemangt/course`
- `POST /coursemangt/course/courseRP`
- `POST /coursemangt/course/courseRP/create`
- `POST /coursemangt/course/courseRP/delete`
- `GET /coursemangt/classroom`
- `GET /coursemangt/classroom/teacher`
- `POST /coursemangt/classroom/update`

The existing role list endpoints should still reflect new assignments:

- `POST /login`
- `POST /login/user`
- `POST /homes/switchrole`

## Notes For Implementation

- Existing `request.js` rejects non-200 business responses and shows `ElMessage`; page-level batch result handling should use successful envelope responses with per-item failures in `data.items`.
- Existing course responsible API writes current term; backend still needs to confirm login/role-switch lists satisfy the cross-term visibility rule.
- 任课教师 uses the same existing classroom edit path as `EditClassroomDialog.vue`: `POST /coursemangt/classroom/update`.
