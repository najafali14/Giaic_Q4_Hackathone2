# Specification: CLI Todo Application (Phase 1) - Menu-Based (Final)

## 1. Overview
This document provides the final, unambiguous specification for a menu-based CLI todo application.

## 2. Core Principles
- **Spec-Driven Development**: This is the single source of truth.
- **In-Memory Storage**: Data is lost on application exit.
- **Technology**: Python 3.13, standard library only.
- **Interface**: A strictly menu-based console application.

## 3. The Task Entity
- **ID**: Unique, positive integer, generated sequentially from 1.
- **Title**: Required, non-empty string (whitespace trimmed).
- **Description**: Optional string.
- **Status**: Boolean. `True` for `Complete`, `False` for `Incomplete`. Defaults to `False`.

## 4. Menu-Driven Interaction Model
The application operates in a loop:
1. Display the main menu.
2. Prompt the user for a choice (`Enter your choice: `).
3. Execute the chosen action.
4. Repeat until the user chooses to exit.

### Main Menu
```
--- Todo Menu ---
1. Add Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Toggle Task Completion
6. Exit
```

## 5. Detailed Capabilities

### 5.1. Menu Option 1: Add Task
- **Flow**:
    1. System prompts: `Enter title: `
    2. User enters a title.
    3. System prompts: `Enter description (optional): `
    4. User enters a description or leaves it blank.
    5. A new task is created.
    6. System displays confirmation: `Success: Task added with ID [new_task_id].`
- **Edge Cases**:
    - If the title input is empty or only whitespace, the system displays `Error: Title cannot be empty.` and the task is not created.

### 5.2. Menu Option 2: View All Tasks
- **Flow**:
    1. System displays a header: `--- Todo List ---`
    2. Each task is displayed on a new line: `[ID]. [Status] [Title] - [Description]`
        - `[Status]` is `[X]` for Complete, `[ ]` for Incomplete.
        - The description is omitted if not present.
- **Edge Cases**:
    - If no tasks exist, the system displays `Info: The task list is empty.`

### 5.3. Menu Option 3: Update Task
- **Flow**:
    1. System prompts: `Enter ID of task to update: `
    2. User enters an ID.
    3. System prompts: `Enter new title (leave blank to keep current): `
    4. User enters a new title or leaves it blank.
    5. System prompts: `Enter new description (leave blank to keep current): `
    6. User enters a new description or leaves it blank.
    7. The corresponding task is updated.
    8. System displays confirmation: `Success: Task [task_id] updated.`
- **Edge Cases**:
    - If the entered ID does not exist, system displays `Error: Task with ID [entered_id] not found.`
    - If the new title is entered but is empty or only whitespace, the system displays `Error: Title cannot be empty.` and the update is not performed.

### 5.4. Menu Option 4: Delete Task
- **Flow**:
    1. System prompts: `Enter ID of task to delete: `
    2. User enters an ID.
    3. The corresponding task is removed.
    4. System displays confirmation: `Success: Task [task_id] deleted.`
- **Edge Cases**:
    - If the entered ID does not exist, the system displays `Error: Task with ID [entered_id] not found.`

### 5.5. Menu Option 5: Toggle Task Completion
- **Flow**:
    1. System prompts: `Enter ID of task to toggle: `
    2. User enters an ID.
    3. The task's status is flipped.
    4. System displays confirmation: `Success: Task [task_id] marked as [new_status].`
- **Edge Cases**:
    - If the entered ID does not exist, the system displays `Error: Task with ID [entered_id] not found.`

### 5.6. Menu Option 6: Exit
- **Flow**:
    1. System displays: `Exiting application.`
    2. The application terminates.

### General Input Handling
- For any prompt requiring a numeric input (menu choice, task ID):
    - If the input is not a valid integer, the system displays `Error: Please enter a valid number.`
- For menu choices:
    - If the number is not a valid menu option (e.g., 0 or 7), the system displays `Error: Invalid choice. Please select a number from the menu.`
