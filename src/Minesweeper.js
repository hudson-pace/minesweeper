import { useEffect, useState } from "react";
import autoplay from './autoplay';
import { countFlagsAroundIndex, getIndexListAroundTile, generateEmptyGrid, countMines, updateMineCounts, GameState, calculateGameState, getRandomTile, clearMinesAroundTile, initializeGrid } from "./gridUtils";
import Tile from './Tile';





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





const clickOnTile = (e, index, newGrid, gameState) => {
  if (gameState !== GameState.InProgress) return;
  if (!newGrid.initialized) {
    initializeGrid(newGrid, index);
  }
  if (!newGrid.data[index].exposed && !newGrid.data[index].flagged) {
    showTile(index, newGrid);
  } else if (e.buttons === 2 && newGrid.data[index].exposed && newGrid.data[index].value === countFlagsAroundIndex(index, newGrid)) {
    showNeighbors(index, newGrid);
  }
  return newGrid;
}

const completeTurn = (clickTargets, flagTargets, e, grid, setGrid, gameState, setGameState, flagCount) => {
  const newGrid = { ...grid }
  clickTargets.forEach((target) => {
    clickOnTile(e, target, newGrid, gameState);
  });
  flagTargets.forEach((target) => {
    flagCount = rightClickOnTile(e, target, newGrid, setGrid, flagCount, gameState, setGameState);
  });

  setGrid(newGrid);
  setGameState(calculateGameState(newGrid));
}

const handleClick = (e, index, grid, setGrid, gameState, setGameState, flagCount) => {
  completeTurn([index], [], e, grid, setGrid, gameState, setGameState, flagCount);
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
const handleRightClick = (e, index, grid, setGrid, flagCount, gameState, setGameState) => {
  e.preventDefault();
  completeTurn([], [index], e, grid, setGrid, gameState, setGameState, flagCount);
}

const handleRefreshClick = (setGrid, setGameState, width, height, mineCount) => {
  setGameState(GameState.InProgress);
  setGrid(generateEmptyGrid(width, height, mineCount));
}
export default function Minesweeper(props) {
  const { width, height, mineCount, shouldAutoplay } = props;
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid(width, height, mineCount);
  });
  const [gameState, setGameState] = useState(GameState.InProgress);

  let flagCount = mineCount;
  grid.data.forEach((tile) => {
    if (!tile.exposed && tile.flagged) {
      flagCount--;
    }
  });

  useEffect(() => {
    let autoplayInterval;
    if (shouldAutoplay) {
      autoplayInterval = setTimeout(() => {
        
        if (gameState === GameState.InProgress) {
          if (!grid.initialized) {
            completeTurn([getRandomTile(grid)], [], { buttons: 0 }, grid, setGrid, gameState, setGameState, flagCount);
          } else {
            const { clickTargets, flagTargets } = autoplay(grid, 5);
            if (clickTargets.size > 0 || flagTargets.size > 0) {
              completeTurn(clickTargets, flagTargets, { buttons: 0 }, grid, setGrid, gameState, setGameState, flagCount);
            }
          }
        } else {
          setGrid(generateEmptyGrid(width, height, mineCount));
          setGameState(GameState.InProgress);
        }
      }, 10);
    }
    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    }
  }, [gameState, grid, flagCount, width, height, mineCount, shouldAutoplay]);

  const squares = grid.data.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClick(e, index, grid, setGrid, gameState, setGameState, flagCount)}
      onContextMenu={(e, index) => handleRightClick(e, index, grid, setGrid, flagCount, gameState, setGameState)}
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
        <div className={`overlay ${gameState === GameState.InProgress ? 'hidden' : ''}`}>
            <div className='refresh-button' onClick={() => handleRefreshClick(setGrid, setGameState, width, height, mineCount)}>refresh</div>
        </div>
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