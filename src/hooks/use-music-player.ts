import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Track {
  id: string;
  name: string;
  url: string;
  storagePath: string;
}

const MUSIC_BUCKET = "music-tracks";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function useMusicPlayer() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<Track[]>([]);
  const currentTrackIndexRef = useRef(-1);
  const playTrackAtIndexRef = useRef<(index: number) => Promise<void>>(async () => {});

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const getSignedUrl = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage
      .from(MUSIC_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error) return null;
    return data.signedUrl;
  }, []);

  const loadTrack = useCallback(async (index: number) => {
    if (!audioRef.current || index < 0 || index >= tracks.length) return false;

    const nextTrack = tracks[index];
    const signedUrl = await getSignedUrl(nextTrack.storagePath);
    if (!signedUrl) return false;

    const audio = audioRef.current;
    audio.src = signedUrl;
    audio.load();
    setCurrentTrackIndex(index);

    if (signedUrl !== nextTrack.url) {
      setTracks((prev) =>
        prev.map((track, i) => (i === index ? { ...track, url: signedUrl } : track))
      );
    }

    return true;
  }, [tracks, getSignedUrl]);

  const playTrackAtIndex = useCallback(async (index: number) => {
    const loaded = await loadTrack(index);
    if (!loaded || !audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [loadTrack]);

  useEffect(() => {
    playTrackAtIndexRef.current = playTrackAtIndex;
  }, [playTrackAtIndex]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      const queuedTracks = tracksRef.current;
      if (!queuedTracks.length) {
        setIsPlaying(false);
        return;
      }

      const nextIndex = (currentTrackIndexRef.current + 1) % queuedTracks.length;
      void playTrackAtIndexRef.current(nextIndex);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSavedTracks = async () => {
      if (!user) {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.src = "";
        }

        if (isMounted) {
          setTracks([]);
          setCurrentTrackIndex(-1);
          setIsPlaying(false);
          setProgress(0);
          setDuration(0);
        }
        return;
      }

      const { data, error } = await supabase
        .from("music_tracks")
        .select("id, name, file_path, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error || !isMounted) return;

      const signedTracks = await Promise.all(
        data.map(async (track) => {
          const signedUrl = await getSignedUrl(track.file_path);
          if (!signedUrl) return null;

          return {
            id: track.id,
            name: track.name,
            url: signedUrl,
            storagePath: track.file_path,
          } satisfies Track;
        })
      );

      if (!isMounted) return;

      setTracks(signedTracks.filter((track): track is Track => Boolean(track)));
      setCurrentTrackIndex(-1);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
    };

    void loadSavedTracks();

    return () => {
      isMounted = false;
    };
  }, [user?.id, getSignedUrl]);

  const play = useCallback(() => {
    if (!audioRef.current || tracks.length === 0) return;

    if (currentTrackIndex === -1) {
      void playTrackAtIndex(0);
      return;
    }

    void audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentTrackIndex, tracks.length, playTrackAtIndex]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    if (tracks.length === 0) return;

    const nextIndex = (currentTrackIndex + 1 + tracks.length) % tracks.length;
    void playTrackAtIndex(nextIndex);
  }, [currentTrackIndex, tracks.length, playTrackAtIndex]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;

    const prevIndex = currentTrackIndex <= 0 ? tracks.length - 1 : currentTrackIndex - 1;
    void playTrackAtIndex(prevIndex);
  }, [currentTrackIndex, tracks.length, playTrackAtIndex]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const addTracks = useCallback(async (files: FileList) => {
    if (!user) return;

    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) return;

    const persistedTracks = await Promise.all(
      audioFiles.map(async (file) => {
        const extension = file.name.split(".").pop() || "mp3";
        const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(MUSIC_BUCKET)
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        if (uploadError) return null;

        const trackName = file.name.replace(/\.[^/.]+$/, "");
        const { data: savedTrack, error: insertError } = await supabase
          .from("music_tracks")
          .insert({
            user_id: user.id,
            name: trackName,
            file_path: storagePath,
          })
          .select("id, name, file_path")
          .single();

        if (insertError || !savedTrack) {
          await supabase.storage.from(MUSIC_BUCKET).remove([storagePath]);
          return null;
        }

        const signedUrl = await getSignedUrl(storagePath);
        if (!signedUrl) return null;

        return {
          id: savedTrack.id,
          name: savedTrack.name,
          url: signedUrl,
          storagePath: savedTrack.file_path,
        } satisfies Track;
      })
    );

    const validTracks = persistedTracks.filter((track): track is Track => Boolean(track));
    if (validTracks.length === 0) return;

    setTracks((prev) => [...prev, ...validTracks]);
  }, [user, getSignedUrl]);

  const removeTrack = useCallback(async (id: string) => {
    if (!user) return;

    const trackToRemove = tracks.find((track) => track.id === id);
    if (!trackToRemove) return;

    const removedIndex = tracks.findIndex((track) => track.id === id);

    const { error: deleteError } = await supabase
      .from("music_tracks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) return;

    await supabase.storage.from(MUSIC_BUCKET).remove([trackToRemove.storagePath]);

    if (removedIndex === currentTrackIndex) {
      stop();
      setCurrentTrackIndex(-1);
    } else if (removedIndex >= 0 && removedIndex < currentTrackIndex) {
      setCurrentTrackIndex((idx) => idx - 1);
    }

    setTracks((prev) => prev.filter((track) => track.id !== id));
  }, [user, tracks, currentTrackIndex, stop]);

  const playTrack = useCallback((index: number) => {
    void playTrackAtIndex(index);
  }, [playTrackAtIndex]);

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;

  return {
    tracks, currentTrack, currentTrackIndex, isPlaying, progress, duration,
    play, pause, stop, next, prev, seek, addTracks, removeTrack, playTrack,
  };
}
