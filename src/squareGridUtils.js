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

const coordsAreValid = (x, y, grid) => {
    return (x >= 0 && y >= 0 && x < grid.width && y < grid.height);
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

const generateEmptyGrid = (width, height, mineCount, guaranteedSolvable, shape) => {
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
        guaranteedSolvable,
        shape,
    }
}

const getRows = (grid, squares) => {
    const rows = [];
    for (let i = 0; i < grid.width; i++) {
        rows.push(<div className="row" key={i}>{squares.slice(i * grid.width, (i + 1) * grid.width)}</div>);;
    }
    return rows;
}

const utils = {
    getIndexListAroundTile,
    generateEmptyGrid,
    getRows,
};

export default utils;