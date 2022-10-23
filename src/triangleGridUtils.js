// Given a grid and an index, return a list of valid indices within the given radius.
// **includes tile at the given index**
const getIndexListAroundTile = (index, grid) => {
    const downNeighbors = [
        [-3, -1],
        [1, -1]
    ];
    const upNeighbors = [
        [-1, 1],
        [3, 1],
    ]
    const commonNeighbors = [
        [-2, -1],
        [-1, -1],
        [0, -1],
        [-2, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 0],
    ]
    const { x, y } = getCoordsFromIndex(index, grid);
    const facingUp = x % 2 === 0;
    const neighbors = facingUp ? [...commonNeighbors, ...upNeighbors] : [...commonNeighbors, ...downNeighbors];

    const indexList = [];
    neighbors.forEach((coords) => {
        const x2 = x + coords[0];
        const y2 = y + coords[1];
        if (coordsAreValid(x2, y2, grid)) {
            indexList.push(getIndexFromCoords(x2, y2, grid));
        }
    });
    
    return indexList;
}

const coordsAreValid = (x, y, grid) => {
    const rowYStart = Math.pow(y, 2);
    const rowYEnd = Math.pow(y + 1, 2) - 1;
    return (y >= 0 && x >= 0 && x <= rowYEnd - rowYStart && rowYStart + x < grid.data.length);
}

const getIndexFromCoords = (x, y, grid) => {
    return coordsAreValid(x, y, grid) ? Math.pow(y, 2) + x : -1;
}

const getCoordsFromIndex = (index, grid) => {
    const y = Math.floor(Math.sqrt(index));
    return {
      x: index - Math.pow(y, 2),
      y
    }
}

const generateEmptyGrid = (width, height, mineCount, guaranteedSolvable, shape) => {
    const data = new Array(Math.pow(height, 2)).fill(0).map((value) => { return { value }});
    for (let i = 0; i < Math.min(data.length, mineCount); i++) {
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
    for (let i = 0; i < grid.height; i++) {
        rows.push(<div className="row" key={i}>{squares.slice(Math.pow(i, 2), Math.min(Math.pow(i + 1, 2), squares.length))}</div>)
    }
    return rows;
}

const utils = {
    getIndexListAroundTile,
    generateEmptyGrid,
    getRows,
};

export default utils;