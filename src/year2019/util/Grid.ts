export type P = { row: number; col: number };
export type P3 = P & { z: number };

export function P(row: number, col: number): P {
    return {col, row}
}

export function cpP(p: P): P {
    return {...p}
}

export function P3(row: number, col: number, z: number): P3 {
    return {col, row, z}
}

function pointToKey(p: P): string {
    return 'r' + p.row + 'c' + p.col;
}

export function point3ToKey(p: P3): string {
    return 'r' + p.row + 'c' + p.col + 'z' + p.z
}

export const BLOCK = '\u2588\u2588';
export const SPACE = '  ';

export function getPaintFunc(invert = false) {
    const defaultPaintConverter = (el: any) => {
        if (typeof el == "object") {
            return BLOCK;
        }
        if (typeof el == "undefined") {
            return SPACE;
        }
        return (invert ? !Number(el) : Number(el)) ? BLOCK : SPACE;
    };
    return defaultPaintConverter;
}

const defaultPaintConverter = getPaintFunc();

export function identity(input: any) {
    return input;
}

export class Grid<ELTYPE> {
    private matrix: Map<string, ELTYPE | undefined> = new Map<string, ELTYPE | undefined>();
    private maxCol: number = 0;
    private maxRow: number = 0;
    private minCol: number = 0;
    private minRow: number = 0;

    static fromMatrix<E>(matrix: E[][]): Grid<E> {
        const grid = new Grid<E>();
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                grid.setRc(row, col, matrix[row][col]);
            }
        }
        return grid;
    }

    get(p: P) {
        return this.matrix.get(pointToKey(p));
    }

    getRc(row: number, col: number) {
        return this.get(P(row, col));
    }

    set(p: P, val: ELTYPE | undefined) {
        if (this.maxCol < p.col) {
            this.maxCol = p.col;
        }
        if (this.minCol > p.col) {
            this.minCol = p.col;
        }
        if (this.maxRow < p.row) {
            this.maxRow = p.row;
        }
        if (this.minRow > p.row) {
            this.minRow = p.row;
        }
        return this.matrix.set(pointToKey(p), val);

    }

    setRc(row: number, col: number, val: ELTYPE | undefined) {
        return this.set(P(row, col), val);
    }

    asArray(): (ELTYPE | undefined)[][] {
        const result: (ELTYPE | undefined)[][] = [];
        for (let row = this.minRow; row < this.maxRow + 1; row++) {
            result[row - this.minRow] = [];
            for (let col = this.minCol; col < this.maxCol + 1; col++) {
                result[row - this.minRow].push(this.getRc(row, col));
            }
        }
        return result;
    }

    forEach(param: (p: P) => void) {
        for (let row = this.minRow; row < this.maxRow + 1; row++) {
            for (let col = this.minCol; col < this.maxCol + 1; col++) {
                if (this.getRc(row, col) !== undefined) {
                    param(P(row, col));
                }
            }
        }
    }

    asImage(colorFunc: (
        el: ELTYPE | undefined) => string = defaultPaintConverter,
            matrixConverter: (arr: (ELTYPE | undefined)[][]) => (ELTYPE | undefined)[][] = identity,
            flipH = false,
            flipV = false
    ): string {
        let matrix = this.asArray();
        if (matrixConverter) {
            matrix = matrixConverter(matrix);
        }
        if (flipV) {
            matrix = matrix.reverse();
        }
        return matrix.map(arr => (flipH ? arr.reverse() : arr).map(colorFunc).join('')).join('\n');
    }

    bruteForceImage() {
        const splitter = '\n------\n';
        console.log(splitter + this.asImage(getPaintFunc(true)));
        console.log(splitter + this.asImage(getPaintFunc(false)));
        let firstType: any = undefined;
        console.log(splitter + this.asImage((el) => {
            if (el == undefined) {
                return SPACE
            }
            const type = JSON.stringify(el);
            if (firstType === undefined) {
                firstType = type
            }
            return (type == firstType) ? SPACE : BLOCK
        }));

        firstType = undefined;
        console.log(splitter + this.asImage((el) => {
            if (el == undefined) {
                return SPACE
            }
            const type = JSON.stringify(el);
            if (firstType == undefined) {
                firstType = type
            }
            return (type == firstType) ? BLOCK : SPACE
        }));
    }

    all() {
        return this.matrix.values();
    }

    getNbElem(elem: ELTYPE): number {
        return [...this.all()].filter(el => el == elem).length
    }
}

export function flattenPoint(solution: P, maxRowDigits = 2) {
    return Math.pow(10, maxRowDigits) * solution.col + solution.row;
}