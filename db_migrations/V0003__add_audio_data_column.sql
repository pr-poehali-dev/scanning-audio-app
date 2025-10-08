-- Add column for storing base64 audio data
ALTER TABLE t_p72229687_scanning_audio_app.audio_files 
ADD COLUMN IF NOT EXISTS file_data TEXT;

-- Add user_id column for multi-user support
ALTER TABLE t_p72229687_scanning_audio_app.audio_files 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) DEFAULT 'default';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audio_files_user_key 
ON t_p72229687_scanning_audio_app.audio_files(user_id, file_key);
