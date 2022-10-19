import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Minesweeper from './Minesweeper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Minesweeper
      width={18}
      height={14}
      mineCount={40}
    />
  </React.StrictMode>
);
