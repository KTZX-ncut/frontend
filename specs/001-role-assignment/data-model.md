# Data Model: Teaching Secretary Role Assignment

## AvailableUser

Normal-status teacher account eligible for assignment.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `userId` | string | yes | Maps to backend user ID. |
| `displayName` | string | yes | Teacher display name. |
| `loginName` | string | no | Login identifier. |
| `personNo` | string | no | Personnel number or job number. |
| `catelog` | number/string | yes | Teacher account category; existing teacher category is expected to be `2`. |
| `orgId` | string | no | Current organization node. |
| `orgName` | string | no | Organization display name. |
| `status` | string/number | yes | Must represent normal/enabled status to be assignable. |
| `statusText` | string | no | Display label for disabled or abnormal users. |

Validation:
- Only normal-status teacher accounts are addable.
- Disabled or non-teacher accounts may be returned only for explanatory display, never selected for new assignment.

## AssignableRole

Role the teaching secretary may grant in this page.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `roleId` | string | yes | Backend role ID. |
| `roleKey` | enum | yes | `profession_manager`, `course_manager`, `course_teacher`. |
| `roleName` | string | yes | 专业负责人, 课程负责人, 任课教师. |
| `scopeType` | enum | yes | `profession`, `course`, `classroom`. |
| `multipleAllowed` | boolean | yes | True for professional/course responsible roles; false for classroom teacher. |
| `active` | boolean | yes | Inactive roles are not selectable. |

Role ID source:
- `roleId` must be read from `GET /sysmangt/rolemangt`.
- The frontend only owns the allowed role names and scope mapping.
- Role IDs must not be hardcoded in the frontend implementation.

Validation:
- No role outside this set may appear as assignable.
- 学校 is not an AssignableRole.

## RoleScope

Business object to which a role applies.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `scopeId` | string | yes | Profession, course, or classroom ID. |
| `scopeType` | enum | yes | `profession`, `course`, `classroom`. |
| `scopeName` | string | yes | Display name. |
| `scopeCode` | string | no | Profession code, course code, or classroom code if available. |
| `parentId` | string | no | Parent organization/course ID. |
| `parentName` | string | no | Parent display name. |
| `termId` | string | no | Display context only. |
| `termName` | string | no | Display context only. |
| `status` | string/number | yes | Active/enabled scopes are assignable. |
| `disabledReason` | string | no | Used when existing assignment scope is unavailable. |

Validation:
- `profession_manager` accepts only `profession` scopes.
- `course_manager` accepts only `course` scopes.
- `course_teacher` accepts only `classroom` scopes.
- Deleted or disabled scopes cannot receive new assignments.

## UserRoleAssignment

Relationship among user, role, and scope.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `assignmentId` | string | yes | Usually `st_roleuser.id`. |
| `userId` | string | yes | Assigned user. |
| `displayName` | string | yes | Assigned user's display name. |
| `loginName` | string | no | Login identifier. |
| `personNo` | string | no | Personnel number. |
| `roleId` | string | yes | Assigned role. |
| `roleName` | string | yes | Display name. |
| `scopeId` | string | yes | Assigned scope. |
| `scopeType` | enum | yes | Scope type. |
| `scopeName` | string | yes | Scope display name. |
| `termId` | string | no | Display context only. |
| `termName` | string | no | Display context only. |
| `status` | enum | yes | `active`, `scope_unavailable`, `user_disabled`, `deleted`. |
| `createdAt` | string | no | Assignment creation time. |

Validation:
- `(userId, roleId, scopeId)` must be unique among active assignments.
- For `roleKey=course_teacher`, `(roleId, scopeId)` may have only one active assignment.
- Professional and course responsible roles allow multiple users for the same scope.

State transitions:
- `none` -> `active`: successful add.
- `active` -> `deleted`: successful remove after confirmation.
- `active` -> `scope_unavailable`: scope deleted or disabled outside this feature.
- `active` -> `user_disabled`: user disabled outside this feature.

## AssignmentBatchRequest

Payload for add/remove actions.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `roleId` | string | yes | Target assignable role. |
| `scopeType` | enum | yes | Must match role metadata. |
| `scopeId` | string | yes | Target scope. |
| `userIds` | string[] | yes | One or more target users. |
| `operation` | enum | yes | `assign` or `remove`. |

Validation:
- `userIds` must be non-empty.
- Remove operations require frontend confirmation before submit.
- Backend returns per-user results even when only one user is submitted.

## AssignmentBatchResult

Result displayed after add/remove.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `successCount` | number | yes | Number of successful items. |
| `failureCount` | number | yes | Number of failed items. |
| `items` | BatchResultItem[] | yes | Itemized result. |

### BatchResultItem

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `userId` | string | yes | Target user. |
| `assignmentId` | string | no | Present when assignment exists or was created. |
| `success` | boolean | yes | Item result. |
| `reasonCode` | string | no | Examples: `DUPLICATE_ASSIGNMENT`, `USER_DISABLED`, `SCOPE_UNAVAILABLE`, `CLASSROOM_TEACHER_EXISTS`. |
| `message` | string | no | Human-readable reason. |
