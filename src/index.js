import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Minesweeper from './Minesweeper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Minesweeper
      width={10}
      height={10}
      mineCount={10}
      shouldAutoplay={false}
      guaranteedSolvable={true}
      shape={'hexagon'}
    />
  </React.StrictMode>
);
