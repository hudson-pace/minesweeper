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

const countMines = (index, width, height, arr) => {
  let mineCount = 0;
  if (arr[index].value === -1) {
    return -1;
  }
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      const index = getIndexFromCoords(x + i, y + j, width, height);
      if (index !== -1 && arr[index].value === -1) {
        mineCount++;
      }
    }
  }
  return mineCount;
}

const coordsAreValid = (x, y, width, height) => {
  return (x >= 0 && y >= 0 && x < width && y < height);
}

const updateMineCounts = (grid, width, height) => {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].value !== -1) {
      grid[i] = {
        ...grid[i],
        value: countMines(i, width, height, grid),
      }
    }
  }
}

const generateGrid = (width, height, mineCount) => {
  let grid = new Array(width * height).fill(0);
  grid = grid.map((value) => { return { value }})
  for (let i = 0; i < Math.min(width * height, mineCount); i++) {
    grid[i].value = -1;
  }
  shuffleArray(grid);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].value !== -1) {
      grid[i].value = countMines(i, width, height, grid);
    }
  }

  grid = grid.map((tile, index) => {
    return {
      value: tile.value,
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

const findValidEmptyTile = (x, y, width, height, grid) => {
  let candidateIndex;
  let valid;
  let dx;
  let dy;
  const length = width * height;
  do {
    candidateIndex = Math.floor(Math.random() * length);
    const {x: x2, y: y2} = getCoordsFromIndex(candidateIndex, width);
    valid = coordsAreValid(x2, y2, width, height);
    dx = Math.abs(x2 - x);
    dy = Math.abs(y2 - y);
  } while (!valid || dx < 2 || dy < 2 || grid[candidateIndex].value === -1);
  return candidateIndex;
}

const clearMinesAroundTile = (index, grid, width, height) => {
  const {x, y} = getCoordsFromIndex(index, width);
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      const x2 = x + i;
      const y2 = y + j;
      if (coordsAreValid(x2, y2, width, height)) {
        const index2 = getIndexFromCoords(x2, y2, width, height);
        if (grid[index2].value === -1) {
          const newIndex = findValidEmptyTile(x, y, width, height, grid);
          const temp = grid[index2];
          grid[index2] = {...grid[newIndex], index: index2};
          grid[newIndex] = {...temp, index: newIndex};
        }
      }
    }
  }
  updateMineCounts(grid, width, height);
}

const handleClick = (e, index, grid, setGrid, width, height, firstClick, setFirstClick) => {
  const newGrid = grid.slice();
  if (firstClick) {
    setFirstClick(false);
    if (newGrid[index].value !== 0) {
      clearMinesAroundTile(index, newGrid, width, height);
    }
  }
  if (!newGrid[index].exposed && !newGrid[index].flagged) {
    showTile(index, newGrid, width, height);
  } else if (e.buttons === 2 && newGrid[index].exposed && newGrid[index].value === countFlagsAroundIndex(index, newGrid, width, height)) {
    showNeighbors(index, newGrid, width, height);
  }
  setGrid(newGrid);
}
const handleRightClick = (e, index, grid, setGrid, flagCount, setFlagCount) => {
  e.preventDefault();
  
  if ((flagCount > 0 || grid[index].flagged) && !grid[index].exposed) {
    const newGrid = grid.slice();
    const tile = {...grid[index]};
    const newCount = flagCount + (tile.flagged ? 1 : -1);
    tile.flagged = !tile.flagged;
    newGrid[index] = tile;
    setGrid(newGrid);
    setFlagCount(newCount);
  }
}

export default function Minesweeper() {
  const width = 18; // 10;
  const height = 14; // 10;
  const mineCount = 40; // 10;
  const [grid, setGrid] = useState(() => {
    return generateGrid(width, height, mineCount);
  });
  const [firstClick, setFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(mineCount);

  const squares = grid.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid, width, height, firstClick, setFirstClick)}
      onContextMenu={(e, index) => handleRightClick(e, index, grid, setGrid, flagCount, setFlagCount)}
    />
  });
  const rows = [];
  for (let i = 0; i < width; i++) {
    rows.push(<div className="row" key={i}>{squares.slice(i * width, (i + 1) * width)}</div>);;
  }
  return (
    <div>
      <h1>Minesweeper!</h1>
      <div className="game-container">
        {rows}
      </div>
      <div>
        Flags: {flagCount}
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