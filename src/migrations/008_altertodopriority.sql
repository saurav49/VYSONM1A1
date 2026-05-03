ALTER TABLE todos
ADD COLUMN priority INTEGER DEFAULT 0;

ALTER TABLE todos
ADD CONSTRAINT chk_priority
CHECK (priority IN (0, 1, 2));