-- Удаляем старое уникальное ограничение по file_key
ALTER TABLE t_p72229687_scanning_audio_app.audio_files 
DROP CONSTRAINT IF EXISTS audio_files_file_key_key;