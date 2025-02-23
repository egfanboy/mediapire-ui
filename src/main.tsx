import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { App } from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'violet',
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
