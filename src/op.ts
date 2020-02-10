import { Register } from "./register";

export const Op_cycles = [
//  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
    1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 0
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 1
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 2
    0, 3, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 3
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 4
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 5
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 6
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 7
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 8
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 9
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // a
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // b
    0, 0, 0, 4,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // c
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // d
    0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // e
    0, 0, 0, 1,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // f
];

export class Op {
    public static process_op_code(op_code: number, mem: Uint8Array, reg: Register) {
        this.op_code_map[op_code](mem, reg);
    }

    private static makeWord(upper:number, lower:number) : number{
        return upper << 8 | lower;
    }

    private static op_code_map: { [op_code: number]: (mem: Uint8Array, reg: Register) => void } = {
        0x00: (_) => {},
        0x31: (mem, reg) => { reg.sp = Op.makeWord(mem[reg.pc+1], mem[reg.pc]); reg.pc+=2; },
        0xc3: (mem, reg) => { reg.pc = Op.makeWord(mem[reg.pc+1], mem[reg.pc]); },
        0xf3: (_) => {},
    };
}