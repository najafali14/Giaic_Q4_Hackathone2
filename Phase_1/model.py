# model.py

import dataclasses

@dataclasses.dataclass
class Task:
    """
    Represents a single task in the to-do list.
    """
    id: int
    title: str
    description: str
    completed: bool = False
