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

    export const cycles = [
    //  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
        4, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 0
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 1
       12, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 2
        0,12, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 3
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 4
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 5
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 6
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 7
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 8
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // 9
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // a
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // b
        0, 0, 0,16,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // c
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // d
        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  // e
       12, 0, 0, 4,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 8, 0,  // f
    ];
}