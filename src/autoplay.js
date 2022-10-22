import {
    countFlagsAroundIndex,
    getFrontier,
    getIndexListAroundTile,
    getUnexposedUnflaggedTilesAroundIndex,
} from './gridUtils';

const getClickTargets = (grid) => {
    const clickTargets = new Set();
    grid.data.forEach((tile) => {
        if (tile.exposed && tile.value === countFlagsAroundIndex(tile.index, grid)) {
            getIndexListAroundTile(tile.index, grid, 2).forEach((index) => {
                if (!grid.data[index].exposed && !grid.data[index].flagged) {
                    clickTargets.add(index);
                }
            });
        }
    });
    return clickTargets;
}

// Accepts an array of arrays. Returns common elements.
const getCommonElements = (arrays) => {
    let common = arrays[0];
    for (let i = 1; i < arrays.length; i++) {
        common = common.filter((el) => arrays[i].includes(el));
    }
    return common;
}

const getSubsets = (arr, arrays) => {
    return arrays.filter((a) => a.tiles.every((el) => arr.includes(el)));
}

const autoplay = (grid) => {
    const clickTargets = getClickTargets(grid);
    const flagTargets = new Set();

    const requirements = getFrontier(grid).map((index) => {
        return {
            index,
            tiles: getUnexposedUnflaggedTilesAroundIndex(index, grid),
            count: grid.data[index].value - countFlagsAroundIndex(index, grid),
        }
    });

    requirements.forEach((req) => {
        if (req.count === req.tiles.length) {
            flagTargets.add(...req.tiles);
        } else {
            const subsets = getSubsets(req.tiles, requirements);
            let frontier = [...subsets]
            while (frontier.length > 0) {
                const oldFrontier = [...frontier];
                const newFrontier = [];
                oldFrontier.forEach((s) => {
                    const complement = [...oldFrontier, ...subsets].find((s2) => getCommonElements([s.tiles, s2.tiles]).length === 0);
                    if (complement) {
                        const newSubset = {
                            tiles: [...s.tiles, ...complement.tiles],
                            count: s.count + complement.count
                        };
                        subsets.push(newSubset);
                        newFrontier.push(newSubset);
                    }
                });
                frontier = newFrontier;
            }
            const relevantSubsets = subsets.filter((s) => s.count === req.count);
            relevantSubsets.forEach((s) => {
                const what = req.tiles.filter((t) => !s.tiles.includes(t));
                if (what.length > 0) {
                    clickTargets.add(...what);
                }
            });
        }
    });

    requirements.forEach((req) => {
        const relevantReqs = requirements.filter((r) => getCommonElements([req.tiles, r.tiles]).length > 0);
        const combinationStrings = generateBinaryStrings(req.tiles.length, req.count);
        const combinations = [];
        combinationStrings.forEach((s) => {
            const combination = [];
            for (let i = 0; i < s.length; i++) {
                if (s.charAt(i) === '1') {
                    combination.push(req.tiles[i]);
                }
            }
            combinations.push(combination);
        });

        const validCombinations = combinations.filter((c) => {
            for (let i = 0; i < relevantReqs.length; i++) {
                if (getCommonElements([c, relevantReqs[i].tiles]).length > relevantReqs[i].count) {
                    return false;
                }
            }
            return true;
        });
        const commonElements = getCommonElements(validCombinations);
        if (commonElements.length > 0) {
            flagTargets.add(...commonElements);
        }
    });
    return {
        clickTargets,
        flagTargets,
    }
}
export default autoplay;




const generateBinaryStrings = (length, oneCount) => {
  const total = Math.pow(2, length);
  const strings = [];
  for (let i = 0; i < total; i++) {
    const str = i.toString(2);
    if (str.split('1').length === oneCount + 1) {
      const pad = length - str.length;
      strings.push('0'.repeat(pad).concat(str));
    }
  }
  return strings;
}