# main.py

import sys
from logic import TaskManager

class TodoCLI:
    """
    The menu-driven command-line interface for the Todo application.
    """

    def __init__(self):
        self._task_manager = TaskManager()
        self._menu_options = {
            "1": ("Add Task", self._add_task),
            "2": ("View All Tasks", self._view_tasks),
            "3": ("Update Task", self._update_task),
            "4.py": ("Delete Task", self._delete_task),
            "5": ("Toggle Task Completion", self._toggle_task),
            "6": ("Exit", self._exit_app),
        }

    def _display_menu(self):
        """Displays the main menu."""
        print("\n--- Todo Menu ---")
        for key, (text, _) in self._menu_options.items():
            print(f"{key}. {text}")
        print("-----------------")

    def _get_user_choice(self, prompt: str) -> str:
        """Gets input from the user."""
        return input(prompt).strip()

    def _get_numeric_input(self, prompt: str) -> int:
        """Gets and validates a numeric input from the user."""
        while True:
            choice = self._get_user_choice(prompt)
            if choice.isdigit():
                return int(choice)
            else:
                print("Error: Please enter a valid number.")

    def _add_task(self):
        """Handles the 'Add Task' menu option."""
        title = self._get_user_choice("Enter title: ")
        if not title or not title.strip():
            print("Error: Title cannot be empty.")
            return
        description = self._get_user_choice("Enter description (optional): ")
        task = self._task_manager.add_task(title, description)
        print(f"Success: Task added with ID {task.id}.")

    def _view_tasks(self):
        """Handles the 'View All Tasks' menu option."""
        tasks = self._task_manager.view_all_tasks()
        if not tasks:
            print("Info: The task list is empty.")
            return

        print("\n--- Todo List ---")
        for task in tasks:
            status = "[X]" if task.completed else "[ ]"
            desc = f" - {task.description}" if task.description else ""
            print(f"{task.id}. {status} {task.title}{desc}")
        print("-----------------")

    def _update_task(self):
        """Handles the 'Update Task' menu option."""
        task_id = self._get_numeric_input("Enter ID of task to update: ")
        if not self._task_manager.get_task(task_id):
            print(f"Error: Task with ID {task_id} not found.")
            return
        
        new_title = self._get_user_choice("Enter new title (leave blank to keep current): ")
        if new_title and not new_title.strip():
            print("Error: Title cannot be empty.")
            return
            
        new_description = self._get_user_choice("Enter new description (leave blank to keep current): ")

        title_to_update = new_title if new_title.strip() else None
        desc_to_update = new_description if new_description else None

        self._task_manager.update_task(task_id, title_to_update, desc_to_update)
        print(f"Success: Task {task_id} updated.")

    def _delete_task(self):
        """Handles the 'Delete Task' menu option."""
        task_id = self._get_numeric_input("Enter ID of task to delete: ")
        if self._task_manager.delete_task(task_id):
            print(f"Success: Task {task_id} deleted.")
        else:
            print(f"Error: Task with ID {task_id} not found.")

    def _toggle_task(self):
        """Handles the 'Toggle Task Completion' menu option."""
        task_id = self._get_numeric_input("Enter ID of task to toggle: ")
        task = self._task_manager.toggle_task_completion(task_id)
        if task:
            status = "Complete" if task.completed else "Incomplete"
            print(f"Success: Task {task.id} marked as {status}.")
        else:
            print(f"Error: Task with ID {task_id} not found.")

    def _exit_app(self):
        """Exits the application."""
        print("Exiting application.")
        sys.exit(0)

    def run(self):
        """Runs the main application loop."""
        while True:
            self._display_menu()
            choice = self._get_user_choice("Enter your choice: ")
            if choice in self._menu_options:
                _, action = self._menu_options[choice]
                action()
            else:
                print("Error: Invalid choice. Please select a number from the menu.")

if __name__ == "__main__":
    try:
        TodoCLI().run()
    except (KeyboardInterrupt, EOFError):
        print("\nExiting application.")
