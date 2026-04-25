UPDATE todos
SET due_date = created_at + INTERVAL '7 days'
WHERE due_date IS NULL;

ALTER TABLE todos
ALTER COLUMN due_date SET DEFAULT (NOW() + INTERVAL '7 days');