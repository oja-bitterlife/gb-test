import { GB } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace Op {
    export function process_op_code(op_code: number, gb: GB.env){
        try{
            op_code_map[op_code](gb);
        }catch(ex){
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc-1).toString(16) + " => op: 0x" + op_code.toString(16));
            throw ex;  // exit
        }
    }

    const op_code_map: { [op_code: number]: (gb: GB.env) => void } = {
        0x00: (_) => {},
        0x01: (gb) => { gb.regs.c = GB.loadSByte(gb); gb.regs.b = GB.loadSByte(gb); },
        0x04: (gb) => { gb.regs.b++; },
        0x05: (gb) => { gb.regs.b--; },
        0x06: (gb) => { gb.regs.b = GB.loadSByte(gb); },
        0x0c: (gb) => { gb.regs.c++; },
        0x0d: (gb) => { gb.regs.c--; },
        0x0e: (gb) => { gb.regs.c = GB.loadSByte(gb); },
        0x11: (gb) => { gb.regs.e = GB.loadSByte(gb); gb.regs.d = GB.loadSByte(gb); },  // LD de
        0x18: (gb) => { const n = GB.loadUByte(gb); gb.regs.pc += n; },
        0x20: (gb) => { const n = GB.loadSByte(gb); if(!gb.flags.zero) gb.regs.pc += n; },
        0x21: (gb) => { gb.regs.l = GB.loadSByte(gb); gb.regs.h = GB.loadSByte(gb); },  // LD hl
        0x31: (gb) => { gb.regs.sp = GB.loadWord(gb); },
        0x3e: (gb) => { gb.regs.a = GB.loadSByte(gb); },
        0xaf: (gb) => { gb.regs.a ^= gb.regs.a; Register.updateFlags(gb, gb.regs.a, false); },
        0xc3: (gb) => { gb.regs.pc = GB.loadWord(gb); },
        0xc9: (gb) => { gb.regs.pc = GB.popWord(gb); },
        0xcd: (gb) => { const n = GB.loadWord(gb); GB.pushWord(gb, gb.regs.pc); gb.regs.pc = n; },
        0xe0: (gb) => { Memory.writeByte(gb.mem, 0xFF00 | GB.loadUByte(gb), gb.regs.a); },
        0xf0: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | GB.loadUByte(gb)); },
        0xf3: (gb) => { gb.regs.ie = false; },
        0xfe: (gb) => { Register.updateFlags(gb, GB.loadUByte(gb), true) },
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