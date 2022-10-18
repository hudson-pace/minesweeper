import { useState } from "react";

const GameState = {
  Lost: 'Lost',
  Won: 'Won',
  InProgress: 'InProgress',
};

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

// Given a grid and an index, return a list of valid indices within the given radius.
// **includes tile at the given index**
const getIndexListAroundTile = (index, width, height, radius) => {
  const effectiveRadius = radius - 1;
  const {x, y} = getCoordsFromIndex(index, width);
  const coordList = [];
  for (let i = 0 - effectiveRadius; i <= 0 + effectiveRadius; i++) {
    for (let j = 0 - effectiveRadius; j <= 0 + effectiveRadius; j++) {
      const x2 = x + i;
      const y2 = y + j;
      if (coordsAreValid(x2, y2, width, height)) {
        coordList.push(getIndexFromCoords(x2, y2, width, height));
      }
    }
  }
  return coordList;
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

const countMines = (index, width, height, grid) => {
  let mineCount = 0;
  if (grid[index].value === -1) {
    return 1;
  }
  getIndexListAroundTile(index, width, height, 2).forEach((i) => {
    if (i !== -1 && grid[i].value === -1) {
      mineCount++;
    }
  });
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
  grid = grid.map((value) => { return { value }});
  for (let i = 0; i < Math.min(width * height, mineCount); i++) {
    grid[i].value = -1;
  }
  shuffleArray(grid);

  grid = grid.map((tile, index) => {
    return {
      ...tile,
      flagged: false,
      exposed: false,
      index
    }
  });
  return grid;
}

const countFlagsAroundIndex = (index, grid, width, height) => {
  let flagCount = 0;

  getIndexListAroundTile(index, width, height, 2).forEach((i) => {
    if (grid[i].flagged) {
      flagCount++;
    }
  });

  return flagCount;
}

const showTile = (index, grid, width, height) => {
  const tile = {...grid[index]};
  tile.exposed = true;
  grid[index] = tile;
  if (tile.value === 0) {
    getIndexListAroundTile(index, width, height, 2).forEach((i) => {
      if (!grid[i].exposed && !grid[i].flagged) {
        showTile(i, grid, width, height);
      }
    });
  }
}

const showNeighbors = (index, grid, width, height) => {
  getIndexListAroundTile(index, width, height, 2).forEach((i) => {
    if (!grid[i].exposed && !grid[i].flagged) {
      showTile(i, grid, width, height);
    }
  });
}

const getRandomTile = (width, height) => {
  return Math.floor(Math.random() * width * height);
}

// returns an empty tile that is not within the provided list of indices.
const findValidEmptyTile = (width, height, grid, protectedIndices = []) => {
  let candidateIndex;
  do {
    candidateIndex = getRandomTile(width, height);
  } while (grid[candidateIndex].value === -1 || protectedIndices.includes(candidateIndex));
  return candidateIndex;
}

const clearMinesAroundTile = (index, grid, width, height) => {
  const indices = getIndexListAroundTile(index, width, height, 2);
  indices.forEach((i) => {
    if (grid[i].value === -1) {
      const newIndex = findValidEmptyTile(width, height, grid, indices);
      const temp = grid[i];
      grid[i] = {...grid[newIndex], index: i};
      grid[newIndex] = {...temp, index: newIndex};
    }
  });
}

const checkForWin = (grid, setGameState) => {
  let win = true;
  for (const tile of grid) {
    if (tile.value === -1 && tile.exposed) {
      setGameState(GameState.Lost);
    } else if (tile.value !== -1 && !tile.exposed) {
      win = false;
    }
  }
  if (win) {
    setGameState(GameState.Won);
  }
}

const handleClick = (e, index, grid, setGrid, width, height, firstClick, setFirstClick, gameState, setGameState) => {
  if (gameState !== GameState.InProgress) return;
  const newGrid = grid.slice();
  if (firstClick) {
    setFirstClick(false);
    if (countMines(index, width, height, newGrid) > 0) {
      clearMinesAroundTile(index, newGrid, width, height);
    }
    updateMineCounts(newGrid, width, height);
  }
  if (!newGrid[index].exposed && !newGrid[index].flagged) {
    showTile(index, newGrid, width, height);
  } else if (e.buttons === 2 && newGrid[index].exposed && newGrid[index].value === countFlagsAroundIndex(index, newGrid, width, height)) {
    showNeighbors(index, newGrid, width, height);
  }
  setGrid(newGrid);
  checkForWin(newGrid, setGameState);
}
const handleRightClick = (e, index, grid, setGrid, flagCount, setFlagCount, gameState, setGameState) => {
  e.preventDefault();
  
  if (gameState === GameState.InProgress && (flagCount > 0 || grid[index].flagged) && !grid[index].exposed) {
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
  const [gameState, setGameState] = useState(GameState.InProgress);

  const squares = grid.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid, width, height, firstClick, setFirstClick, gameState, setGameState)}
      onContextMenu={(e, index) => handleRightClick(e, index, grid, setGrid, flagCount, setFlagCount, gameState, setGameState)}
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
      <div>
        Game State: {gameState}
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