import { Gb } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace Op {
    export function formatDisAsm(op_code: number, gb: Gb.Env) : string{
        try{
            return `0x${hexWord(gb.regs.pc-1)}: ${op_code_map[op_code].asm(gb)}`;
        }catch(ex){
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc-1).toString(16) + " => op: 0x" + op_code.toString(16));
            throw ex;  // exit
        }
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
        0x11: { asm: (gb) => { return `LD   DE,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.e = Gb.loadSByte(gb); gb.regs.d = Gb.loadSByte(gb); }},
        0x12: { asm: (gb) => { return `LD   (DE),A`; },
                func: (gb) => { const de = ((gb.regs.d&0xff)<<8) | (gb.regs.e&0xff); Memory.writeByte(gb.mem, de, gb.regs.a); }},
        0x13: { asm: (gb) => { return `INC  DE`; },
                func: (gb) => { let de = ((gb.regs.d&0xff)<<8) | (gb.regs.e&0xff); de++; gb.regs.d = (de>>8)&0xff; gb.regs.e = de&0xff; }},
        0x14: { asm: (gb) => { return `INC  D`; },
                func: (gb) => { gb.regs.d = (gb.regs.d+1)&0xff; Register.updateFlags(gb, gb.regs.d, false); }},
        0x15: { asm: (gb) => { return `DEC  D`; },
                func: (gb) => { gb.regs.d = (gb.regs.d-1)&0xff; Register.updateFlags(gb, gb.regs.d, false); }},
        0x18: { asm: (gb) => { return `JR   0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadSByte(gb); gb.regs.pc += n; }},
        0x1c: { asm: (gb) => { return `INC  E`; },
                func: (gb) => { gb.regs.e = (gb.regs.e+1)&0xff; Register.updateFlags(gb, gb.regs.e, false); }},
        0x1e: { asm: (gb) => { return `DEC  E`; },
                func: (gb) => { gb.regs.e = (gb.regs.e-1)&0xff; Register.updateFlags(gb, gb.regs.e, false); }},
        0x20: { asm: (gb) => { return `JR   NZ,0x${hexWord(gb.regs.pc+1+Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadSByte(gb); if(!gb.flags.zero) gb.regs.pc += n; }},
        0x21: { asm: (gb) => { return `LD   HL,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc+1))}${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.l = Gb.loadSByte(gb); gb.regs.h = Gb.loadSByte(gb); }},
        0x22: { asm: (gb) => { return `LD   (HL+),A`; },
                func: (gb) => { let hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.a); hl++; gb.regs.h = (hl>>8)&0xff; gb.regs.l = hl&0xff; }},
        0x2a: { asm: (gb) => { return `LD   A,(HL+)`; },
                func: (gb) => { let hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.a = Memory.readSByte(gb.mem, hl); hl++; gb.regs.h = (hl>>8)&0xff; gb.regs.l = hl&0xff; }},
        0x31: { asm: (gb) => { return `LD   SP,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.sp = Gb.loadWord(gb); }},
        0x3e: { asm: (gb) => { return `LD   A,0x${hexByte(Memory.readSByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.a = Gb.loadSByte(gb); }},
        0x40: { asm: (gb) => { return `LD   B,B`; },
                func: (gb) => { gb.regs.b = gb.regs.b }},
        0x41: { asm: (gb) => { return `LD   B,C`; },
                func: (gb) => { gb.regs.b = gb.regs.c; }},
        0x42: { asm: (gb) => { return `LD   B,D`; },
                func: (gb) => { gb.regs.b = gb.regs.d; }},
        0x43: { asm: (gb) => { return `LD   B,E`; },
                func: (gb) => { gb.regs.b = gb.regs.e; }},
        0x44: { asm: (gb) => { return `LD   B,H`; },
                func: (gb) => { gb.regs.b = gb.regs.h; }},
        0x45: { asm: (gb) => { return `LD   B,L`; },
                func: (gb) => { gb.regs.b = gb.regs.l; }},
        0x46: { asm: (gb) => { return `LD   B,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.b = Memory.readSByte(gb.mem, hl); }},
        0x47: { asm: (gb) => { return `LD   B,A`; },
                func: (gb) => { gb.regs.b = gb.regs.a; }},
        0x48: { asm: (gb) => { return `LD   C,B`; },
                func: (gb) => { gb.regs.c = gb.regs.b; }},
        0x49: { asm: (gb) => { return `LD   C,C`; },
                func: (gb) => { gb.regs.c = gb.regs.c; }},
        0x4a: { asm: (gb) => { return `LD   C,D`; },
                func: (gb) => { gb.regs.c = gb.regs.d; }},
        0x4b: { asm: (gb) => { return `LD   C,E`; },
                func: (gb) => { gb.regs.c = gb.regs.e; }},
        0x4c: { asm: (gb) => { return `LD   C,H`; },
                func: (gb) => { gb.regs.c = gb.regs.h; }},
        0x4d: { asm: (gb) => { return `LD   C,L`; },
                func: (gb) => { gb.regs.c = gb.regs.l; }},
        0x4e: { asm: (gb) => { return `LD   C,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.c = Memory.readSByte(gb.mem, hl); }},
        0x4f: { asm: (gb) => { return `LD   C,A`; },
                func: (gb) => { gb.regs.c = gb.regs.a; }},
        0x50: { asm: (gb) => { return `LD   D,B`; },
                func: (gb) => { gb.regs.d = gb.regs.b; }},
        0x51: { asm: (gb) => { return `LD   D,C`; },
                func: (gb) => { gb.regs.d = gb.regs.c; }},
        0x52: { asm: (gb) => { return `LD   D,D`; },
                func: (gb) => { gb.regs.d = gb.regs.d; }},
        0x53: { asm: (gb) => { return `LD   D,E`; },
                func: (gb) => { gb.regs.d = gb.regs.e; }},
        0x54: { asm: (gb) => { return `LD   D,H`; },
                func: (gb) => { gb.regs.d = gb.regs.h; }},
        0x55: { asm: (gb) => { return `LD   D,L`; },
                func: (gb) => { gb.regs.d = gb.regs.l; }},
        0x56: { asm: (gb) => { return `LD   D,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.d = Memory.readSByte(gb.mem, hl); }},
        0x57: { asm: (gb) => { return `LD   D,A`; },
                func: (gb) => { gb.regs.d = gb.regs.a; }},
        0x58: { asm: (gb) => { return `LD   E,B`; },
                func: (gb) => { gb.regs.e = gb.regs.b; }},
        0x59: { asm: (gb) => { return `LD   E,C`; },
                func: (gb) => { gb.regs.e = gb.regs.c; }},
        0x5a: { asm: (gb) => { return `LD   E,D`; },
                func: (gb) => { gb.regs.e = gb.regs.d; }},
        0x5b: { asm: (gb) => { return `LD   E,E`; },
                func: (gb) => { gb.regs.e = gb.regs.e; }},
        0x5c: { asm: (gb) => { return `LD   E,H`; },
                func: (gb) => { gb.regs.e = gb.regs.h; }},
        0x5d: { asm: (gb) => { return `LD   E,L`; },
                func: (gb) => { gb.regs.e = gb.regs.l; }},
        0x5e: { asm: (gb) => { return `LD   E,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.e = Memory.readSByte(gb.mem, hl); }},
        0x5f: { asm: (gb) => { return `LD   E,A`; },
                func: (gb) => { gb.regs.e = gb.regs.a; }},
        0x60: { asm: (gb) => { return `LD   H,B`; },
                func: (gb) => { gb.regs.h = gb.regs.b; }},
        0x61: { asm: (gb) => { return `LD   H,C`; },
                func: (gb) => { gb.regs.h = gb.regs.c; }},
        0x62: { asm: (gb) => { return `LD   H,D`; },
                func: (gb) => { gb.regs.h = gb.regs.d; }},
        0x63: { asm: (gb) => { return `LD   H,E`; },
                func: (gb) => { gb.regs.h = gb.regs.e; }},
        0x64: { asm: (gb) => { return `LD   H,H`; },
                func: (gb) => { gb.regs.h = gb.regs.h; }},
        0x65: { asm: (gb) => { return `LD   H,L`; },
                func: (gb) => { gb.regs.h = gb.regs.l; }},
        0x66: { asm: (gb) => { return `LD   H,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.h = Memory.readSByte(gb.mem, hl); }},
        0x67: { asm: (gb) => { return `LD   H,A`; },
                func: (gb) => { gb.regs.h = gb.regs.a; }},
        0x68: { asm: (gb) => { return `LD   L,B`; },
                func: (gb) => { gb.regs.l = gb.regs.b; }},
        0x69: { asm: (gb) => { return `LD   L,C`; },
                func: (gb) => { gb.regs.l = gb.regs.c; }},
        0x6a: { asm: (gb) => { return `LD   L,D`; },
                func: (gb) => { gb.regs.l = gb.regs.d; }},
        0x6b: { asm: (gb) => { return `LD   L,E`; },
                func: (gb) => { gb.regs.l = gb.regs.e; }},
        0x6c: { asm: (gb) => { return `LD   L,H`; },
                func: (gb) => { gb.regs.l = gb.regs.h; }},
        0x6d: { asm: (gb) => { return `LD   L,L`; },
                func: (gb) => { gb.regs.l = gb.regs.l; }},
        0x6e: { asm: (gb) => { return `LD   L,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.l = Memory.readSByte(gb.mem, hl); }},
        0x6f: { asm: (gb) => { return `LD   L,A`; },
                func: (gb) => { gb.regs.l = gb.regs.a; }},
        0x70: { asm: (gb) => { return `LD   (HL),B`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.b); }},
        0x71: { asm: (gb) => { return `LD   (HL),C`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.c); }},
        0x72: { asm: (gb) => { return `LD   (HL),D`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.d); }},
        0x73: { asm: (gb) => { return `LD   (HL),E`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.e); }},
        0x74: { asm: (gb) => { return `LD   (HL),H`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.h); }},
        0x75: { asm: (gb) => { return `LD   (HL),L`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.l); }},
        0x76: { asm: (gb) => { return "HALT"; },
                func: (gb) => { }},
        0x77: { asm: (gb) => { return `LD   (HL),A`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); Memory.writeByte(gb.mem, hl, gb.regs.a); }},
        0x78: { asm: (gb) => { return `LD   A,B`; },
                func: (gb) => { gb.regs.a = gb.regs.b; }},
        0x79: { asm: (gb) => { return `LD   A,C`; },
                func: (gb) => { gb.regs.a = gb.regs.c; }},
        0x7a: { asm: (gb) => { return `LD   A,D`; },
                func: (gb) => { gb.regs.a = gb.regs.d; }},
        0x7b: { asm: (gb) => { return `LD   A,E`; },
                func: (gb) => { gb.regs.a = gb.regs.e; }},
        0x7c: { asm: (gb) => { return `LD   A,H`; },
                func: (gb) => { gb.regs.a = gb.regs.h; }},
        0x7d: { asm: (gb) => { return `LD   A,L`; },
                func: (gb) => { gb.regs.a = gb.regs.l; }},
        0x7e: { asm: (gb) => { return `LD   A,(HL)`; },
                func: (gb) => { const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); gb.regs.a = Memory.readSByte(gb.mem, hl); }},
        0x7f: { asm: (gb) => { return `LD   A,A`; },
                func: (gb) => { gb.regs.a = gb.regs.a; }},
        0xaf: { asm: (gb) => { return "XOR  A"; },
                func: (gb) => { gb.regs.a ^= gb.regs.a; Register.updateFlags(gb, gb.regs.a, false); }},
        0xc3: { asm: (gb) => { return `JP   0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.pc = Gb.loadWord(gb); }},
        0xc9: { asm: (gb) => { return "RET"; },
                func: (gb) => { gb.regs.pc = Gb.popWord(gb); }},
        0xcd: { asm: (gb) => { return `CALL 0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { const n = Gb.loadWord(gb); Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = n; }},
        0xe0: { asm: (gb) => { return `LDH  0x${hexWord(0xff00 | Memory.readUByte(gb.mem, gb.regs.pc))},A`; },
                func: (gb) => { Memory.writeByte(gb.mem, 0xff00 | Gb.loadUByte(gb), gb.regs.a); }},
        0xe1: { asm: (gb) => { return `POP HL`; },
                func: (gb) => { gb.regs.l = Gb.pop(gb); gb.regs.h = Gb.pop(gb); }},
        0xe5: { asm: (gb) => { return `PUSH HL`; },
                func: (gb) => { Gb.push(gb, gb.regs.h); Gb.push(gb, gb.regs.l); }},
        0xea: { asm: (gb) => { return `LD  0x${hexWord(Memory.readUByte(gb.mem, gb.regs.pc+1) | Memory.readUByte(gb.mem, gb.regs.pc))},A`; },
                func: (gb) => { Memory.writeByte(gb.mem, Gb.loadWord(gb), gb.regs.a); }},
        0xf0: { asm: (gb) => { return `LDH  A,0x${hexWord(0xff00 | Memory.readUByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | Gb.loadUByte(gb)); }},
        0xf3: { asm: (gb) => { return "DI"; },
                func: (gb) => { gb.regs.ie = false; }},
        0xfe: { asm: (gb) => { return `CP   0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
                func: (gb) => { Register.updateFlags(gb, gb.regs.a-Gb.loadUByte(gb), true) }},
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