import autoplay from "./autoplay";

const countFlagsAroundIndex = (index, grid) => {
    let flagCount = 0;
  
    getIndexListAroundTile(index, grid, 2).forEach((i) => {
      if (grid.data[i].flagged) {
        flagCount++;
      }
    });

    return flagCount;
}

const GameState = {
  Lost: 'Lost',
  Won: 'Won',
  InProgress: 'InProgress',
};

// Given a grid and an index, return a list of valid indices within the given radius.
// **includes tile at the given index**
const getIndexListAroundTile = (index, grid, radius) => {
    const effectiveRadius = radius - 1;
    const {x, y} = getCoordsFromIndex(index, grid);
    const coordList = [];
    for (let i = 0 - effectiveRadius; i <= 0 + effectiveRadius; i++) {
        for (let j = 0 - effectiveRadius; j <= 0 + effectiveRadius; j++) {
            const x2 = x + i;
            const y2 = y + j;
            if (coordsAreValid(x2, y2, grid)) {
                coordList.push(getIndexFromCoords(x2, y2, grid));
            }
        }
    }
    return coordList;
}

const getIndexFromCoords = (x, y, grid) => {
    return coordsAreValid(x, y, grid) ? (y * grid.width) + x : -1;
}

const getCoordsFromIndex = (index, grid) => {
    return {
      x: index % grid.width,
      y: Math.floor(index / grid.width),
    }
}
const coordsAreValid = (x, y, grid) => {
    return (x >= 0 && y >= 0 && x < grid.width && y < grid.height);
}
const countUnexposedTilesAroundIndex = (index, grid) => {
    let unexposedTileCount = 0;
    getIndexListAroundTile(index, grid, 2).forEach((i) => {
      if (!grid.data[i].exposed) {
        unexposedTileCount++;
      }
    });
    return unexposedTileCount;
}

const generateEmptyGrid = (width, height, mineCount) => {
  const data = new Array(width * height).fill(0).map((value) => { return { value }});
  for (let i = 0; i < Math.min(width * height, mineCount); i++) {
    data[i].value = -1;
  }
  return {
    width,
    height,
    data: data.map((tile, index) => {
      return {
        ...tile,
        flagged: false,
        exposed: false,
        index
      }
    }),
    initialized: false,
  }
}

const calculateGameState = (grid) => {
  let win = true;
  for (const tile of grid.data) {
    if (tile.value === -1 && tile.exposed) {
      return GameState.Lost;
    } else if (tile.value !== -1 && !tile.exposed) {
      win = false;
    }
  }
  return win ? GameState.Won : GameState.InProgress;
}

const gridIsSolvable = (grid, firstClickIndex) => {
  const data = grid.data.map((tile) => { return { ...tile }});
  grid.data[firstClickIndex].exposed = true;

  let clickTargets, flagTargets;
  do {
    ({ clickTargets, flagTargets } = autoplay(grid, 5));
    clickTargets.forEach((i) => {
      grid.data[i].exposed = true;
    });
    flagTargets.forEach((i) => {
      grid.data[i].flagged = true;
    });
  } while (clickTargets.size > 0 || flagTargets.size > 0);
  const state = calculateGameState(grid);
  grid.data=  data;
  return (state !== GameState.InProgress);
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

const initializeGrid = (grid, firstClickIndex) => {
  grid.initialized = true;
  do {
    grid.data = shuffleArray((grid.data));
    clearMinesAroundTile(firstClickIndex, grid);
    grid.data = grid.data.map((tile, index) => {
      return {
        ...tile,
        index,
      }
    });
    updateMineCounts(grid);
  } while (!gridIsSolvable(grid, firstClickIndex));
}

// courtesy of Fisher-Yates
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  let m = shuffled.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

const countMines = (index, grid) => {
    let mineCount = 0;
    if (grid.data[index].value === -1) {
      return 1;
    }
    getIndexListAroundTile(index, grid, 2).forEach((i) => {
      if (i !== -1 && grid.data[i].value === -1) {
        mineCount++;
      }
    });
    return mineCount;
}

// returns a list of indices which are exposed, and whose value is greater than their surrounding flags
const getFrontier = (grid) => {
    return grid.data.filter((tile) => tile.exposed && tile.value > countFlagsAroundIndex(tile.index, grid)).map((tile) => tile.index);
}

const getUnexposedUnflaggedTilesAroundIndex = (index, grid) => {
    return getIndexListAroundTile(index, grid, 2).filter((index) => !grid.data[index].exposed && !grid.data[index].flagged);
}

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

export {
    countFlagsAroundIndex,
    getIndexListAroundTile,
    getIndexFromCoords,
    getCoordsFromIndex,
    coordsAreValid,
    countUnexposedTilesAroundIndex,
    shuffleArray,
    countMines,
    getFrontier,
    getUnexposedUnflaggedTilesAroundIndex,
    updateMineCounts,
    GameState,
    calculateGameState,
    getRandomTile,
    findValidEmptyTile,
    clearMinesAroundTile,
    generateEmptyGrid,
    initializeGrid
}