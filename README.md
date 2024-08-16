# Task Board System

## Table of Contents
- [Task Details](#task-details)
- [API Documentation](#api-documentation)
- [Data Model Documentation](#data-model-documentation)


## Task Details

<details>
<summary>Objective</summary>
The project aims to develop a comprehensive project management system with robust features for task assignment, user role management, and secure API interactions. The system will streamline the workflow of project teams by enabling administrators to efficiently manage projects and team members, ensuring that tasks are completed accurately and on time.
</details>

<details>
<summary>Key Features</summary>

- **Project Management:**
  - Create, update, and archive projects.
  - Add and remove project members.
  - Assign specific roles to users such as Contributors and Reviewers.
  - Ensure project completion logic is enforced, requiring all tasks to be completed before marking the project as complete.
- **Task Management:**
  - Automatically generate initial tasks (Group 1) on program initialization.
  - Enforce task group completion order, generating tasks from the next group only after the current group tasks are completed.
  - Allow specific personas to complete tasks, with tasks moving to completed status once done.
- **User Role Management:**
  - Assign and modify user roles, ensuring that all users have a designated role.
  - Reflect role changes immediately in user permissions.

</details>

## Security Roles within the System
### Admin
- Only Admin can create, update, and delete projects.
- Only Admin can assign staff to the project
- No project should be created without a contributor, approver, and reviewer.

### Approver
- Only Approver can create, update, delete a task.
- However, a task can only be marked as complete by the respective assigned user.


## API Documentation

<details>
<summary>Project Management API</summary>

### Endpoints

#### POST /api/projects

**Description:** Create a new project.

**Request Body:**
- `userId`: The ID of the user making the request (must be an admin).
- `name`: The name of the project.
- `contributorId`: The ID of the user assigned as the contributor.
- `approverId`: The ID of the user assigned as the approver.
- `reviewerId`: The ID of the user assigned as the reviewer.

**Responses:**
- **201 Created:**
  - `message`: 'Project created'
  - `project`: The created project object.
- **403 Forbidden:**
  - `message`: 'Forbidden: Only admins can manage projects'

#### DELETE /api/projects

**Description:** Delete an existing project.

**Request Body:**
- `userId`: The ID of the user making the request (must be an admin).
- `projectId`: The ID of the project to delete.

**Responses:**
- **200 OK:**
  - `message`: 'Project deleted'
- **404 Not Found:**
  - `message`: 'Project not found'
- **403 Forbidden:**
  - `message`: 'Forbidden: Only admins can manage projects'

#### GET /api/projects

**Description:** Fetch all projects.

**Responses:**
- **200 OK:**
  - `message`: 'Projects fetched'
  - `projects`: An array of project objects.

</details>

<details>
<summary>Task Management API</summary>

### Endpoints

#### GET /api/tasks

**Description:** Fetch tasks by status.

**Query Parameters:**
- `status` (optional): The status of the tasks to fetch (e.g., 'active', 'completed').

**Responses:**
- **200 OK:**
  - `message`: 'Tasks fetched'
  - `tasks`: An array of task objects.

#### PUT /api/tasks

**Description:** Update or complete a task.

**Request Body:**
- `userId`: The ID of the user making the request.
- `taskId`: The ID of the task to update.
- `updates`: An object containing the updates to apply to the task.
- `projectId`: The ID of the project the task belongs to.

**Responses:**

*If updating task status to 'completed':*
- **200 OK:**
  - `message`: 'Task marked as complete'
  - `tasks`: An array of updated task objects.
- **403 Forbidden:**
  - `message`: 'Forbidden: Only assigned user can mark the task as complete'

*If updating other task details:*
- **200 OK:**
  - `message`: 'Task updated'
  - `tasks`: An array of updated task objects.
- **403 Forbidden:**
  - `message`: 'Forbidden: Only approvers can update tasks'

#### DELETE /api/tasks

**Description:** Delete a task.

**Request Body:**
- `userId`: The ID of the user making the request.
- `taskId`: The ID of the task to delete.

**Responses:**
- **200 OK:**
  - `message`: 'Task deleted'
- **403 Forbidden:**
  - `message`: 'Forbidden: Only approvers can delete tasks'

</details>

<details>
<summary>User Management API</summary>

### Endpoints

#### GET /api/users

**Description:** Fetch all users.

**Responses:**
- **200 OK:**
  - `message`: 'Users fetched'
  - `users`: An array of user objects.

#### POST /api/users

**Description:** Add a new user.

**Request Body:**
- `id`: The ID of the new user.

**Responses:**
- **201 Created:**
  - `message`: 'User added'
  - `user`: The created user object.

#### PUT /api/users

**Description:** Update a user's role for a specific project.

**Request Body:**
- `userId`: The ID of the user to update.
- `newRole`: The new role to assign to the user.
- `projectId`: The ID of the project the role is assigned to.

**Responses:**
- **200 OK:**
  - `message`: 'Role updated'
- **404 Not Found:**
  - `message`: 'User not found'
- **500 Internal Server Error:**
  - `message`: 'Failed to update role'

</details>

## Data Model Documentation

<details>
<summary>User Model</summary>

### Attributes
- `id`: The unique identifier of the user.
- `project`: An object containing the project-specific role of the user:
  - `projectId`: The ID of the project.
  - `projectRole`: The role of the user in the project (e.g., 'admin', 'contributor', 'reviewer', 'approver').
- `role`: The general role of the user (e.g., 'admin', 'staff').

### Methods
- `getUsers()`: Returns the list of all users.
- `addUser(id: string, role: string)`: Adds a new user with the given ID and role.
- `getUserById(id: string)`: Returns the user with the specified ID.
- `updateUserRole(userId: string, newRole: string, projectId: string)`: Updates the role of the user for a specific project.
- `initializeUsers()`: Initializes a list of predefined users for testing purposes.

</details>

<details>
<summary>Project Model</summary>

### Attributes
- `id`: The unique identifier of the project.
- `name`: The name of the project.
- `members`: An object containing the IDs of users assigned to specific roles:
  - `contributor`: The ID of the contributor.
  - `approver`: The ID of the approver.
  - `reviewer`: The ID of the reviewer.
  - `admin`: The ID of the admin.

### Methods
- `getProjects()`: Returns the list of all projects.
- `createProject(name: string, contributorId: string, approverId: string, reviewerId: string, adminId: string)`: Creates a new project with the specified members and updates their roles.
- `deleteProject(projectId: string)`: Deletes the project with the specified ID.

</details>

<details>
<summary>Task Model</summary>

### Attributes
- `id`: The unique identifier of the task.
- `title`: The title of the task.
- `description`: The description of the task.
- `group`: The group number the task belongs to.
- `assignedTo`: The role assigned to complete the task.
- `status`: The current status of the task (e.g., 'active', 'pending', 'completed').

### Methods
- `initializeProjectTasks(projectId: string)`: Initializes the tasks for a project using a predefined task list.
- `getTasks(status?: string)`: Returns the list of tasks, optionally filtered by status.
- `updateTask(taskId: number, updates: Partial<Task>, userId: string)`: Updates the task with the specified ID if the user has the approver role.
- `markTaskAsComplete(taskId: number, userId: string, projectId: string)`: Marks the task as complete if the user has the assigned role for the task.
- `deleteTask(taskId: number, userId: string)`: Deletes the task if the user has the approver role.
- `createTask(title: string, description: string, group: number, assignedTo: string, userId: string)`: Creates a new task with the specified attributes if the user has the approver role.

</details>

