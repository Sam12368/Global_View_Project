import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppLayout } from './components/Layout/AppLayout';
import './index.css';

function AppContent() {
  return <AppLayout />;
}

export function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;