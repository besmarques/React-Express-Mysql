import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './layout';



const root = document.getElementById('root');
if (root !== null) {
  const appRoot = ReactDOM.createRoot(root);
  appRoot.render(
    <React.StrictMode>
      <Layout />
    </React.StrictMode>
  );
}