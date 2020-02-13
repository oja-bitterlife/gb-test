import { GB } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace Op {
    export function process_op_code(op_code: number, gb: GB.env){
        op_code_map[op_code](gb);
    }

    const op_code_map: { [op_code: number]: (gb: GB.env) => void } = {
        0x00: (_) => {},
        0x20: (_) => {},
        0x31: (gb) => { gb.registers.sp = GB.loadWord(gb); },
        0xc3: (gb) => { gb.registers.pc = GB.loadWord(gb); },
        0xf0: (gb) => { gb.registers.a = Memory.readByte(gb.memory, 0xff00 | GB.loadByte(gb)) },
        0xf3: (_) => {},
        0xfe: (gb) => { Register.updateFlags(gb, GB.loadByte(gb), true) },
    };

    // op cycles table
    // from https://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html
    export const cycles = [
    //  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
        4,12, 8, 8,  4, 4, 8, 4, 20, 8, 8, 8,  4, 4, 8, 4,  // 0
        4,12, 8, 8,  4, 4, 8, 4, 12, 8, 8, 8,  4, 4, 8, 4,  // 1
        8,12, 8, 8,  4, 4, 8, 4,  8, 8, 8, 8,  4, 4, 8, 4,  // 2
        8,12, 8, 8, 12,12,12, 4,  8, 8, 8, 8,  4, 4, 8, 4,  // 3
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // 4
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // 5
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // 6
        8, 8, 8, 8,  8, 8, 4, 8,  4, 4, 4, 4,  4, 4, 8, 4,  // 7
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // 8
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // 9
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // a
        4, 4, 4, 4,  4, 4, 8, 4,  4, 4, 4, 4,  4, 4, 8, 4,  // b
        8,12,12,16, 12,16, 8,16,  8,16,12, 4, 12,24, 8,16,  // c
        8,12,12, 0, 12,16, 8,16,  8,16,12, 0, 12, 0, 8,16,  // d
       12,12, 8, 0,  0,16, 8,16, 16, 4,16, 0,  0, 0, 8,16,  // e
       12,12, 8, 4,  0,16, 8,30, 12, 8,16, 4,  0, 0, 8,16,  // f
    ];
}