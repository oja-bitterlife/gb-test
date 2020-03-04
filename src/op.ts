import { GB } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace Op {
    function formatDisAsm(gb: GB.env, op_code: number, addr : number) : string{
        return `${hexWord(addr)}: ${op_code_map[op_code].asm(gb)}`;
    }

    export function process_op_code(op_code: number, gb: GB.env){
        try{
            console.log(formatDisAsm(gb, op_code, gb.regs.pc-1));
            op_code_map[op_code].func(gb);
        }catch(ex){
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc-1).toString(16) + " => op: 0x" + op_code.toString(16));
            throw ex;  // exit
        }
    }

    function hexByte(byte : number) : string{
        return ( '00' + (byte&0xff).toString(16) ).slice( -2 );
    }
    function hexWord(word : number) : string{
        return ( '0000' + (word&0xffff).toString(16) ).slice( -4 );
    }

    const op_code_map: {
        [op_code: number]: {
            asm: (gb: GB.env) => string,
            func: (gb: GB.env) => void
        }
    } = {
        0x00: { asm: (gb) => { return "NOP"; },
                func: (gb) => {}},
        0x01: { asm: (gb) => { return `LD BC,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc+1))}${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.c = GB.loadSByte(gb); gb.regs.b = GB.loadSByte(gb); }},
        0x04: { asm: (gb) => { return "INC B"; },
                func: (gb) => { gb.regs.b++; }},
        0x05: { asm: (gb) => { return "DEC B"; },
                func: (gb) => { gb.regs.b--; }},
        0x06: { asm: (gb) => { return `LD B,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.b = GB.loadSByte(gb); }},
        0x0c: { asm: (gb) => { return "INC C"; },
                func: (gb) => { gb.regs.c++; }},
        0x0d: { asm: (gb) => { return "DEC C"; },
                func: (gb) => { gb.regs.c--; }},
        0x0e: { asm: (gb) => { const c = Memory.readSByte(gb.mem, gb.regs.pc); return `LD C,0x${hexByte(c)}`; },
                func: (gb) => { gb.regs.c = GB.loadSByte(gb); }},
        0x11: { asm: (gb) => { return `LD DE,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc+1))}${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.e = GB.loadSByte(gb); gb.regs.d = GB.loadSByte(gb); }},  // LD de
        0x18: { asm: (gb) => { return `JR 0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = GB.loadSByte(gb); gb.regs.pc += n; }},
        0x20: { asm: (gb) => { return `JR NZ,0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = GB.loadSByte(gb); if(!gb.flags.zero) gb.regs.pc += n; }},
        0x21: { asm: (gb) => { const l = Memory.readSByte(gb.mem, gb.regs.pc); const h = Memory.readSByte(gb.mem, gb.regs.pc+1); return `LD HL,0x${hexByte(h)}${hexByte(l)}`; },
                func: (gb) => { gb.regs.l = GB.loadSByte(gb); gb.regs.h = GB.loadSByte(gb); }},  // LD hl
        0x31: { asm: (gb) => { return `LD SP,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.sp = GB.loadWord(gb); }},
        0x3e: { asm: (gb) => { return `LD A,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.a = GB.loadSByte(gb); }},
        0x76: { asm: (gb) => { return "HALT"; },
                func: (gb) => { }},
        0xaf: { asm: (gb) => { return ""; },
                func: (gb) => { gb.regs.a ^= gb.regs.a; Register.updateFlags(gb, gb.regs.a, false); }},
        0xc3: { asm: (gb) => { return ""; },
                func: (gb) => { gb.regs.pc = GB.loadWord(gb); }},
        0xc9: { asm: (gb) => { return ""; },
                func: (gb) => { gb.regs.pc = GB.popWord(gb); }},
        0xcd: { asm: (gb) => { return ""; },
                func: (gb) => { const n = GB.loadWord(gb); GB.pushWord(gb, gb.regs.pc); gb.regs.pc = n; }},
        0xe0: { asm: (gb) => { return ""; },
                func: (gb) => { Memory.writeByte(gb.mem, 0xFF00 | GB.loadUByte(gb), gb.regs.a); }},
        0xf0: { asm: (gb) => { return ""; },
                func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | GB.loadUByte(gb)); }},
        0xf3: { asm: (gb) => { return ""; },
                func: (gb) => { gb.regs.ie = false; }},
        0xfe: { asm: (gb) => { return ""; },
                func: (gb) => { Register.updateFlags(gb, GB.loadUByte(gb), true) }},
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