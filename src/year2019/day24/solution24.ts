import {Grid, P} from "../util/Grid";
import * as assert from "assert";
import Long from "long";
import {DIR, DIRS, getNewPos} from "../util/GridRobot";

assert.equal(Long.fromString(calcBioDev(Grid.fromMatrix(`.....
.....
.....
#....
.#...`.split('\n').map(line => line.split('')))), true, 2).toNumber(), 2129920);


const input = `##.#.
#.###
##...
...#.
#.##.`;

function calcBioDev(inputGrid: any) {
    const allTilesRev = [...inputGrid.all()].reverse();
    return allTilesRev.slice(allTilesRev.indexOf('#')).map(val => val == '.' ? '0' : '1').join('');
}

function part1(inputString: any) {
    const bioDevs: string[] = [];
    const bioDevToOrder: Map<string, number> = new Map<string, number>();
    let currGrid: Grid<string> = Grid.fromMatrix<string>(inputString.split('\n').map(line => line.split('')));


    let currBioDev = calcBioDev(currGrid);
    console.log(currGrid.asImage(el => el!));
    console.log(bioDevs.length);
    while (!bioDevToOrder.get(currBioDev)) {

        bioDevToOrder.set(currBioDev, bioDevs.push(currBioDev));
        const newGrid = new Grid<string>();
        currGrid.forEach((p, val) => {
            let nSurroundingBugs = 0;
            for (let dir of DIRS) {
                if (currGrid.get(getNewPos(dir, p)) == '#') {
                    nSurroundingBugs++;
                }
            }
            if (val == '#' && nSurroundingBugs != 1) {
                newGrid.set(p, '.');
            } else if (val == '.' && (nSurroundingBugs == 1 || nSurroundingBugs == 2)) {
                newGrid.set(p, '#')
            } else {
                newGrid.set(p, val);
            }
        });
        currGrid = newGrid;
        console.log(currGrid.asImage(el => el!));
        console.log(bioDevs.length);
        currBioDev = calcBioDev(currGrid);
    }
    console.log(bioDevToOrder.get(currBioDev));
    return currBioDev;
}

console.log(Long.fromString(part1(input), true, 2).toString());
type INFO = { b: boolean, surr?: number }
type REC_GRID = Grid<INFO | REC_GRID>

function isInfo(newVal: INFO | REC_GRID | undefined): newVal is INFO {
    return newVal?.['b'] !== undefined;
}

function wrapAround(col: Long | number, max: Long | number): Long {
    if (typeof col == 'number') {
        col = Long.fromNumber(col);
    }
    if (typeof max == 'number') {
        max = Long.fromNumber(max, true);
    }
    let moddie = col.mod(max);
    if (!moddie.isNegative()) {
        return moddie
    } else {
        return max.add(moddie);
    }
}

const indexes = [0, 1, 2, 3, 4];

function incrRecGridFrom(grid: REC_GRID, newPos: P, dir: DIR) {

    const goesOutWard = !(newPos.col == 2 && newPos.row == 2);
    let newPositions: P[] = [];
    if (goesOutWard) {
        const newOutWardColMapped = wrapAround(newPos.col, 6).toNumber();
        const newOutWardRowMapped = wrapAround(newPos.row, 6).toNumber();
        newPositions = [P(newOutWardRowMapped, newOutWardColMapped)];
    } else {
        switch (dir) {
            case DIR.DOWN:
                newPositions = indexes.map(i => P(0, i));
                break;
            case DIR.UP:
                newPositions = indexes.map(i => P(4, i));
                break;
            case DIR.RIGHT:
                newPositions = indexes.map(i => P(i, 0));
                break;
            case DIR.LEFT:
                newPositions = indexes.map(i => P(i, 4));
                break;
        }
    }
    for (let pos of newPositions) {
        const currVal = (grid.get(pos) ?? {b: false}) as INFO;
        currVal.surr = (currVal.surr || 0) + 1;
        grid.set(pos, currVal);
    }
}

const orderedGrids: REC_GRID[] = [];

function part2(inputString: any, minutes: number) {
    const startGrid: REC_GRID = Grid.fromMatrix<INFO | REC_GRID>(inputString.split('\n').map(line => line.split('').map(s => ({b: s == '#'}))));
    startGrid.setRc(2, 2, undefined!);
    const startGridLevel = 500;
    let minLevel = startGridLevel;
    orderedGrids[500] = startGrid;
    let currSum = 0;
    for (let minute = 0; minute < minutes; minute++) {
        for (let level = minLevel; level < orderedGrids.length; level++) {
            const grid = orderedGrids[level];
            grid.forEach((p, v) => {
                if (isInfo(v) && v.b) {
                    for (let dir of DIRS) {
                        {
                            const newPos = getNewPos(dir, p);
                            const newVal = grid.get(newPos);
                            if (newVal !== undefined) {
                                if (isInfo(newVal)) {
                                    newVal.surr = (newVal.surr || 0) + 1;
                                } else {
                                    incrRecGridFrom(newVal, newPos, dir);
                                }
                            } else {
                                const newOutWardColMapped = wrapAround(newPos.col, 6).toNumber();
                                const newOutWardRowMapped = wrapAround(newPos.row, 6).toNumber();
                                if (newPos.row == 2 && newPos.col == 2 || newOutWardRowMapped % 5 == 0 || newOutWardColMapped % 5 == 0) {
                                    let newGrid: REC_GRID;
                                    if (newOutWardRowMapped % 5 == 0 || newOutWardColMapped % 5 == 0) {//outer grid
                                        newGrid = orderedGrids[level + 1] ?? new Grid();
                                        orderedGrids[level + 1] = newGrid;
                                    } else {//inner grid
                                        newGrid = new Grid();
                                        orderedGrids[level - 1] = newGrid;
                                        minLevel = Math.min(level - 1, minLevel);
                                    }

                                    incrRecGridFrom(newGrid!, newPos, dir);
                                    grid.set(newPos, newGrid);
                                } else {
                                    const currVal = {b: false} as INFO;
                                    currVal.surr = (currVal.surr || 0) + 1;
                                    grid.set(newPos, currVal);
                                }

                            }
                        }
                    }
                }
            })
        }

        let sum = 0;
        for (let level = minLevel; level < orderedGrids.length; level++) {
            const grid = orderedGrids[level];
            console.log('level ' + (level - startGridLevel));
            console.log(grid.asImage(el => el ? (isInfo(el) ? el.b ? '#' : '.' : '?') : ' '));
            console.log(grid.asImage(el => el ? (isInfo(el) ? (el.surr ?? ' ') + '' : '?') : ' '));
            grid.forEach((p, v) => {
                if (isInfo(v)) {
                    let newB;
                    if (v.b) {
                        newB = v.surr == 1
                    } else {
                        newB = v.surr == 1 || v.surr == 2
                    }
                    if (newB) {
                        sum++;
                    }
                    v.b = newB;
                    v.surr = 0;
                }
            });
            console.log('level after recalc ' + (level - startGridLevel));
            console.log(grid.asImage(el => el ? (isInfo(el) ? el.b ? '#' : '.' : '?') : ' '));
        }

        currSum = sum;
        console.log('minutes', minute, 'currSum', sum, 'levels', orderedGrids.length - minLevel);
    }
    return currSum;
}

//102 too low

assert.equal(part2(`....#
#..#.
#.?##
..#..
#....`, 10), 99);

part2(input, 200);
