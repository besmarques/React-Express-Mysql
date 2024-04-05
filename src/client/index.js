import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './layout';
import { ThemeProvider } from '@mui/material/styles';
import Original from './theme/original';



const root = document.getElementById('root');
if (root !== null) {
  const appRoot = ReactDOM.createRoot(root);
  appRoot.render(
    <React.StrictMode>
      <ThemeProvider theme={Original}>
        <Layout />
      </ThemeProvider>
    </React.StrictMode>
  );
}