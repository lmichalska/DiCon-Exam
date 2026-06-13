import React from "react";

export default function Pagination({ stages, currentStage, onChange }) {
  return (
    <div className="pagination">
      {stages.map((stage, index) => {
        const isActive = stage === currentStage;

        return (
          <button
            key={stage}
            className={`indicator ${isActive ? "active" : ""}`}
            onClick={() => onChange(stage)}
          />
        );
      })}
    </div>
  );
}
