# Feature Specification: Teaching Secretary Role Assignment

**Feature Branch**: `001-role-assignment`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "在当前组织架构顶层显示学校，实际可配置角色只保留专业负责人、课程负责人和任课教师的前提下，在教学秘书中新增一个页面，使教学秘书可以给当前系统中的正常状态教师账号加上这些角色。"

## Clarifications

### Session 2026-05-16

- Q: 新增角色绑定是否按学期生效？ → A: 所有角色不与学期绑定，登录面板展示登录用户各个学期的角色。
- Q: 同一范围内每类角色允许几人？ → A: 参照原系统新增角色逻辑：专业负责人和课程负责人可多人，任课教师每个课堂只允许 1 人。
- Q: 选择角色范围后页面如何展示用户？ → A: 同时展示该范围已授权用户和可新增用户。
- Q: 新增和移除角色时是否需要二次确认？ → A: 新增直接保存，移除需要二次确认。
- Q: 是否支持批量新增和批量移除角色？ → A: 支持批量新增和批量移除。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign a Role to an Available User (Priority: P1)

教学秘书需要在一个专用页面中查找当前系统可用用户，选择目标用户、选择要授予的组织角色，并指定该角色适用的业务范围，从而让该用户在后续登录或切换角色时拥有对应身份。

**Why this priority**: 这是本功能的核心价值；没有角色分配能力，教学秘书无法完成组织角色维护。

**Independent Test**: 使用教学秘书账号进入角色配置页面，选择一个可用用户并授予一个允许的角色；该用户重新登录或切换角色时能看到新角色并进入对应工作范围。

**Acceptance Scenarios**:

1. **Given** 教学秘书已登录且拥有角色配置权限，**When** 教学秘书搜索并选择一个可用用户，选择一个允许角色和对应范围后提交，**Then** 系统保存该用户的新角色并提示分配成功。
2. **Given** 用户已被授予新角色，**When** 该用户重新登录或切换角色，**Then** 角色列表中展示新授予角色及其所属学期或范围，并能进入该角色对应工作区。
3. **Given** 教学秘书尝试为同一用户、同一角色、同一范围重复授权，**When** 提交保存，**Then** 系统阻止重复记录并提示该角色已存在。
4. **Given** 某课堂已有任课教师，**When** 教学秘书尝试为同一课堂新增另一个任课教师，**Then** 系统阻止新增并提示该课堂已有任课教师。
5. **Given** 教学秘书已选择角色和对应范围，**When** 页面加载范围详情，**Then** 系统同时展示该范围已授权用户和仍可新增的用户。
6. **Given** 教学秘书在同一角色范围中选择多个可新增用户，**When** 提交批量新增，**Then** 系统为所有符合规则的用户新增角色，并对失败项展示原因。

---

### User Story 2 - Review and Remove Existing Assignments (Priority: P2)

教学秘书需要查看某个用户当前已有的组织角色，并能移除不再适用的角色，避免用户继续拥有过期或错误权限。

**Why this priority**: 角色配置不仅要能新增，也要能纠错和回收权限，否则会造成权限残留。

**Independent Test**: 选择一个已有多个角色的用户，查看其角色清单，删除其中一个角色后确认该用户不再能切换到被删除角色。

**Acceptance Scenarios**:

1. **Given** 某用户已有一个或多个组织角色，**When** 教学秘书打开该用户详情，**Then** 系统展示该用户当前角色、角色范围和状态。
2. **Given** 教学秘书选择删除某个角色绑定，**When** 系统展示二次确认且教学秘书确认删除，**Then** 系统移除该绑定并提示删除成功。
3. **Given** 被删除角色是用户当前正在使用的角色，**When** 删除完成，**Then** 该用户下一次登录或切换角色时不再看到该角色。
4. **Given** 教学秘书选择删除某个角色绑定，**When** 教学秘书取消二次确认，**Then** 系统保留原角色绑定且不产生删除结果。
5. **Given** 教学秘书选择多个已授权用户，**When** 确认批量移除，**Then** 系统移除所选角色绑定，并对失败项展示原因。

---

### User Story 3 - Limit Role Choices to the New Organization Model (Priority: P3)

教学秘书只能围绕新的组织架构进行角色维护，页面不应展示或允许选择已经不在本期要求中的旧角色或旧组织层级。学校名称只作为组织架构顶层显示，不作为可分配角色。

**Why this priority**: 新组织模型要求收敛角色和层级，避免教学秘书误配学院负责人、系主任、实验教师、助教等旧角色。

**Independent Test**: 打开角色配置页面，检查可选角色和可选范围；页面只展示本期要求范围内的角色和组织对象。

**Acceptance Scenarios**:

1. **Given** 系统中仍存在旧角色数据，**When** 教学秘书打开角色选择器，**Then** 页面只展示专业负责人、课程负责人和任课教师作为可授权选项。
2. **Given** 教学秘书选择专业负责人角色，**When** 选择适用范围，**Then** 系统只允许选择专业范围。
3. **Given** 教学秘书选择课程负责人角色，**When** 选择适用范围，**Then** 系统只允许选择课程范围。
4. **Given** 教学秘书选择任课教师角色，**When** 选择适用范围，**Then** 系统只允许选择课堂范围。

### Edge Cases

- 用户账号处于停用状态时，不允许新增角色绑定，并展示停用原因或状态提示。
- 用户已存在相同角色但作用范围不同，允许并列存在，但必须在列表中清楚区分范围。
- 专业负责人和课程负责人允许同一范围内配置多人；任课教师同一课堂只允许 1 人。
- 当前没有可用用户或搜索无结果时，页面展示空状态并允许重新搜索。
- 当前范围没有已授权用户时，已授权区域展示空状态，但不影响可新增用户列表。
- 批量新增或批量移除中部分用户失败时，系统保留成功项结果，并展示失败用户及失败原因。
- 当前没有可用专业或课堂范围时，对应角色不可提交，并提示先维护基础数据。
- 角色绑定保存成功后，如果该用户已在线，新的角色最迟应在其下次登录或角色列表刷新时可见。
- 当角色范围对应的专业或课堂被删除或停用时，相关角色绑定应不可继续被新增，并在已有绑定列表中标记为异常或不可用。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 为教学秘书提供一个独立的用户角色配置入口。
- **FR-002**: 系统 MUST 只允许具备教学秘书权限的用户访问该入口。
- **FR-003**: 教学秘书 MUST 能按姓名、登录标识或工号搜索正常状态教师账号。
- **FR-004**: 系统 MUST 在授权前展示可搜索用户的基础身份信息和当前可用状态。
- **FR-005**: 系统 MUST 允许教学秘书查看所选用户已有的组织角色授权。
- **FR-006**: 系统 MUST restrict assignable roles to the approved role set: 专业负责人、课程负责人、任课教师.
- **FR-007**: 系统 MUST 仅将学校作为顶层组织上下文显示，学校名称由系统提供；学校 MUST NOT 在本页面作为可授权角色。
- **FR-008**: 系统 MUST 将每个可授权角色映射到有效范围：专业负责人对应专业，课程负责人对应课程，任课教师对应课堂。
- **FR-009**: 系统 MUST treat only normal-status teacher accounts as available users for assignment.
- **FR-010**: 系统 MUST prevent duplicate assignments for the same user, role, and scope.
- **FR-011**: 系统 MUST allow the teaching secretary to remove an existing assignment after confirmation.
- **FR-012**: 系统 MUST 对角色新增和移除展示易理解的成功、校验和失败提示。
- **FR-013**: 系统 MUST 确保新授权角色在目标用户角色列表刷新后可见。
- **FR-014**: 系统 MUST keep old roles that are outside the approved role set from being newly assigned through this page.
- **FR-015**: 系统 MUST show enough context for each role assignment so a teaching secretary can distinguish assignments with the same role name but different scope.
- **FR-016**: 系统 MUST 支持在同一角色范围中批量新增多个可新增用户。
- **FR-017**: 系统 MUST NOT 将本页面新增的角色授权限制为当前学期；目标用户登录或切换角色时 MUST 能看到其各个学期下拥有的角色。
- **FR-018**: 系统 MUST 遵循原系统角色新增规则：同一专业可有多个专业负责人，同一课程可有多个课程负责人，同一课堂只允许一个任课教师。
- **FR-019**: 系统 MUST 在教学秘书选择角色范围后，同时展示该范围已授权用户和可新增用户。
- **FR-020**: 系统 MUST 在新增角色时直接保存并展示结果提示，在移除角色时先要求教学秘书二次确认。
- **FR-021**: 系统 MUST 支持批量移除同一角色范围中的多个已授权用户，并在执行前要求二次确认。
- **FR-022**: 系统 MUST 在批量操作中展示成功数量、失败数量以及每个失败项的原因。

### Key Entities *(include if feature involves data)*

- **Available User**: A normal-status teacher account eligible for role assignment. Key attributes include user identifier, display name, login identifier, personnel number, account category, organization affiliation, and status.
- **Assignable Role**: A role that teaching secretary can grant under the new organization model. Key attributes include role identifier, role name, allowed scope type, active status, and whether multiple users may hold it for the same scope.
- **Role Scope**: The organization or teaching object to which a role applies. It may represent profession, course, or classroom depending on the role. School is display context only.
- **User Role Assignment**: The relationship between a user, an assignable role, and a role scope. Key attributes include user, role, scope, assignment status, and visible term context when the scoped object belongs to a term.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A teaching secretary can find a target user and complete a single role assignment in under 2 minutes during normal use.
- **SC-002**: 100% of newly assigned roles are visible in the target user's role list after the role list is refreshed.
- **SC-003**: The role assignment page prevents 100% of duplicate user-role-scope assignments.
- **SC-004**: The page exposes no out-of-scope legacy roles and no assignable school role during acceptance testing.
- **SC-005**: At least 95% of assignment and removal attempts provide a clear success or actionable error message.
- **SC-006**: Teaching secretaries can correctly distinguish role assignments with different scopes in user testing without external documentation.
- **SC-007**: Teaching secretaries can complete batch assignment or batch removal for 10 selected users in under 3 minutes.

## Assumptions

- 教学秘书账号和登录后的菜单权限体系已存在，并继续作为访问控制基础。
- 第一版聚焦正常状态教师账号的组织角色配置，不包含学生角色和停用账号维护。
- 新页面负责新增和回收角色绑定，不负责创建用户、创建专业、创建课堂或维护角色菜单权限。
- 角色授权结果以用户下一次登录或刷新角色列表为准，不要求强制踢出当前在线会话。
- 本页面新增的组织角色授权不按当前学期截断；登录角色列表需要展示该用户跨学期可用的角色。
- 旧角色数据可以继续存在用于历史兼容，但不得在本页面作为新增授权选项出现。
