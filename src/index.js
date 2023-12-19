import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Minesweeper from './Minesweeper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Minesweeper
      width={21}
      height={15}
      mineCount={25}
      shouldAutoplay={false}
      interval={100}
      guaranteedSolvable={true}
      shape={'octagon-and-square'}
    />
  </React.StrictMode>
);
