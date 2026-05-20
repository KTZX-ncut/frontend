# API Contract: Teaching Secretary Role Assignment

This contract documents the existing frontend-facing backend APIs used by `main-project`. All examples use the existing response envelope style:

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

The frontend should call these through `request.admin` unless backend routing requires otherwise.

## Frontend Integration Notes

- The route is registered at `/homes/secretariatehome/sysmangt/userroleassign`.
- The frontend API wrapper is `apps/main-project/src/api/userRoleAssign.js`.
- The wrapper reuses existing endpoints already used by `SchoolMangt.vue`, `Professionmangt.vue`, `Coursemangt.vue`, `Classroommangt.vue`, `EditHeadofProfession.vue`, `EditCourseDialog.vue`, and `EditClassroomDialog.vue`.
- Backend should add a menu record for `/sysmangt/userroleassign` and bind it to the 教学秘书 role so `/homes/teacherhome` can return the menu item for teaching secretary users.

## Existing APIs Referenced

| Purpose | Method | Path | Notes |
|---------|--------|------|-------|
| Login role list | POST | `/login` | Returns `simpleRoleList`. |
| Select role | POST | `/login/user` | Uses `id`, `roleid`, `obsid`, `obsdeep`, `catelog`. |
| Switch role list | POST | `/homes/switchrole` | Current user's role options. |
| Role home menu | POST | `/homes/teacherhome` | Menu tree for selected role. |
| System role list | GET | `/sysmangt/rolemangt` | Source of assignable role IDs. |
| Teacher list | GET | `/sysmangt/personnelmangt/person?obsid={obsid}&catelog=2` | Existing teacher list by organization. |
| Teacher search | GET | `/sysmangt/personnelmangt/search?inform={keyword}&catelog=2` | Existing search pattern. |
| Professional responsible candidates | GET | `/sysmangt/professionmangt/professionRP` | Existing role-specific candidate tree. |
| Course responsible candidates | POST | `/coursemangt/course/courseRP` | Existing role-specific candidate tree. |

## Existing APIs Used By The New Page

### School Context

`GET /sysmangt/schoolmangt`

Returns school display context. School is display-only in this feature and does not provide role metadata.

Response:

```json
{
  "code": 200,
  "data": {
    "id": "237675254",
    "obsname": "示例学校"
  }
}
```

### Role Metadata

`GET /sysmangt/rolemangt`

Returns system role rows. The frontend filters by `rolename` and maps allowed names to scopes:

| `rolename` | Frontend `roleKey` | Scope |
|------------|--------------------|-------|
| 专业负责人 | `profession_manager` | `profession` |
| 课程负责人 | `course_manager` | `course` |
| 任课教师 | `course_teacher` | `classroom` |

`id` or `roleid` from this response is the only source of runtime `roleId`. The frontend must not hardcode these IDs.

Validation:
- Only users with 教学秘书 permission may access.
- Response must not include legacy roles or school as an assignable role.

### List Professional Scopes

`GET /sysmangt/professionmangt`

Returns profession rows. Existing rows may include `responsiblePersonList` for 专业负责人 display.

### List Course Scopes

`GET /coursemangt/course`

Returns course rows. Existing rows include `responsiblePersonList` for 课程负责人 display.

### List Classroom Scopes

`GET /coursemangt/classroom`

Returns courses with `classroomReqList`; each classroom row has `teacherId` and `teacherName` for 任课教师 display.

### Candidate Teacher Trees

| Role | Method | Path |
|------|--------|------|
| 专业负责人 | GET | `/sysmangt/professionmangt/professionRP` |
| 课程负责人 | POST | `/coursemangt/course/courseRP` |
| 任课教师 | GET | `/coursemangt/classroom/teacher` |

The frontend flattens each tree's `responsiblePerson` users and filters already-authorized users locally.

### Add Assignments

| Role | Method | Path | Payload |
|------|--------|------|---------|
| 专业负责人 | POST | `/sysmangt/professionmangt/professionRP/create` | `{ userid, obsid, roleid }`, where `roleid` comes from `/sysmangt/rolemangt` |
| 课程负责人 | POST | `/coursemangt/course/courseRP/create` | `[{ userid, obsid, roleid }]`, where `roleid` comes from `/sysmangt/rolemangt` |
| 任课教师 | POST | `/coursemangt/classroom/update` | Existing classroom row plus new `teacherId` and `teacherName` |

### Remove Assignments

| Role | Method | Path | Payload |
|------|--------|------|---------|
| 专业负责人 | POST | `/sysmangt/professionmangt/professionRP/delete` | `{ userid, obsid, roleid }`, where `roleid` comes from `/sysmangt/rolemangt` |
| 课程负责人 | POST | `/coursemangt/course/courseRP/delete` | `{ userid, obsid, roleid }`, where `roleid` comes from `/sysmangt/rolemangt` |
| 任课教师 | POST | `/coursemangt/classroom/update` | Existing classroom row plus empty `teacherId` and `teacherName` |

## Frontend Normalized Data Shape

The page normalizes existing endpoint responses into this shape internally.

Response:

```json
{
  "code": 200,
  "data": {
    "roleId": "<from /sysmangt/rolemangt>",
    "scopeId": "P001",
    "authorizedUsers": [
      {
        "assignmentId": "RU001",
        "userId": "U001",
        "displayName": "张三",
        "loginName": "zhangsan",
        "personNo": "T1001",
        "roleId": "<from /sysmangt/rolemangt>",
        "roleName": "专业负责人",
        "scopeId": "P001",
        "scopeType": "profession",
        "scopeName": "软件工程",
        "termId": null,
        "termName": null,
        "status": "active"
      }
    ],
    "addableUsers": [
      {
        "userId": "U002",
        "displayName": "李四",
        "loginName": "lisi",
        "personNo": "T1002",
        "catelog": 2,
        "orgId": "D001",
        "orgName": "软件工程系",
        "status": "active"
      }
    ]
  }
}
```

Validation:
- Reject roles outside the approved set.
- Reject scope type mismatch.
- Reject duplicate `(userId, roleId, scopeId)`.
- Reject abnormal-status users.
- For 任课教师, reject if the classroom already has another active teacher.
- Frontend must show second confirmation before calling this endpoint.
- Backend should return failures for missing assignment, permission denial, or stale scope state where existing endpoints support it.
- Existing course responsible creation currently sets current term in backend; backend should confirm that login/role-list visibility still satisfies the cross-term requirement.

## Error Codes

| Code | Meaning |
|------|---------|
| `ROLE_NOT_ALLOWED` | Role is not in 专业负责人、课程负责人、任课教师. |
| `SCHOOL_NOT_ASSIGNABLE` | Request tried to assign school. |
| `SCOPE_TYPE_MISMATCH` | Role does not support requested scope type. |
| `DUPLICATE_ASSIGNMENT` | Same user-role-scope active assignment exists. |
| `CLASSROOM_TEACHER_EXISTS` | Classroom already has an active 任课教师. |
| `USER_DISABLED` | User is not normal/enabled. |
| `USER_NOT_TEACHER` | User is not a teacher account. |
| `SCOPE_UNAVAILABLE` | Scope was deleted, disabled, or cannot receive assignment. |
| `PERMISSION_DENIED` | Current user is not allowed to manage this page. |

## Role List Visibility Contract

The following existing endpoints must reflect role assignment changes after login or role-list refresh:

| Purpose | Method | Path | Expected behavior |
|---------|--------|------|-------------------|
| Initial login roles | POST | `/login` | `simpleRoleList` includes newly assigned professional, course, or classroom teacher roles. |
| Role switching | POST | `/homes/switchrole` | Returned role list includes newly assigned roles and excludes removed roles. |
| Select assigned role | POST | `/login/user` | Newly assigned `roleid` + `obsid` combinations can be selected successfully. |

These endpoints must not filter the new assignment only to the current term. Course or classroom term data may be displayed as context, but assignment visibility must follow the clarified cross-term rule.
