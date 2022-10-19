import {
    countFlagsAroundIndex,
    countUnexposedTilesAroundIndex,
    getCoordsFromIndex,
    getFrontier,
    getIndexListAroundTile,
    getUnexposedUnflaggedTilesAroundIndex,
} from './gridUtils';

/*
    Given the current state of the grid and a level of intelligence to use,
    return lists of indices to flag and to click on.
*/
export default function autoplay(grid, level) {
    switch (level) {
        case 1:
            return autoplayMk1(grid);
        case 3:
            return autoplayMk3(grid);
        case 4:
            return autoplayMk4(grid);
        case 5:
            return autoplayMk5(grid);
        default:
            return {
                clickTargets: [],
                flagTargets: [],
            };

    }
}

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

const autoplayMk1 = (grid) => {
    const clickTargets = getClickTargets(grid);
    const flagTargets = new Set();
    grid.data.forEach((tile) => {
        if (tile.exposed) {
            if (tile.value === countUnexposedTilesAroundIndex(tile.index, grid)) {
                getIndexListAroundTile(tile.index, grid, 2).forEach((index) => {
                    if (!grid.data[index].exposed && !grid.data[index].flagged) {
                        flagTargets.add(index);
                    }
                });
            }
        }
    });

    return {
        clickTargets,
        flagTargets,
    }
}

const autoplayMk3 = (grid) => {
    const clickTargets = getClickTargets(grid);
    const flagTargets = new Set();
    grid.data.forEach((tile) => {
        if (tile.exposed) {
            const flags = countFlagsAroundIndex(tile.index, grid);
            if (tile.value > flags) {
                const candidates = getIndexListAroundTile(tile.index, grid, 2).filter((t) => !grid.data[t].flagged && !grid.data[t].exposed);
                const affectedParties = new Set();
                candidates.forEach((t) => {
                    const f = getIndexListAroundTile(t, grid, 2);
                    const ff = f.filter((i) => grid.data[i].exposed);
                    affectedParties.add(...ff);
                });
                let good = false;
                let choice;
                const hey = generateBinaryStrings(candidates.length, tile.value - flags);
                for (let i = 0; i < hey.length; i++) {
                    const s = hey[i];
                    const combination = [];
                    for (let j = 0; j < s.length; j++) {
                        if (s[j] === '1') {
                            combination.push(candidates[j]);
                        }
                    }
                    if (checksOut(combination, Array.from(affectedParties), grid)) {
                        if (!good) {
                            good = true;
                            choice = combination;
                        } else {
                            good = false;
                            break;
                        }
                    }
                }
                if (good) {
                    flagTargets.add(...choice);
                }
            }
        }
    });

    return {
        clickTargets,
        flagTargets,
    }
}

const autoplayMk4 = (grid) => {
    const clickTargets = getClickTargets(grid);
    const flagTargets = new Set();

    grid.data.forEach((tile) => {
        if (tile.exposed) {
            const flags = countFlagsAroundIndex(tile.index, grid);
            if (tile.value > flags) {
                const candidates = getIndexListAroundTile(tile.index, grid, 2).filter((t) => !grid.data[t].flagged && !grid.data[t].exposed);
                const affectedParties = new Set();
                candidates.forEach((t) => {
                    const f = getIndexListAroundTile(t, grid, 2);
                    const ff = f.filter((i) => grid.data[i].exposed);
                    affectedParties.add(...ff);
                });
                const validCombos = [];
                const hey = generateBinaryStrings(candidates.length, tile.value - flags);
                for (let i = 0; i < hey.length; i++) {
                    const s = hey[i];
                    const combination = [];
                    for (let j = 0; j < s.length; j++) {
                        if (s[j] === '1') {
                            combination.push(candidates[j]);
                        }
                    }
                    if (checksOut(combination, Array.from(affectedParties), grid)) {
                        validCombos.push(s);
                    }
                }
                if (validCombos.length > 0) {
                    for (let j = 0; j < candidates.length; j++) {
                        let valid = true;
                        for (let k = 0; k < validCombos.length; k++) {
                            if (validCombos[k][j] === '0') {
                                valid = false;
                            }
                        }
                        if (valid) {
                            flagTargets.add(candidates[j]);
                        }
                    }
                }
            }
        }
    });
    return {
        clickTargets,
        flagTargets,
    }
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

const autoplayMk5 = (grid) => {
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

const checksOut = (combination, affectedParties, grid) => {
  for (let i = 0; i < affectedParties.length; i++) {
    const party = affectedParties[i];
    if (!(grid.data[party].value >= countFlagsAroundIndex(party, grid) + combination.filter((c) => getIndexListAroundTile(party, grid, 2).includes(c)).length)) {
      return false;
    }
  };
  return true;
}