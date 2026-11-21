import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

import { ClientLayout } from './components/client/ClientLayout';
import { ClientHomePage } from './pages/client/ClientHomePage';
import { ClientBusesPage } from './pages/client/ClientBusesPage';
import { ClientSuggestRoutePage } from './pages/client/ClientSuggestRoutePage';
import { ClientDepotsPage } from './pages/client/ClientDepotsPage';
import { ClientRouteStopsPage } from './pages/client/ClientRouteStopsPage';
import { ContributePage } from './pages/client/ContributePage';

export function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<ClientHomePage />} />
          <Route path="buses" element={<ClientBusesPage />} />
          <Route path="suggest" element={<ClientSuggestRoutePage />} />
          <Route path="contribute" element={<ContributePage />} />
          <Route path="depots" element={<ClientDepotsPage />} />
          <Route path="bus/:busId/stops" element={<ClientRouteStopsPage />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default App;

