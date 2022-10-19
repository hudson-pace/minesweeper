import { useEffect, useState } from "react";
import autoplay from './autoplay';
import { countFlagsAroundIndex, getIndexListAroundTile, generateGrid, countMines } from "./gridUtils";
import Tile from './Tile';

const GameState = {
  Lost: 'Lost',
  Won: 'Won',
  InProgress: 'InProgress',
};

const updateMineCounts = (grid) => {
  for (let i = 0; i < grid.data.length; i++) {
    if (grid.data[i].value !== -1) {
      grid.data[i] = {
        ...grid.data[i],
        value: countMines(i, grid),
      }
    }
  }
}

const showTile = (index, grid) => {
  const tile = {...grid.data[index]};
  tile.exposed = true;
  grid.data[index] = tile;
  if (tile.value === 0) {
    getIndexListAroundTile(index, grid, 2).forEach((i) => {
      if (!grid.data[i].exposed && !grid.data[i].flagged) {
        showTile(i, grid);
      }
    });
  }
}

const showNeighbors = (index, grid) => {
  getIndexListAroundTile(index, grid, 2).forEach((i) => {
    if (!grid.data[i].exposed && !grid.data[i].flagged) {
      showTile(i, grid);
    }
  });
}

const getRandomTile = (grid) => {
  return Math.floor(Math.random() * grid.width * grid.height);
}

// returns an empty tile that is not within the provided list of indices.
const findValidEmptyTile = (grid, protectedIndices = []) => {
  let candidateIndex;
  do {
    candidateIndex = getRandomTile(grid);
  } while (grid.data[candidateIndex].value === -1 || protectedIndices.includes(candidateIndex));
  return candidateIndex;
}

const clearMinesAroundTile = (index, grid) => {
  const indices = getIndexListAroundTile(index, grid, 2);
  indices.forEach((i) => {
    if (grid.data[i].value === -1) {
      const newIndex = findValidEmptyTile(grid, indices);
      const temp = grid.data[i];
      grid.data[i] = {...grid.data[newIndex], index: i};
      grid.data[newIndex] = {...temp, index: newIndex};
    }
  });
}

const checkForWin = (grid, setGameState) => {
  let win = true;
  for (const tile of grid.data) {
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

const clickOnTile = (e, index, newGrid, firstClick, setFirstClick, gameState) => {
  if (gameState !== GameState.InProgress) return;
  if (firstClick) {
    setFirstClick(false);
    if (countMines(index, newGrid) > 0) {
      clearMinesAroundTile(index, newGrid);
    }
    updateMineCounts(newGrid);
  }
  if (!newGrid.data[index].exposed && !newGrid.data[index].flagged) {
    showTile(index, newGrid);
  } else if (e.buttons === 2 && newGrid.data[index].exposed && newGrid.data[index].value === countFlagsAroundIndex(index, newGrid)) {
    showNeighbors(index, newGrid);
  }
  return newGrid;
}

const completeTurn = (clickTargets, flagTargets, e, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount) => {
  const newGrid = { ...grid }

  clickTargets.forEach((target) => {
    clickOnTile(e, target, newGrid, firstClick, setFirstClick, gameState);
  });

  flagTargets.forEach((target) => {
    flagCount = rightClickOnTile(e, target, newGrid, setGrid, flagCount, gameState, setGameState);
  });

  setGrid(newGrid);
  checkForWin(newGrid, setGameState);
}

const handleClick = (e, index, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount) => {
  completeTurn([index], [], e, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount);
}

const rightClickOnTile = (e, index, grid, setGrid, flagCount, gameState, setGameState) => {
  if (gameState === GameState.InProgress && (flagCount > 0 || grid.data[index].flagged) && !grid.data[index].exposed) {
    const tile = {...grid.data[index]};
    const newCount = flagCount + (tile.flagged ? 1 : -1);
    tile.flagged = !tile.flagged;
    grid.data[index] = tile;
    return newCount;
  }
}
const handleRightClick = (e, index, grid, setGrid, flagCount, gameState, setGameState, firstClick, setFirstClick) => {
  e.preventDefault();
  completeTurn([], [index], e, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount);
}
export default function Minesweeper(props) {
  const { width, height, mineCount } = props;
  const [grid, setGrid] = useState(() => {
    return generateGrid(width, height, mineCount);
  });
  const [firstClick, setFirstClick] = useState(true);
  const [gameState, setGameState] = useState(GameState.InProgress);

  let flagCount = mineCount;
  grid.data.forEach((tile) => {
    if (!tile.exposed && tile.flagged) {
      flagCount--;
    }
  });

  useEffect(() => {
    const autoplayInterval = setTimeout(() => {
      const { clickTargets, flagTargets } = autoplay(grid, 4);
      if (clickTargets.size > 0 || flagTargets.size > 0) {
        completeTurn(clickTargets, flagTargets, { buttons: 0 }, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount);
      }
    }, 100);
    return () => {
      clearInterval(autoplayInterval);
    }
  }, [firstClick, gameState, grid, flagCount]);

  const squares = grid.data.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid, firstClick, setFirstClick, gameState, setGameState, flagCount)}
      onContextMenu={(e, index) => handleRightClick(e, index, grid, setGrid, flagCount, gameState, setGameState, firstClick, setFirstClick)}
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