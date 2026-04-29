// ============================================================
// VOIX — Video Uploader
// Drag-and-drop video upload with preview
// ============================================================

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, X, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  onUpload: (url: string) => void;
  accentColor: string;
  borderRadius: number;
}

export function VideoUploader({ onUpload, accentColor, borderRadius }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleFile(file);
    }
  }, []);

  const handleFile = async (file: File) => {
    setIsUploading(true);

    // Créer une preview locale
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      // Upload vers Supabase Storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", `testimonials/${Date.now()}-${file.name}`);

      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setVideoUrl(data.url);
      onUpload(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setVideoUrl("");
    setPreviewUrl("");
    onUpload("");
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!videoUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-opacity-100 bg-opacity-5"
                : "border-opacity-20 hover:border-opacity-40"
            }`}
            style={{
              borderRadius,
              borderColor: isDragging ? accentColor : "currentColor",
              backgroundColor: isDragging ? accentColor + "10" : "transparent",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-3">
                <Loader2
                  className="w-10 h-10 mx-auto animate-spin"
                  style={{ color: accentColor }}
                />
                <p className="text-sm opacity-60">Upload en cours...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: accentColor + "15" }}
                >
                  <Video className="w-7 h-7" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="font-medium">Glissez-déposez une vidéo</p>
                  <p className="text-sm opacity-40 mt-1">
                    ou cliquez pour sélectionner
                  </p>
                </div>
                <p className="text-xs opacity-30">MP4, MOV, WebM — Max 50MB</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-black/5"
            style={{ borderRadius }}
          >
            <video
              src={previewUrl || videoUrl}
              controls
              className="w-full aspect-video object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                style={{
                  backgroundColor: accentColor + "20",
                  color: accentColor,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Uploadé
              </div>
              <button
                onClick={handleRemove}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
