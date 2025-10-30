import React from 'react';
import ReactDOM from 'react-dom/client';
import ProgressiveApp from './components/ProgressiveApp';
import './index.css';
import { ScrollProgressProvider } from './contexts/ScrollProgressContext';
import { SoundProvider } from './contexts/SoundContext';
import { SceneProvider } from './contexts/SceneContext';
import { serviceWorkerManager } from './utils/ServiceWorkerManager';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnoisseursPage from './pages/ConnoisseursPage';

// Stable mobile viewport height: lock to initial visible height to avoid jump when URL bar hides/shows
function setStableAppHeight() {
  const h = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', h + 'px');
}

// Only set once at start plus on orientation change / resize that is a real dimension change
setStableAppHeight();
let lastHeight = window.innerHeight;
window.addEventListener('resize', () => {
  // Ignore minor resize events triggered by UI chrome show/hide causing small fluctuations
  const current = window.innerHeight;
  if (Math.abs(current - lastHeight) > 80) { // threshold
    lastHeight = current;
    setStableAppHeight();
  }
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    lastHeight = window.innerHeight;
    setStableAppHeight();
  }, 300);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollProgressProvider>
        <SoundProvider>
          <SceneProvider>
            <Routes>
              <Route path="/" element={<ProgressiveApp />} />
              <Route path="/connoisseurs" element={<ConnoisseursPage />} />
            </Routes>
          </SceneProvider>
        </SoundProvider>
      </ScrollProgressProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register Service Worker only in production to avoid dev navigation issues
if (import.meta && import.meta.env && import.meta.env.PROD) {
  serviceWorkerManager.register().then((success) => {
    if (success) {
      console.log('✅ [Main] Service Worker registered successfully');
    } else {
      console.warn('⚠️ [Main] Service Worker registration failed');
    }
  }).catch((error) => {
    console.error('❌ [Main] Service Worker registration error:', error);
  });
}
