import React from "react";

export default function Pagination({ stages, currentStage, onChange }) {
  return (
    <div className="pagination">
      {stages.map((stage, index) => {
        const isActive = stage === currentStage;
        const disabled = index > stages.indexOf(currentStage) || index === 3;

        return (
          <button
            key={stage}
            className={`indicator ${isActive ? "active" : ""} ${disabled ? "disabled" : ""}`}
            onClick={() => onChange(stage)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
