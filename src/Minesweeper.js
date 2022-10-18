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

const getIndexFromCoords = (x, y, width, height) => {
  return coordsAreValid(x, y, width, height) ? (y * width) + x : -1;
}
const getCoordsFromIndex = (index, width) => {
  return {
    x: index % width,
    y: Math.floor(index / width),
  }
}

const countMines = (index, width, arr) => {
  let mineCount = 0;
  if (arr[index] === -1) {
    return -1;
  }
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      const index = getIndexFromCoords(x + i, y + j, 10, 10);
      if (index !== -1 && arr[index] === -1) {
        mineCount++;
      }
    }
  }
  return mineCount;
}

const coordsAreValid = (x, y, width, height) => {
  return (x >= 0 && y >= 0 && x < width && y < height);
}

const generateGrid = (width, height, mineCount) => {
  let grid = new Array(width * height).fill(0);
  for (let i = 0; i < Math.min(width * height, mineCount); i++) {
    grid[i] = -1;
  }
  shuffleArray(grid);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== -1) {
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

const countFlagsAroundIndex = (index, grid, width, height) => {
  let flagCount = 0;
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) { 
    for (let j = -1; j < 2; j++) {
      const x2 = x + i;
      const y2 = y + j;
      if (coordsAreValid(x2, y2, width, height)) {
        const index2 = getIndexFromCoords(x2, y2, width, height);
        if (grid[index2].flagged) {
          flagCount++;
        }
      }
    }
  }
  return flagCount;
}

const showTile = (index, grid, width, height) => {
  const tile = {...grid[index]};
  tile.flagged = false;
  tile.exposed = true;
  grid[index] = tile;
  if (tile.value === 0) {
    const {x, y} = getCoordsFromIndex(index, width);
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const x2 = x + i;
        const y2 = y + j;
        if (coordsAreValid(x2, y2, width, height)) {
          const index2 = getIndexFromCoords(x2, y2, width, height)
          if (!grid[index2].exposed) {
            showTile(index2, grid, width, height);
          }
        }
      }
    }
  }
}

const showNeighbors = (index, grid, width, height) => {
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      const x2 = x + i;
      const y2 = y + j;
      if (coordsAreValid(x2, y2, width, height)) {
        const index2 = getIndexFromCoords(x2, y2, width, height);
        if (!grid[index2].exposed && !grid[index2].flagged) {
          showTile(index2, grid, width, height);
        }
      }
    }
  }
}

const handleClick = (e, index, grid, setGrid, width, height) => {
  if (!grid[index].exposed && !grid[index].flagged) {
    const newGrid = grid.slice();
    showTile(index, newGrid, width, height);
    setGrid(newGrid);
  } else if (e.buttons === 2 && grid[index].exposed && grid[index].value === countFlagsAroundIndex(index, grid, width, height)) {
    const newGrid = grid.slice();
    showNeighbors(index, newGrid, width, height);
    setGrid(newGrid);
  }
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
  const width = 10;
  const height = 10;
  const [grid, setGrid] = useState(() => {
    return generateGrid(width, height, 10);
  });
  const squares = grid.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid, width, height)}
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