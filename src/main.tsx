// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './cursors.css';
import './transitions.css';
import './particleSystem';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
