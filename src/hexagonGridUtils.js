// Given a grid and an index, return a list of valid indices within the given radius.
// **includes tile at the given index**
const getIndexListAroundTile = (index, grid) => {
    const neighbors = [
        [-1, -1],
        [0, -1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
    ]
    const { x, y } = getCoordsFromIndex(index, grid);

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
    for (let i = 0; i < grid.width + grid.height - 1; i++) {
        const row = [];
        for (let j = 0; j <= i; j++) {
            const index = getIndexFromCoords(j, i - j, grid);
            if (index !== -1) {
                row.push(squares[index]);
            }
        }
        rows.push(<div className="row" key={i}>{row}</div>);
    }
    return rows;
}

const utils = {
    getIndexListAroundTile,
    generateEmptyGrid,
    getRows,
};

export default utils;