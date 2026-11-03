import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { FarmProvider } from './context/FarmContext.jsx';
import './styles/theme.css';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FarmProvider>
      <App />
    </FarmProvider>
  </React.StrictMode>
);
