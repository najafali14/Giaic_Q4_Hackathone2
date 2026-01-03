# Hackathon 2 - Phase 1: Menu-Based Todo CLI

This project is a menu-driven command-line interface (CLI) Todo application created for Phase 1 of Hackathon 2.

## Development Process

This project was developed entirely by the Gemini CLI using a strict **Spec-Driven Development (SDD)** process.

1.  **Specification First**: The process began by creating a detailed specification document (`SPECIFICATION.md`). This document was iteratively refined to define a menu-based user interaction model before any application code was written.

2.  **Code Generation**: Once the specification was finalized and validated, the Gemini CLI was used to generate all the Python code for the application.

3.  **No Manual Logic**: The application logic was not written manually. It was generated directly from the finalized specifications.

## About the Application

The application is a simple, console-based Todo list manager that presents a menu for users to:
- Add tasks
- View all tasks
- Update tasks
- Delete tasks
- Toggle task completion status

All task data is stored in-memory, meaning it will be lost when the application closes, as required by the specification.

## How to Run

To run the application, execute the `main.py` file using a Python 3.13 interpreter.

```sh
python3 main.py
```

You will be presented with a menu of options to choose from.
