import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import "./app/styles/global.css";
import "./app/styles/variables.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);