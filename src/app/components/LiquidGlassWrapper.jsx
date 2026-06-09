import React from 'react';
import '../styles/liquidGlass.css';

export function GlassCard({ children = null, className = '', ...props }) {
  return (
    <div className={`liquid-glass glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function GlassButton({ children = null, className = '', ...props }) {
  return (
    <button className={`liquid-glass glass-btn ${className}`} {...props}>
      {children}
    </button>
  );
}