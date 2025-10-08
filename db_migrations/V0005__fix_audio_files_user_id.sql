-- Обновляем поле user_id чтобы оно было NOT NULL
UPDATE t_p72229687_scanning_audio_app.audio_files 
SET user_id = 'default' 
WHERE user_id IS NULL;

ALTER TABLE t_p72229687_scanning_audio_app.audio_files 
ALTER COLUMN user_id SET NOT NULL;