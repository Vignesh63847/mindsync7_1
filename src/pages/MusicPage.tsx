import { useRef } from "react";
import { useMusicPlayerContext } from "@/contexts/MusicPlayerContext";
import { Play, Pause, SkipBack, SkipForward, Square, Upload, Trash2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function MusicPage() {
  const {
    tracks, currentTrack, currentTrackIndex, isPlaying, progress, duration,
    play, pause, stop, next, prev, seek, addTracks, removeTrack, playTrack,
  } = useMusicPlayerContext();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="gradient-text">Music</span> Therapy
          </h1>
          <p className="text-muted-foreground text-sm">Upload your songs and listen while you chat</p>
        </motion.div>

        {/* Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6 glow-border"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Music className={`w-10 h-10 text-primary ${isPlaying ? "animate-pulse-glow" : ""}`} />
            </div>
            <h3 className="font-display font-semibold text-lg truncate">
              {currentTrack?.name || "No track selected"}
            </h3>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={([v]) => seek(v)}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="icon" onClick={prev} disabled={tracks.length === 0}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="hero"
              size="icon"
              className="w-14 h-14 rounded-full"
              onClick={isPlaying ? pause : play}
              disabled={tracks.length === 0}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={next} disabled={tracks.length === 0}>
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={stop} disabled={tracks.length === 0}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Upload */}
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            if (!e.target.files) return;
            await addTracks(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          variant="hero-outline"
          className="w-full mb-6"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Songs
        </Button>

        {/* Playlist */}
        <div className="space-y-2">
          <AnimatePresence>
            {tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  i === currentTrackIndex
                    ? "glass glow-border"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => playTrack(i)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {i === currentTrackIndex && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4">
                      <span className="w-1 bg-primary rounded-full animate-bounce h-2" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 bg-primary rounded-full animate-bounce h-3" style={{ animationDelay: "100ms" }} />
                      <span className="w-1 bg-primary rounded-full animate-bounce h-4" style={{ animationDelay: "200ms" }} />
                    </div>
                  ) : (
                    <Music className="w-5 h-5 text-primary/50" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium truncate">{track.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tracks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No songs yet. Upload MP3s to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
