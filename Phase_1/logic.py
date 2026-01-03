# logic.py

from model import Task
from typing import Dict, List, Optional

class TaskManager:
    """
    Manages the collection of tasks in memory.
    """
    def __init__(self):
        self._tasks: Dict[int, Task] = {}
        self._next_id: int = 1

    def add_task(self, title: str, description: str) -> Task:
        """Adds a new task."""
        if not title or not title.strip():
            raise ValueError("Title cannot be empty.")
        
        task = Task(id=self._next_id, title=title, description=description)
        self._tasks[self._next_id] = task
        self._next_id += 1
        return task

    def view_all_tasks(self) -> List[Task]:
        """Returns a list of all tasks."""
        return list(self._tasks.values())

    def update_task(self, task_id: int, title: Optional[str], description: Optional[str]) -> Optional[Task]:
        """Updates a task's title and/or description."""
        if task_id not in self._tasks:
            return None
        
        task = self._tasks[task_id]
        if title is not None:
            if not title or not title.strip():
                raise ValueError("Title cannot be empty.")
            task.title = title
        
        if description is not None:
            task.description = description
            
        return task

    def delete_task(self, task_id: int) -> bool:
        """Deletes a task."""
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def toggle_task_completion(self, task_id: int) -> Optional[Task]:
        """Toggles the completion status of a task."""
        if task_id not in self._tasks:
            return None
        
        task = self._tasks[task_id]
        task.completed = not task.completed
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """Gets a single task by its ID."""
        return self._tasks.get(task_id)
