-- Persist user-uploaded songs
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, file_path)
);

ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_music_tracks_user_created_at
  ON public.music_tracks (user_id, created_at DESC);

DROP POLICY IF EXISTS "Users can view own music tracks" ON public.music_tracks;
CREATE POLICY "Users can view own music tracks"
ON public.music_tracks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own music tracks" ON public.music_tracks;
CREATE POLICY "Users can insert own music tracks"
ON public.music_tracks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own music tracks" ON public.music_tracks;
CREATE POLICY "Users can delete own music tracks"
ON public.music_tracks
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own music tracks" ON public.music_tracks;
CREATE POLICY "Users can update own music tracks"
ON public.music_tracks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Private bucket for uploaded audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-tracks', 'music-tracks', false)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Users can view own music files" ON storage.objects;
CREATE POLICY "Users can view own music files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'music-tracks'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload own music files" ON storage.objects;
CREATE POLICY "Users can upload own music files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music-tracks'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own music files" ON storage.objects;
CREATE POLICY "Users can update own music files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'music-tracks'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'music-tracks'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own music files" ON storage.objects;
CREATE POLICY "Users can delete own music files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'music-tracks'
  AND auth.uid()::text = (storage.foldername(name))[1]
);