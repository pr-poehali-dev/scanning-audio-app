-- Add unique constraint for user_id + file_key to prevent duplicates
ALTER TABLE t_p72229687_scanning_audio_app.audio_files
ADD CONSTRAINT unique_user_file_key UNIQUE (user_id, file_key);
