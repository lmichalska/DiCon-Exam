import React, { useRef, useState, useCallback } from "react";
import { imageFileToNotes } from "../functions/utils";

export default function UploadScreen({ onMelodyGenerated }) {
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelected = useCallback(
    (file) => {
      if (!file?.type.startsWith("image/")) return;
      setPendingFile(file);
      setGenError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [previewUrl]
  );

  const handleInputChange = useCallback(
    (e) => handleFileSelected(e.target.files[0]),
    [handleFileSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelected(e.dataTransfer.files[0]);
    },
    [handleFileSelected]
  );

  const handleGenerate = useCallback(async () => {
    if (!pendingFile) return;
    setGenerating(true);
    setGenError(null);
    try {
      console.log("starting generate for file:", pendingFile);
      const { notes, mood } = await imageFileToNotes(pendingFile, 64);
      console.log("imageFileToNotes -> notes:", notes?.length, "mood:", mood);
      if (!notes || notes.length === 0) {
        setGenError("No notes generated from image");
        return;
      }
      onMelodyGenerated(notes, mood);
    } catch (err) {
      console.error("imageFileToNotes failed:", err);
      setGenError("Failed: " + (err?.message || String(err)));
    } finally {
      setGenerating(false);
    }
  }, [pendingFile, onMelodyGenerated]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        color: "#e8e0f0",
        fontFamily: "'Georgia', serif",
        padding: "24px 18px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <div style={{ maxWidth: 860, width: "100%" }}>
        {/* Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          style={{
            border: `1.5px dashed ${isDragging ? "#a87fd4" : previewUrl ? "#3a2a5e" : "#2a1a4e"}`,
            borderRadius: 12,
            cursor: previewUrl ? "default" : "pointer",
            background: isDragging ? "rgba(168,127,212,0.05)" : "rgba(255,255,255,0.012)",
            marginBottom: 14,
            overflow: "hidden",
            transition: "border-color 0.2s",
            padding: previewUrl ? 0 : "32px 24px",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
          {previewUrl ? (
            <div style={{ position: "relative" }}>
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: 190,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom,transparent 50%,rgba(9,9,26,0.92))",
                  pointerEvents: "none",
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{
                  position: "absolute",
                  bottom: 9,
                  right: 11,
                  background: "rgba(9,9,26,0.7)",
                  border: "1px solid #3a2a5e",
                  color: "rgba(200,168,232,0.75)",
                  fontSize: 10,
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                change image
              </button>
            </div>
          ) : (
            <div style={{  color: "#3a2a4e",textAlign: "center" }}>
              <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 9 }}>♪</div>
              <p style={{ margin: 0, color: "#5a4a6a", fontSize: 14 }}>
                drop an image or click to upload
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11 }}>
                png · jpg · gif · webp
              </p>
            </div>
          )}
        </div>

        {/* Generate button */}
        {pendingFile && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
              marginBottom: 22,
            }}
          >
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                background: generating ? "rgba(122,79,176,0.25)" : "#7a4fb0",
                color: generating ? "#a87fd4" : "#fff",
                border: "none",
                borderRadius: 10,
                padding: "13px 40px",
                fontSize: 14,
                cursor: generating ? "default" : "pointer",
                letterSpacing: "0.09em",
                fontFamily: "inherit",
                transition: "all 0.15s",
                boxShadow: generating ? "none" : "0 4px 22px rgba(122,79,176,0.45)",
              }}
            >
              {generating ? "analysing image…" : "✦  generate melody"}
            </button>
            {genError && <p style={{ fontSize: 11, color: "#d47e7e", margin: 0 }}>{genError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
