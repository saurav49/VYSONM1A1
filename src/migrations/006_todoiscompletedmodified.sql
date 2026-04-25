CREATE type status_types AS ENUM ('pending', 'in_progress', 'completed');

ALTER TABLE todos
ADD COLUMN status status_types DEFAULT 'pending';

UPDATE todos
SET status = CASE
    WHEN is_completed = TRUE THEN 'completed'::status_types
    WHEN is_completed = FALSE THEN 'pending'::status_types
END;

ALTER TABLE todos
DROP COLUMN is_completed;