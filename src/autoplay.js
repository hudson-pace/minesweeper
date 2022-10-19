import {
    countFlagsAroundIndex,
    countUnexposedTilesAroundIndex,
    getIndexListAroundTile,
} from './gridUtils';

/*
    Given the current state of the grid and a level of intelligence to use,
    return lists of indices to flag and to click on.
*/
export default function autoplay(grid, level) {
    if (level === 1) {
        return autoplayMk1(grid);
    } else if (level === 3) {
        return autoplayMk3(grid);
    } else if (level === 4) {
        return autoplayMk4(grid);
    } else {
        return grid;
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