import React, { useState } from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";

export default function UploadStage({ file, onUpload }) {
  const [preview, setPreview] = useState(
    file ? URL.createObjectURL(file) : null
  );
  const [dragging, setDragging] = useState(false);
  const [img, setImg] = useState(null);

  function handleFile(img) {
    if (!img || !img.type.startsWith("image/")) return;
    setImg(img);
    const url = URL.createObjectURL(img);
    setPreview(url);
  }

  function change(e) {
    const img = e.target.files?.[0];
    handleFile(img);
  }

  function drop(e) {
    e.preventDefault();
    setDragging(false);

    const img = e.dataTransfer.files?.[0];
    handleFile(img);
  }

  function dragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function dragLeave() {
    setDragging(false);
  }

  return (
    <>
      <h2>{STRINGS.UPLOAD_SCREEN_TEXT}</h2>

      <GlassCard>
        <label
          onDrop={drop}
          onDragOver={dragOver}
          onDragLeave={dragLeave}
          style={{
            width: "100%",
            minHeight: 260,
            borderRadius: 20,
            border: dragging
              ? "2px solid #c8a8e8"
              : "2px dashed rgba(255,255,255,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            transition: "0.2s",
            background: dragging
              ? "rgba(200,168,232,0.15)"
              : "rgba(255,255,255,0.05)",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{
                width: "100%",
                height: 260,
                objectFit: "cover",
                borderRadius: 18,
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: 40 }}>🖼️</div>

              <p>Drag image here</p>

              <span
                style={{
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                or click to browse
              </span>
            </>
          )}

          <input type="file" accept="image/*" onChange={change} hidden />
        </label>
      </GlassCard>

     {preview && <GlassButton onClick={() => onUpload(img)}>
        {STRINGS.PROCEED}
      </GlassButton>}
    </>
  );
}
