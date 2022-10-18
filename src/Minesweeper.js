import { useState } from "react";

// courtesy of Fisher-Yates
const shuffleArray = (arr) => {
  let m = arr.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
  return arr;
}

const getIndexFromCoords = (x, y, width) => {
  return (y * width) + x;
}
const getCoordsFromIndex = (index, width) => {
  return {
    x: index % width,
    y: Math.floor(index / width),
  }
}

const countMines = (index, width, arr) => {
  let mineCount = 0;
  if (arr[index] === '-1') {
    return '-1';
  }
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (arr[getIndexFromCoords(x + i, y + j, 10)] === '-1') {
        mineCount++;
      }
    }
  }
  return mineCount;
}

const generateGrid = (width, height, mineCount) => {
  let grid = new Array(width * height).fill('0');
  for (let i = 0; i < Math.min(width * height, mineCount); i++) {
    grid[i] = '-1';
  }
  shuffleArray(grid);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== '-1') {
      grid[i] = countMines(i, width, grid);
    }
  };

  grid = grid.map((tile, index) => {
    return {
      value: tile,
      flagged: false,
      exposed: false,
      index
    }
  });
  return grid;
}

const handleClick = (e, index, grid, setGrid) => {
  const newGrid = grid.slice();
  const tile = {...grid[index]};
  tile.flagged = false;
  tile.exposed = true;
  newGrid[index] = tile;
  setGrid(newGrid);
}
const handleRightClick = (e, index, grid, setGrid) => {
  e.preventDefault();
  const newGrid = grid.slice();
  const tile = {...grid[index]};
  if (!tile.exposed) {
    tile.flagged = !tile.flagged;
  }
  newGrid[index] = tile;
  setGrid(newGrid);
}

export default function Minesweeper() {
  const [grid, setGrid] = useState(generateGrid(10, 10, 10));
  const squares = grid.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid)}
      onContextMenu={(e, index) => handleRightClick(e, index, grid, setGrid)}
    />
  });
  const rows = [];
  for (let i = 0; i < 10; i++) {
    rows.push(<div className="row" key={i}>{squares.slice(i * 10, (i + 1) * 10)}</div>);;
  }
  return (
    <div>
      <h1>Minesweeper!</h1>
      <div className="game-container">
        {rows}
      </div>
    </div>
  )
}

function Tile(props) {
  let classes = 'tile';
  if (!props.exposed) {
    classes += ' unseen';
    if (props.flagged) {
      classes += ' flagged';
    }
  } else if (props.value > 0) {
    classes += ` mines-${props.value}`;
  }
  return <div
    className={classes}
    onContextMenu={(e) => props.onContextMenu(e, props.index)}
    onClick={(e) => props.onClick(e, props.index)}
    >
      {props.value !== 0 ? props.value : ''}
    </div>
}