import React from "react";
import { STRINGS } from "../../../consts/text-strings";

export default function UploadStage({ file, onUpload }) {
  function change(e) {
    const img = e.target.files[0];

    if (img) {
      onUpload(img);
    }
  }

  return (
    <div className="card">
      <h2>{STRINGS.UPLOAD_SCREEN_TEXT}</h2>

      <input type="file" accept="image/*" onChange={change} />
    </div>
  );
}
