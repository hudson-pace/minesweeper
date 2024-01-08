import { useEffect, useState } from "react";
import autoplay from './autoplay';
import { countFlagsAroundIndex, getIndexListAroundTile, generateEmptyGrid, GameState, calculateGameState, getRandomTile, initializeGrid, getRows } from "./gridUtils";
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
  let change = false;
  getIndexListAroundTile(index, grid, 2).forEach((i) => {
    if (!grid.data[i].exposed && !grid.data[i].flagged) {
      change = true;
      showTile(i, grid);
    }
  });
  return change;
}





const clickOnTile = (e, index, newGrid) => {
  let change = false;
  if (!newGrid.initialized) {
    initializeGrid(newGrid, index, newGrid.guaranteedSolvable);
    change = true;
  }
  if (!newGrid.data[index].exposed && !newGrid.data[index].flagged) {
    change = true;
    showTile(index, newGrid);
  } else if (e.buttons === 2 && newGrid.data[index].exposed && newGrid.data[index].value === countFlagsAroundIndex(index, newGrid)) {
    change = showNeighbors(index, newGrid) || change;
  }
  return change;
}

const completeTurn = (clickTargets, flagTargets, e, grid, setGrid, flagCount) => {
  const newGrid = { ...grid }
  let change = false;
  clickTargets.forEach((target) => {
    change = clickOnTile(e, target, newGrid) || change;
  });
  flagTargets.forEach((target) => {
    change = rightClickOnTile(target, newGrid, flagCount) || change;
  });

  if (change) {
    setGrid(newGrid);
  }
}

const handleClickOnTile = (e, index, grid, setGrid, gameState, flagCount) => {
  if (gameState === GameState.InProgress) {
    completeTurn([index], [], e, grid, setGrid, flagCount);
  }
}

const rightClickOnTile = (index, grid, flagCount) => {
  if ((flagCount > 0 || grid.data[index].flagged) && !grid.data[index].exposed) {
    const tile = {...grid.data[index]};
    tile.flagged = !tile.flagged;
    grid.data[index] = tile;
    return true;
  }
  return false;
}
const handleRightClickOnTile = (e, index, grid, setGrid, flagCount, gameState) => {
  e.preventDefault();
  if (gameState === GameState.InProgress) {
    completeTurn([], [index], e, grid, setGrid, flagCount);
  }
}

const handleRefreshClick = (setGrid, width, height, mineCount, guaranteedSolvable, shape) => {
  setGrid(generateEmptyGrid(width, height, mineCount, guaranteedSolvable, shape));
}
export default function Grid(props) {
  const { width, height, mineCount, shouldAutoplay, interval, guaranteedSolvable, shape } = props;
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid(width, height, mineCount, guaranteedSolvable, shape);
  });

  let flagCount = mineCount;
  grid.data.forEach((tile) => {
    if (!tile.exposed && tile.flagged) {
      flagCount--;
    }
  });

  const gameState = calculateGameState(grid);

  useEffect(() => {
    let autoplayInterval;
    if (shouldAutoplay) {
      autoplayInterval = setTimeout(() => {
        
        if (gameState === GameState.InProgress) {
          if (!grid.initialized) {
            completeTurn([getRandomTile(grid)], [], { buttons: 0 }, grid, setGrid, flagCount);
          } else {
            const { clickTargets, flagTargets } = autoplay(grid);
            if (clickTargets.size > 0 || flagTargets.size > 0) {
              completeTurn(clickTargets, flagTargets, { buttons: 0 }, grid, setGrid, flagCount);
            }
          }
        } else {
          setGrid(generateEmptyGrid(width, height, mineCount, guaranteedSolvable, shape));
        }
      }, interval);
    }
    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    }
  }, [gameState, grid, flagCount, width, height, mineCount, shouldAutoplay, guaranteedSolvable, shape]);

  useEffect(() => {
    setGrid(generateEmptyGrid(width, height, mineCount, guaranteedSolvable, shape));
  }, [width, height, mineCount, guaranteedSolvable, shape]);

  const squares = grid.data.map((tile) => {
    return <Tile
      value={tile.value}
      exposed={tile.exposed}
      flagged={tile.flagged}
      index={tile.index}
      key={tile.index}
      onClick={(e, index) => handleClickOnTile(e, index, grid, setGrid, gameState, flagCount)}
      onContextMenu={(e, index) => handleRightClickOnTile(e, index, grid, setGrid, flagCount, gameState)}
      shape={shape}
    />
  });
  const rows = getRows(grid, squares);
  return (
    <div>
      <div className="game-container">
        <div className={`overlay ${gameState === GameState.InProgress ? 'hidden' : ''}`}>
            <div className='refresh-button' onClick={() => handleRefreshClick(setGrid, width, height, mineCount, guaranteedSolvable, shape)}>refresh</div>
        </div>
        {rows}
      </div>
      <div className="info-panel">
        Flags: {flagCount} <br />
        Game State: {gameState} <br />
        <button onClick={() => handleRefreshClick(setGrid, width, height, mineCount, guaranteedSolvable, shape)}>Reset Board</button>
      </div>
    </div>
  )
}