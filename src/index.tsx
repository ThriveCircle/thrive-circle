import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './app';
import { worker } from './mocks/browser';

// Start MSW in development
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('thrive_circle running with mock API');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
