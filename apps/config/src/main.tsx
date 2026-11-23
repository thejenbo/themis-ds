import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
// The design system's base stylesheet (its box-sizing reset), imported directly as an app using the package would
// (themis-ds/styles.css). The package's barrel imports it too, but a production build skips the barrel, so it was
// left out and fields came out taller.
import '../../../src/styles/base.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
