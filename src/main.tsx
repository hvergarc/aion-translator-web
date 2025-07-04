import React from 'react';
import ReactDOM from 'react-dom/client';
import { Translator } from './components/Translator';
import './index.css'; // 👈 Agrega esta línea

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Translator />
  </React.StrictMode>
);
