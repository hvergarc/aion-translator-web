import React from 'react';
import ReactDOM from 'react-dom/client';
import { Translator } from './components/Translator';
import './index.css'; // 👈 Agrega esta línea

import LandingPage from './components/LandingPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);
