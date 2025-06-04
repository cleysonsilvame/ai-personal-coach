# 📌 PRD: Task Functionality with Chatbot Refinement

## Overview

The **Task** feature enables users to submit simple task descriptions that are automatically refined by a chatbot based on the project’s tech stack. The goal is to elevate the input to the level of an experienced product manager, providing a structured and actionable output for development teams.

This feature uses the **OpenAI API** to refine task descriptions through a language learning model (LLM).

---

## 🎯 Objectives

- Enable users to submit basic task descriptions.
- Automatically refine descriptions using an LLM.
- Return refined tasks in a structured JSON format.
- Store refinement suggestions and conversation history.
- Support iterative task improvement via user feedback.
- Allow saving of finalized tasks.
- Convert tasks into markdown, chunk content, and store as vector embeddings for future chatbot queries.

---

## 🧱 Tech Stack

- **Frontend:** React Router 7 (Framework Mode)
- **Database:** SQLite
- **ORM:** Prisma ORM
- **LLM API:** OpenAI (for task refinement)
- **Vector Storage:** SQLite-compatible solution

---

## 📥 User Input

Users provide:

- A simple task description (e.g., "create login form with authentication").

---

## 🤖 Chatbot Processing

The system sends the task description along with the project stack context to **OpenAI**, instructing the model to respond like a seasoned product manager.

### Example Prompt:

```
This project uses React Router 7 (framework mode), SQLite, and Prisma ORM.
Please refine the following task description and return a JSON object with:
title, description, steps, estimated_time, acceptance_criteria, suggested_tests, and implementation_suggestion.

Original description: "create login form with authentication"
```

---

## 📤 Expected JSON Output

```json
{
  "title": "Secure Login Form with Authentication",
  "description": "Implement a modern login form with field validation, session-based authentication, and real-time error feedback.",
  "estimated_time": "2 days",
  "steps": [
    "Create a form component using React",
    "Add field validation using a suitable library",
    "Connect backend for user authentication",
    "Persist sessions using SQLite",
    "Test full login and logout flow"
  ],
  "suggested_tests": [
    "it('should render login form correctly')",
    "it('should validate input fields')",
    "it('should authenticate valid credentials')",
    "it('should prevent access with invalid credentials')"
  ],
  "acceptance_criteria": [
    "Login form displays properly with required fields",
    "Invalid input is correctly flagged",
    "Valid users can log in and maintain a session",
    "Users are redirected upon login and logout"
  ],
  "implementation_suggestion": "Use React Hook Form for input validation, Prisma ORM for managing user data, and configure protected routes using React Router 7."
}
```

---

## 💬 Chat History

- All chatbot conversations will be stored in a **`chats`** table.
- Users can revisit and continue previous chats.
- Each conversation will be timestamped and linked to both the user and the associated task.

---

## 📚 Storage and Database Structure

### Tables

#### `tasks`

| Field                     | Type     | Description                                    |
| ------------------------- | -------- | ---------------------------------------------- |
| id                        | string   | UUID of the task                               |
| title                     | string   | Refined task title                             |
| description               | string   | Detailed task description                      |
| steps                     | string   | List of actionable steps                       |
| estimated_time            | string   | Example: "2 days"                              |
| implementation_suggestion | string   | Suggested approach and tools                   |
| acceptance_criteria       | string   | Task completion requirements                   |
| suggested_tests           | string   | Suggested tests                                |
| content                   | string   | Combined markdown version of all fields        |
| chat_history              | json     | JSON representation of associated conversation |
| created_at                | datetime | Creation timestamp                             |
| updated_at                | datetime | Last update timestamp                          |

#### `embeddings`

| Field      | Type     | Description                               |
| ---------- | -------- | ----------------------------------------- |
| id         | string   | UUID of the embedding                     |
| task_id    | string   | Foreign key referencing `tasks`           |
| vector     | vector   | Vector representation for semantic search |
| created_at | datetime | Timestamp of vector creation              |

---

## 🧠 Vector-Based AI Functionality (Future)

- All finalized tasks will be stored as vector embeddings.
- Future chatbot capabilities will include semantic search such as:
  - "Which tasks involve authentication?"
  - "List tasks that deal with form validation."

---

## 🖼️ User Interface

- Chatbot interface for input submission and refinement.
- Readable UI component displaying the refined JSON result.
- "Save Task" button to store the refined task.

---

## 📈 Success Metrics

- Percentage of tasks refined more than once.
- Average time to finalize a task.
- Number of tasks stored with vector embeddings.
- User engagement with past suggestions and chat history.

---

## 📅 Proposed Roadmap

| Phase        | Key Deliverables                                            |
| ------------ | ----------------------------------------------------------- |
| MVP          | Task input, OpenAI integration, JSON output, DB persistence |
| Iterations   | Chat history, task refinements, enhanced UI                 |
| Vector Phase | Vector embedding, semantic search chatbot                   |

---

## 📝 Final Considerations

This feature significantly enhances task clarity and team alignment, allowing even non-technical stakeholders to define development-ready tasks with minimal friction. It acts as a bridge between ideation and implementation through AI-assisted refinement.
