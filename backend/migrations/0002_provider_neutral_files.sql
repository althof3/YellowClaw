DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'files'
      AND column_name = 'openai_file_id'
  ) THEN
    ALTER TABLE files RENAME COLUMN openai_file_id TO provider_file_id;
  END IF;
END $$;

ALTER TABLE files
  ALTER COLUMN provider_file_id DROP NOT NULL;

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS content_text TEXT NOT NULL DEFAULT '';
