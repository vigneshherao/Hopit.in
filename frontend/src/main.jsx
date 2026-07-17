import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProviders } from '@/context/AppProviders.jsx';
import { router } from '@/routes/router.jsx';
import { queryClient } from '@/services/queryClient.js';
import 'leaflet/dist/leaflet.css';
import '@/assets/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </QueryClientProvider>
  </React.StrictMode>,
);
