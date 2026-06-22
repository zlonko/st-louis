import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/scrollytelling.css';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
