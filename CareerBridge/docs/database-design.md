# Database design

Record the approved ER diagram and data dictionary here.

For every table, document:
- Purpose and owning module/member
- Columns and data types
- Primary key and foreign keys
- Unique constraints and indexes
- Relationships and deletion behavior

Shared rules:
- Use one `users` table owned by the core-platform module.
- Reference the shared user primary key from module tables where needed.
- Discuss and review schema changes before merging them.
- Use Flask-Migrate/Alembic migrations for ongoing schema changes.
