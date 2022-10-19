const countFlagsAroundIndex = (index, grid) => {
    let flagCount = 0;
  
    getIndexListAroundTile(index, grid, 2).forEach((i) => {
      if (grid.data[i].flagged) {
        flagCount++;
      }
    });

    return flagCount;
}

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

const generateGrid = (width, height, mineCount) => {
    const grid = {
      width,
      height,
      data: new Array(width * height).fill(0).map((value) => { return { value }}),
    }
    for (let i = 0; i < Math.min(width * height, mineCount); i++) {
      grid.data[i].value = -1;
    }
    shuffleArray(grid.data);
  
    grid.data = grid.data.map((tile, index) => {
      return {
        ...tile,
        flagged: false,
        exposed: false,
        index
      }
    });
    return grid;
}

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

export {
    countFlagsAroundIndex,
    getIndexListAroundTile,
    getIndexFromCoords,
    getCoordsFromIndex,
    coordsAreValid,
    countUnexposedTilesAroundIndex,
    generateGrid,
    shuffleArray,
    countMines,
    getFrontier,
    getUnexposedUnflaggedTilesAroundIndex,
}