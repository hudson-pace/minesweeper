// Given a grid and an index, return a list of valid indices within the given radius.
// **includes tile at the given index**
const getIndexListAroundTile = (index, grid) => {
    const {x, y} = getCoordsFromIndex(index, grid);
    const neighbors = [
        [x + 1, y - 1],
        [x + 1, y + 1],
        [x - 1, y - 1],
        [x - 1, y + 1],
        [x, y],
    ];
    if (x % 2 === 0) {
        neighbors.push(...[
            [x, y - 2],
            [x, y + 2],
            [x - 2, y],
            [x + 2, y],
        ]);
    }
    const coordList = [];
    neighbors.forEach((coords) => {
        if (coordsAreValid(coords[0], coords[1], grid)) {
            coordList.push(getIndexFromCoords(coords[0], coords[1], grid));
        }
    });
    return coordList;
}

const coordsAreValid = (x, y, grid) => {
    return (x >= 0 && y >= 0 && x < grid.width && y < grid.height && x % 2 === y % 2);
}

const getIndexFromCoords = (x, y, grid) => {
    if (!coordsAreValid(x, y, grid)) {
        return -1;
    }
    const oddRow = y % 2 === 1;
    if (oddRow) {
        return (Math.floor(y / 2) * grid.width) + (Math.ceil(grid.width / 2)) + ((x - 1) / 2);
    } else {
        return ((y / 2) * grid.width) + (x / 2);
    }
}

const getCoordsFromIndex = (index, grid) => {
    let y = Math.floor(index / grid.width) * 2;
    const half = Math.ceil(grid.width / 2);
    let x = index - ((y / 2) * grid.width);
    if (x >= half) {
        x = (2 * (x - half)) + 1;
        y += 1;
    } else {
        x *= 2;
    }
    return { x, y }
}

const generateEmptyGrid = (width, height, mineCount, guaranteedSolvable, shape) => {
    const w = Math.ceil(width / 2);
    const h = Math.ceil(height / 2);

    const len = (w * h) + ((w - 1) * (h - 1));
    const data = new Array(len).fill(0).map((value) => { return { value }});
    for (let i = 0; i < mineCount; i++) {
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
    const half = Math.ceil(grid.width / 2);
    for (let i = 0; i < grid.height; i+= 2) {
        const start = (i / 2) * grid.width;
        const mid = start + half;
        const end = ((i / 2) + 1) * grid.width;
        rows.push(<div className="row" key={i}>{squares.slice(start, mid)}</div>)
        rows.push(<div className="row" key={i + 1}>{squares.slice(mid, end)}</div>)
    }
    return rows;
}

const utils = {
    getIndexListAroundTile,
    generateEmptyGrid,
    getRows,
};

export default utils;