import { Gb } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace Op {
    export function formatDisAsm(op_code: number, gb: Gb.Env) : string{
        return `0x${hexWord(gb.regs.pc-1)}: ${op_code_map[op_code].asm(gb)}`;
    }

    export function process_op_code(op_code: number, gb: Gb.Env){
        try{
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
            asm: (gb: Gb.Env) => string,
            func: (gb: Gb.Env) => void
        }
    } = {
        0x00: { asm: (gb) => { return "NOP"; },
                func: (gb) => {}},
        0x01: { asm: (gb) => { return `LD   BC,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.c = Gb.loadSByte(gb); gb.regs.b = Gb.loadSByte(gb); }},
        0x04: { asm: (gb) => { return "INC  B"; },
                func: (gb) => { gb.regs.b = (gb.regs.b+1)&0xff; Register.updateFlags(gb, gb.regs.b, false); }},
        0x05: { asm: (gb) => { return "DEC  B"; },
                func: (gb) => { gb.regs.b = (gb.regs.b-1)&0xff; Register.updateFlags(gb, gb.regs.b, false); }},
        0x06: { asm: (gb) => { return `LD   B,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.b = Gb.loadSByte(gb); }},
        0x0c: { asm: (gb) => { return "INC  C"; },
                func: (gb) => { gb.regs.c = (gb.regs.c+1)&0xff; Register.updateFlags(gb, gb.regs.c, false); }},
        0x0d: { asm: (gb) => { return "DEC  C"; },
                func: (gb) => { gb.regs.c = (gb.regs.c-1)&0xff; Register.updateFlags(gb, gb.regs.c, false); }},
        0x0e: { asm: (gb) => { return `LD   C,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.c = Gb.loadSByte(gb); }},
        0x11: { asm: (gb) => { return `LD   DE,0x${hexByte(Memory.readWord(gb.mem, gb.regs.pc+1))}`; },
                func: (gb) => { gb.regs.e = Gb.loadSByte(gb); gb.regs.d = Gb.loadSByte(gb); }},
        0x18: { asm: (gb) => { return `JR   0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadSByte(gb); gb.regs.pc += n; }},
        0x20: { asm: (gb) => { return `JR   NZ,0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadSByte(gb); if(!gb.flags.zero) gb.regs.pc += n; }},
        0x21: { asm: (gb) => { return `LD HL,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc+1))}${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.l = Gb.loadSByte(gb); gb.regs.h = Gb.loadSByte(gb); }},
        0x22: { asm: (gb) => { return `LD (HL+),A`; },
                func: (gb) => { let hl = ((gb.regs.h<<8)&0xff) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.a); hl++; gb.regs.h = (hl>>8)&0xff; gb.regs.l = hl&0xff; }},
        0x31: { asm: (gb) => { return `LD   SP,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.sp = Gb.loadWord(gb); }},
        0x3e: { asm: (gb) => { return `LD   A,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.a = Gb.loadSByte(gb); }},
        0x76: { asm: (gb) => { return "HALT"; },
                func: (gb) => { }},
        0xaf: { asm: (gb) => { return "XOR  A"; },
                func: (gb) => { gb.regs.a ^= gb.regs.a; Register.updateFlags(gb, gb.regs.a, false); }},
        0xc3: { asm: (gb) => { return `JP   0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.pc = Gb.loadWord(gb); }},
        0xc9: { asm: (gb) => { return "RET"; },
                func: (gb) => { gb.regs.pc = Gb.popWord(gb); }},
        0xcd: { asm: (gb) => { return `CALL 0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadWord(gb); Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = n; }},
        0xe0: { asm: (gb) => { return `LDH  0x${hexWord(0xFF00 | Memory.readUByte(gb.mem, gb.regs.pc))},A`; },
                func: (gb) => { Memory.writeByte(gb.mem, 0xFF00 | Gb.loadUByte(gb), gb.regs.a); }},
        0xf0: { asm: (gb) => { return `LDH  A,0x${hexWord(0xFF00 | Memory.readUByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | Gb.loadUByte(gb)); }},
        0xf3: { asm: (gb) => { return "DI"; },
                func: (gb) => { gb.regs.ie = false; }},
        0xfe: { asm: (gb) => { return `CP   0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { Register.updateFlags(gb, Gb.loadUByte(gb), true) }},
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