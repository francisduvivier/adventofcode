const IMMEDIATE_MODE = 1;

function getArgs(mem: number[], addresses: number[], modesString: string) {
    const args = [];
    const modeLetters = [...modesString].reverse();
    for (let i = 0; i < addresses.length; i++) {
        if (modeLetters[i] === String(IMMEDIATE_MODE)) {
            args[i] = addresses[i]
        } else {
            args[i] = mem[addresses[i]]
        }
    }

    return args;
}

let currInput = -1;

function getInput() {
    return currInput;
}

export const outputs: number[] = [];

function doOutput(arg: number) {
    outputs.push(arg);
}

function processOpCode(pos: number, mem: number[]) {
    let instruct = `${mem[pos]}`;
    const opCode = Number(instruct.slice(instruct.length - 2));
    // console.log(`opCode [${opCode}] instruct [${instruct}]`);
    const modesString: string = instruct.slice(0, instruct.length - 2);
    let nbArgs = 0;
    let nextPos = 0;
    let operation: (addrss: number[], args: number[]) => void = () => {
    };
    switch (opCode) {
        case 1:
            nbArgs = 3;
            operation = (addrss, args) => {
                mem[addrss[2]] = args[0] + args[1];
            };
            break;
        case 2:
            nbArgs = 3;
            operation = (addrss, args) => {
                mem[addrss[2]] = args[0] * args[1];
            };
            break;
        case 3:
            nbArgs = 1;
            operation = (addrss) => {
                mem[addrss[0]] = getInput();
            };
            break;
        case 4:
            nbArgs = 1;
            operation = (addrss, args) => {
                doOutput(args[0]);
            };
            break;
        case 5:
            nbArgs = 2;
            operation = (addrss, args) => {
                if (args[0] !== 0) {
                    nextPos = args[1]
                }
            };
            break;
        case 6:
            nbArgs = 2;
            operation = (addrss, args) => {
                if (args[0] === 0) {
                    nextPos = args[1]
                }
            };
            break;
        case 7:
            nbArgs = 3;
            operation = (addrss, args) => {
                mem[addrss[2]] = args[0] < args[1] ? 1 : 0;
            };
            break;
        case 8:
            nbArgs = 3;
            operation = (addrss, args) => {
                mem[addrss[2]] = args[0] === args[1] ? 1 : 0;
            };
            break;
        case 99:
            nbArgs = NaN;
            nextPos = -1;
            break;
        default:
            throw `unknown intcode [${mem[pos]}] at pos [${pos}]`
    }
    const addresses = [];
    for (let i = 0; i < nbArgs; i++) {

        addresses[i] = mem[(pos + 1 + i)];
    }
    // console.log(`addresses [${addresses}]`);
    const args = getArgs(mem, addresses, modesString);
    // console.log(`args [${args}]`);
    nextPos = nbArgs >= 0 ? pos + 1 + nbArgs : NaN;
    operation(addresses, args);

    return nextPos;
}

export function runFromMem(mem: number[]) {
    let instructionPointer = 0;
    while (instructionPointer >= 0 && instructionPointer < mem.length) {
        // console.log(`pointer [${instructionPointer}]`);
        instructionPointer = processOpCode(instructionPointer, mem);
    }
    return mem[0];
}

export function runIntCodeProgram(modifyableMemory: number[], noun: number, verb: number) {
    modifyableMemory[1] = noun;
    modifyableMemory[2] = verb;
    return runFromMem(modifyableMemory);
}

export function setStdInput(input: number) {
    currInput = input;
}