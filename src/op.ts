import { Gb } from "./gb.js";
import { Memory } from "./memory.js";
import { Register } from "./register.js";

export namespace Op {
    export const formatDisAsm = (op_code: number, gb: Gb.Env): string => {
        const pc_org = gb.regs.pc-1;  // デバッグ表示用

        try {
            const op_hex = hexByte(op_code);
            return `0x${hexWord(gb.regs.pc - 1)}: (${op_hex}):${op_code_map[op_code].asm(gb)}`;
        } catch (ex) {
            // not find instruction
            console.log("addr: 0x" + pc_org.toString(16) + " => op: 0x" + op_code.toString(16));
            throw ex;  // exit
        }
    };

    export const process_op_code = (op_code: number, gb: Gb.Env) => {
        const pc_org = gb.regs.pc-1;  // デバッグ表示用

        try {
            op_code_map[op_code].func(gb);
        } catch (ex) {
            // not find instruction
            console.log("addr: 0x" + pc_org.toString(16) + " => op: 0x" + op_code.toString(16));
            throw ex;  // exit
        }
    };

    const hexByte = (byte: number): string => { return ('00' + (byte & 0xff).toString(16)).slice(-2); };
    const hexWord = (word: number): string => { return ('0000' + (word & 0xffff).toString(16)).slice(-4); }

    const op_code_map: {
        [op_code: number]: {
            asm: (gb: Gb.Env) => string,
            func: (gb: Gb.Env) => void
        }
    } = {
        0x00: {
            asm: (gb) => { return "NOP"; },
            func: (gb) => { }
        },
        0x01: {
            asm: (gb) => { return `LD   BC,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.c = Gb.loadUByte(gb); gb.regs.b = Gb.loadUByte(gb); }
        },
        0x02: {
            asm: (gb) => { return `LD   (BC),A`; },
            func: (gb) => { const bc = (gb.regs.b << 8) | gb.regs.c; Memory.writeByte(gb.mem, bc, gb.regs.a); }
        },
        0x03: {
            asm: (gb) => { return `INC  BC`; },
            func: (gb) => { let bc = (gb.regs.b << 8) | gb.regs.c; bc++; gb.regs.b = (bc >> 8) & 0xff; gb.regs.c = bc & 0xff; }
        },
        0x04: {
            asm: (gb) => { return "INC  B"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.b & 0xf) + 1) >> 4); gb.regs.b = (gb.regs.b + 1) & 0xff; Register.checkZ(gb, gb.regs.b); Register.setN(gb, 0); }
        },
        0x05: {
            asm: (gb) => { return "DEC  B"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.b & 0xf) - 1) >> 4); gb.regs.b = (gb.regs.b - 1) & 0xff; Register.checkZ(gb, gb.regs.b); Register.setN(gb, 1); }
        },
        0x06: {
            asm: (gb) => { return `LD   B,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.b = Gb.loadUByte(gb); }
        },
        0x07: {
            asm: (gb) => { return `RLCA`; },
            func: (gb) => { const c = (gb.regs.a >> 7) & 0x1; gb.regs.a = ((gb.regs.a << 1) | c) & 0xff; Register.setZ(gb, 0); Register.setNHC(gb, 0, 0, c); }
        },
        0x08: {
            asm: (gb) => { return `LD   ${hexWord(Memory.readWord(gb.mem, gb.regs.pc))},SP`; },
            func: (gb) => { const addr = Gb.loadWord(gb); Memory.writeByte(gb.mem, addr, gb.regs.sp & 0xff); Memory.writeByte(gb.mem, addr+1, (gb.regs.sp >> 8) & 0xff); }
        },
        0x09: {
            asm: (gb) => { return `ADD  HL,BC`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const n = (gb.regs.b << 8) | gb.regs.c; Register.setN(gb, 0); Register.setH(gb, ((hl & 0xfff) + (n & 0xfff)) >> 12); Register.setC(gb, (hl + n) >> 16); hl += n; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff;}
        },
        0x0a: {
            asm: (gb) => { return `LD   A,(BC)`; },
            func: (gb) => { const bc = (gb.regs.b << 8) | gb.regs.c; gb.regs.a = Memory.readUByte(gb.mem, bc); }
        },
        0x0b: {
            asm: (gb) => { return `DEC  BC`; },
            func: (gb) => { let bc = (gb.regs.b << 8) | gb.regs.c; bc--; gb.regs.b = (bc >> 8) & 0xff; gb.regs.c = bc & 0xff; }
        },
        0x0c: {
            asm: (gb) => { return "INC  C"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.c & 0xf) + 1) >> 4); gb.regs.c = (gb.regs.c + 1) & 0xff; Register.checkZ(gb, gb.regs.c); Register.setN(gb, 0); }
        },
        0x0d: {
            asm: (gb) => { return "DEC  C"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.c & 0xf) - 1) >> 4); gb.regs.c = (gb.regs.c - 1) & 0xff; Register.checkZ(gb, gb.regs.c); Register.setN(gb, 1); }
        },
        0x0e: {
            asm: (gb) => { return `LD   C,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.c = Gb.loadUByte(gb); }
        },
        0x0f: {
            asm: (gb) => { return `RRCA`; },
            func: (gb) => { const c = gb.regs.a & 0x1; gb.regs.a = ((gb.regs.a >> 1) | (c << 7)) & 0xff; Register.setZ(gb, 0); Register.setNHC(gb, 0, 0, c); }
        },
        0x10: {
            asm: (gb) => { return `STOP`; },
            func: (gb) => { }
        },
        0x11: {
            asm: (gb) => { return `LD   DE,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.e = Gb.loadUByte(gb); gb.regs.d = Gb.loadUByte(gb); }
        },
        0x12: {
            asm: (gb) => { return `LD   (DE),A`; },
            func: (gb) => { const de = (gb.regs.d << 8) | gb.regs.e; Memory.writeByte(gb.mem, de, gb.regs.a); }
        },
        0x13: {
            asm: (gb) => { return `INC  DE`; },
            func: (gb) => { let de = (gb.regs.d << 8) | gb.regs.e; de++; gb.regs.d = (de >> 8) & 0xff; gb.regs.e = de & 0xff; }
        },
        0x14: {
            asm: (gb) => { return `INC  D`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.d & 0xf) + 1) >> 4); gb.regs.d = (gb.regs.d + 1) & 0xff; Register.checkZ(gb, gb.regs.d); Register.setN(gb, 0); }
        },
        0x15: {
            asm: (gb) => { return `DEC  D`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.d & 0xf) - 1) >> 4); gb.regs.d = (gb.regs.d - 1) & 0xff; Register.checkZ(gb, gb.regs.d); Register.setN(gb, 1); }
        },
        0x16: {
            asm: (gb) => { return `LD   D,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.d = Gb.loadUByte(gb); }
        },
        0x17: {
            asm: (gb) => { return `RLA`; },
            func: (gb) => { const c = (gb.regs.a >> 7) & 0x1; gb.regs.a = ((gb.regs.a << 1) | (gb.flags.carry ? 1 : 0)) & 0xff; Register.setZ(gb, 0); Register.setNHC(gb, 0, 0, c); }
        },
        0x18: {
            asm: (gb) => { return `JR   0x${hexWord(gb.regs.pc + 1 + Memory.readSByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadSByte(gb); gb.regs.pc += n; }
        },
        0x19: {
            asm: (gb) => { return `ADD  HL,DE`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const n = (gb.regs.d << 8) | gb.regs.e; Register.setN(gb, 0); Register.setH(gb, ((hl & 0xfff) + (n & 0xfff)) >> 12); Register.setC(gb, (hl + n) >> 16); hl += n; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff;}
        },
        0x1a: {
            asm: (gb) => { return `LD   A,(DE)`; },
            func: (gb) => { const de = (gb.regs.d << 8) | gb.regs.e; gb.regs.a = Memory.readUByte(gb.mem, de); }
        },
        0x1b: {
            asm: (gb) => { return `DEC  DE`; },
            func: (gb) => { let de = (gb.regs.d << 8) | gb.regs.e; de--; gb.regs.d = (de >> 8) & 0xff; gb.regs.e = de & 0xff; }
        },
        0x1c: {
            asm: (gb) => { return `INC  E`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.e & 0xf) + 1) >> 4); gb.regs.e = (gb.regs.e + 1) & 0xff; Register.checkZ(gb, gb.regs.e); Register.setN(gb, 0); }
        },
        0x1d: {
            asm: (gb) => { return `DEC  E`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.e & 0xf) - 1) >> 4); gb.regs.e = (gb.regs.e - 1) & 0xff; Register.checkZ(gb, gb.regs.e); Register.setN(gb, 1); }
        },
        0x1e: {
            asm: (gb) => { return `LD   E,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.e = Gb.loadUByte(gb); }
        },
        0x1f: {
            asm: (gb) => { return `RRA`; },
            func: (gb) => { const c = gb.regs.a & 0x1; gb.regs.a = ((gb.regs.a >> 1) | ((gb.flags.carry ? 1 : 0) << 7)) & 0xff; Register.setZ(gb, 0); Register.setNHC(gb, 0, 0, c); }
        },
        0x20: {
            asm: (gb) => { return `JR   NZ,0x${hexWord(gb.regs.pc + 1 + Memory.readSByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadSByte(gb); if (!gb.flags.zero) gb.regs.pc += n; }
        },
        0x21: {
            asm: (gb) => { return `LD   HL,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc + 1))}${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.l = Gb.loadUByte(gb); gb.regs.h = Gb.loadUByte(gb); }
        },
        0x22: {
            asm: (gb) => { return `LD   (HL+),A`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.a); hl++; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x23: {
            asm: (gb) => { return `INC  HL`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; hl++; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x24: {
            asm: (gb) => { return `INC  H`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.h & 0xf) + 1) >> 4); gb.regs.h = (gb.regs.h + 1) & 0xff; Register.checkZ(gb, gb.regs.h); Register.setN(gb, 0); }
        },
        0x25: {
            asm: (gb) => { return `DEC  H`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.h & 0xf) - 1) >> 4); gb.regs.h = (gb.regs.h - 1) & 0xff; Register.checkZ(gb, gb.regs.h); Register.setN(gb, 1); }
        },
        0x26: {
            asm: (gb) => { return `LD   H,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.h = Gb.loadUByte(gb); }
        },
        0x27: {
            asm: (gb) => { return `DAA`; },
            func: (gb) => {
                let n = gb.regs.a;
                let c = 0;
                if (gb.flags.add_sub) {
                    if(gb.flags.half_carry) n = (n - 0x06) & 0xff;
                    if(gb.flags.carry){ n -= 0x60; c = 1; }
                } else {
                    if(gb.flags.half_carry || (n & 0x0f) > 0x09) n += 0x06;
                    if(gb.flags.carry || n > 0x9f){ n += 0x60; c = 1; }
                }
                gb.regs.a = n & 0xff; Register.checkZ(gb, gb.regs.a); Register.setH(gb, 0); Register.setC(gb, c);
            }
        },
        0x28: {
            asm: (gb) => { return `JR   Z,0x${hexWord(gb.regs.pc + 1 + Memory.readSByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadSByte(gb); if (gb.flags.zero) gb.regs.pc += n; }
        },
        0x29: {
            asm: (gb) => { return `ADD  HL,HL`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const n = hl; Register.setN(gb, 0); Register.setH(gb, ((hl & 0xfff) + (n & 0xfff)) >> 12); Register.setC(gb, (hl + n) >> 16); hl += n; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff;}
        },
        0x2a: {
            asm: (gb) => { return `LD   A,(HL+)`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = Memory.readUByte(gb.mem, hl); hl++; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x2b: {
            asm: (gb) => { return `DEC  HL`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; hl--; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x2c: {
            asm: (gb) => { return `INC  L`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.l & 0xf) + 1) >> 4); gb.regs.l = (gb.regs.l + 1) & 0xff; Register.checkZ(gb, gb.regs.l); Register.setN(gb, 0); }
        },
        0x2d: {
            asm: (gb) => { return `DEC  L`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.l & 0xf) - 1) >> 4); gb.regs.l = (gb.regs.l - 1) & 0xff; Register.checkZ(gb, gb.regs.l); Register.setN(gb, 1); }
        },
        0x2e: {
            asm: (gb) => { return `LD   L,${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.l = Gb.loadUByte(gb); }
        },
        0x2f: {
            asm: (gb) => { return `CPL`; },
            func: (gb) => { gb.regs.a = ~gb.regs.a; Register.setNH(gb, 1, 1); }
        },
        0x30: {
            asm: (gb) => { return `JR   NC,0x${hexWord(gb.regs.pc + 1 + Memory.readSByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadSByte(gb); if (!gb.flags.carry) gb.regs.pc += n; }
        },
        0x31: {
            asm: (gb) => { return `LD   SP,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.sp = Gb.loadWord(gb); }
        },
        0x32: {
            asm: (gb) => { return `LD   (HL-),A`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.a); hl--; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x33: {
            asm: (gb) => { return `INC  SP`; },
            func: (gb) => { gb.regs.sp++; }
        },
        0x34: {
            asm: (gb) => { return `INC  (HL)`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Memory.writeByte(gb.mem, hl, n + 1); Register.setN(gb, 0); Register.checkZ(gb, (n + 1) & 0xff); Register.setH(gb, ((n & 0xf) + 1) >> 4); }
        },
        0x35: {
            asm: (gb) => { return `DEC  (HL)`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Memory.writeByte(gb.mem, hl, n - 1); Register.setN(gb, 1); Register.checkZ(gb, (n - 1) & 0xff); Register.setH(gb, ((n & 0x0f) - 1) >> 4); }
        },
        0x36: {
            asm: (gb) => { return `LD   (HL),${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, Gb.loadUByte(gb)); }
        },
        0x37: {
            asm: (gb) => { return `SCF`; },
            func: (gb) => { Register.setNHC(gb, 0, 0, 1); }
        },
        0x38: {
            asm: (gb) => { return `JR   C,0x${hexWord(gb.regs.pc + 1 + Memory.readSByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadSByte(gb); if (gb.flags.carry) gb.regs.pc += n; }
        },
        0x39: {
            asm: (gb) => { return `ADD  HL,SP`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; const v = gb.regs.sp; Register.setN(gb, 0); Register.setH(gb, ((hl & 0xfff) + (v & 0xfff)) >> 12); Register.setC(gb, (hl + v) >> 16); hl += v; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff;}
        },
        0x3a: {
            asm: (gb) => { return `LD   A,(HL-)`; },
            func: (gb) => { let hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = Memory.readUByte(gb.mem, hl); hl--; gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0x3b: {
            asm: (gb) => { return `DEC  SP`; },
            func: (gb) => { gb.regs.sp--; }
        },
        0x3c: {
            asm: (gb) => { return `INC  A`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + 1) >> 4); gb.regs.a = (gb.regs.a + 1) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x3d: {
            asm: (gb) => { return `DEC  A`; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - 1) >> 4); gb.regs.a = (gb.regs.a - 1) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x3e: {
            asm: (gb) => { return `LD   A,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.a = Gb.loadUByte(gb); }
        },
        0x3f: {
            asm: (gb) => { return `CCF`; },
            func: (gb) => { Register.setNHC(gb, 0, 0, gb.flags.carry ? 0 : 1); }
        },
        0x40: {
            asm: (gb) => { return `LD   B,B`; },
            func: (gb) => { gb.regs.b = gb.regs.b }
        },
        0x41: {
            asm: (gb) => { return `LD   B,C`; },
            func: (gb) => { gb.regs.b = gb.regs.c; }
        },
        0x42: {
            asm: (gb) => { return `LD   B,D`; },
            func: (gb) => { gb.regs.b = gb.regs.d; }
        },
        0x43: {
            asm: (gb) => { return `LD   B,E`; },
            func: (gb) => { gb.regs.b = gb.regs.e; }
        },
        0x44: {
            asm: (gb) => { return `LD   B,H`; },
            func: (gb) => { gb.regs.b = gb.regs.h; }
        },
        0x45: {
            asm: (gb) => { return `LD   B,L`; },
            func: (gb) => { gb.regs.b = gb.regs.l; }
        },
        0x46: {
            asm: (gb) => { return `LD   B,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.b = Memory.readUByte(gb.mem, hl); }
        },
        0x47: {
            asm: (gb) => { return `LD   B,A`; },
            func: (gb) => { gb.regs.b = gb.regs.a; }
        },
        0x48: {
            asm: (gb) => { return `LD   C,B`; },
            func: (gb) => { gb.regs.c = gb.regs.b; }
        },
        0x49: {
            asm: (gb) => { return `LD   C,C`; },
            func: (gb) => { gb.regs.c = gb.regs.c; }
        },
        0x4a: {
            asm: (gb) => { return `LD   C,D`; },
            func: (gb) => { gb.regs.c = gb.regs.d; }
        },
        0x4b: {
            asm: (gb) => { return `LD   C,E`; },
            func: (gb) => { gb.regs.c = gb.regs.e; }
        },
        0x4c: {
            asm: (gb) => { return `LD   C,H`; },
            func: (gb) => { gb.regs.c = gb.regs.h; }
        },
        0x4d: {
            asm: (gb) => { return `LD   C,L`; },
            func: (gb) => { gb.regs.c = gb.regs.l; }
        },
        0x4e: {
            asm: (gb) => { return `LD   C,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.c = Memory.readUByte(gb.mem, hl); }
        },
        0x4f: {
            asm: (gb) => { return `LD   C,A`; },
            func: (gb) => { gb.regs.c = gb.regs.a; }
        },
        0x50: {
            asm: (gb) => { return `LD   D,B`; },
            func: (gb) => { gb.regs.d = gb.regs.b; }
        },
        0x51: {
            asm: (gb) => { return `LD   D,C`; },
            func: (gb) => { gb.regs.d = gb.regs.c; }
        },
        0x52: {
            asm: (gb) => { return `LD   D,D`; },
            func: (gb) => { gb.regs.d = gb.regs.d; }
        },
        0x53: {
            asm: (gb) => { return `LD   D,E`; },
            func: (gb) => { gb.regs.d = gb.regs.e; }
        },
        0x54: {
            asm: (gb) => { return `LD   D,H`; },
            func: (gb) => { gb.regs.d = gb.regs.h; }
        },
        0x55: {
            asm: (gb) => { return `LD   D,L`; },
            func: (gb) => { gb.regs.d = gb.regs.l; }
        },
        0x56: {
            asm: (gb) => { return `LD   D,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.d = Memory.readUByte(gb.mem, hl); }
        },
        0x57: {
            asm: (gb) => { return `LD   D,A`; },
            func: (gb) => { gb.regs.d = gb.regs.a; }
        },
        0x58: {
            asm: (gb) => { return `LD   E,B`; },
            func: (gb) => { gb.regs.e = gb.regs.b; }
        },
        0x59: {
            asm: (gb) => { return `LD   E,C`; },
            func: (gb) => { gb.regs.e = gb.regs.c; }
        },
        0x5a: {
            asm: (gb) => { return `LD   E,D`; },
            func: (gb) => { gb.regs.e = gb.regs.d; }
        },
        0x5b: {
            asm: (gb) => { return `LD   E,E`; },
            func: (gb) => { gb.regs.e = gb.regs.e; }
        },
        0x5c: {
            asm: (gb) => { return `LD   E,H`; },
            func: (gb) => { gb.regs.e = gb.regs.h; }
        },
        0x5d: {
            asm: (gb) => { return `LD   E,L`; },
            func: (gb) => { gb.regs.e = gb.regs.l; }
        },
        0x5e: {
            asm: (gb) => { return `LD   E,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.e = Memory.readUByte(gb.mem, hl); }
        },
        0x5f: {
            asm: (gb) => { return `LD   E,A`; },
            func: (gb) => { gb.regs.e = gb.regs.a; }
        },
        0x60: {
            asm: (gb) => { return `LD   H,B`; },
            func: (gb) => { gb.regs.h = gb.regs.b; }
        },
        0x61: {
            asm: (gb) => { return `LD   H,C`; },
            func: (gb) => { gb.regs.h = gb.regs.c; }
        },
        0x62: {
            asm: (gb) => { return `LD   H,D`; },
            func: (gb) => { gb.regs.h = gb.regs.d; }
        },
        0x63: {
            asm: (gb) => { return `LD   H,E`; },
            func: (gb) => { gb.regs.h = gb.regs.e; }
        },
        0x64: {
            asm: (gb) => { return `LD   H,H`; },
            func: (gb) => { gb.regs.h = gb.regs.h; }
        },
        0x65: {
            asm: (gb) => { return `LD   H,L`; },
            func: (gb) => { gb.regs.h = gb.regs.l; }
        },
        0x66: {
            asm: (gb) => { return `LD   H,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.h = Memory.readUByte(gb.mem, hl); }
        },
        0x67: {
            asm: (gb) => { return `LD   H,A`; },
            func: (gb) => { gb.regs.h = gb.regs.a; }
        },
        0x68: {
            asm: (gb) => { return `LD   L,B`; },
            func: (gb) => { gb.regs.l = gb.regs.b; }
        },
        0x69: {
            asm: (gb) => { return `LD   L,C`; },
            func: (gb) => { gb.regs.l = gb.regs.c; }
        },
        0x6a: {
            asm: (gb) => { return `LD   L,D`; },
            func: (gb) => { gb.regs.l = gb.regs.d; }
        },
        0x6b: {
            asm: (gb) => { return `LD   L,E`; },
            func: (gb) => { gb.regs.l = gb.regs.e; }
        },
        0x6c: {
            asm: (gb) => { return `LD   L,H`; },
            func: (gb) => { gb.regs.l = gb.regs.h; }
        },
        0x6d: {
            asm: (gb) => { return `LD   L,L`; },
            func: (gb) => { gb.regs.l = gb.regs.l; }
        },
        0x6e: {
            asm: (gb) => { return `LD   L,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.l = Memory.readUByte(gb.mem, hl); }
        },
        0x6f: {
            asm: (gb) => { return `LD   L,A`; },
            func: (gb) => { gb.regs.l = gb.regs.a; }
        },
        0x70: {
            asm: (gb) => { return `LD   (HL),B`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.b); }
        },
        0x71: {
            asm: (gb) => { return `LD   (HL),C`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.c); }
        },
        0x72: {
            asm: (gb) => { return `LD   (HL),D`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.d); }
        },
        0x73: {
            asm: (gb) => { return `LD   (HL),E`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.e); }
        },
        0x74: {
            asm: (gb) => { return `LD   (HL),H`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.h); }
        },
        0x75: {
            asm: (gb) => { return `LD   (HL),L`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.l); }
        },
        0x76: {
            asm: (gb) => { return "HALT"; },
            func: (gb) => { gb.halt = true; }
        },
        0x77: {
            asm: (gb) => { return `LD   (HL),A`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; Memory.writeByte(gb.mem, hl, gb.regs.a); }
        },
        0x78: {
            asm: (gb) => { return `LD   A,B`; },
            func: (gb) => { gb.regs.a = gb.regs.b; }
        },
        0x79: {
            asm: (gb) => { return `LD   A,C`; },
            func: (gb) => { gb.regs.a = gb.regs.c; }
        },
        0x7a: {
            asm: (gb) => { return `LD   A,D`; },
            func: (gb) => { gb.regs.a = gb.regs.d; }
        },
        0x7b: {
            asm: (gb) => { return `LD   A,E`; },
            func: (gb) => { gb.regs.a = gb.regs.e; }
        },
        0x7c: {
            asm: (gb) => { return `LD   A,H`; },
            func: (gb) => { gb.regs.a = gb.regs.h; }
        },
        0x7d: {
            asm: (gb) => { return `LD   A,L`; },
            func: (gb) => { gb.regs.a = gb.regs.l; }
        },
        0x7e: {
            asm: (gb) => { return `LD   A,(HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = Memory.readUByte(gb.mem, hl); }
        },
        0x7f: {
            asm: (gb) => { return `LD   A,A`; },
            func: (gb) => { gb.regs.a = gb.regs.a; }
        },
        0x80: {
            asm: (gb) => { return "ADD  A,B"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.b & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.b) >> 8); gb.regs.a = (gb.regs.a + gb.regs.b) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x81: {
            asm: (gb) => { return "ADD  A,C"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.c & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x82: {
            asm: (gb) => { return "ADD  A,D"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.d & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.d) >> 8); gb.regs.a = (gb.regs.a + gb.regs.d) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x83: {
            asm: (gb) => { return "ADD  A,E"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.e & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.e) >> 8); gb.regs.a = (gb.regs.a + gb.regs.e) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x84: {
            asm: (gb) => { return "ADD  A,H"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.h & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.h) >> 8); gb.regs.a = (gb.regs.a + gb.regs.h) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x85: {
            asm: (gb) => { return "ADD  A,L"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.l & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.l) >> 8); gb.regs.a = (gb.regs.a + gb.regs.l) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x86: {
            asm: (gb) => { return "ADD  A,(HL)"; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Register.setH(gb, ((gb.regs.a & 0xf) + (n & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + n) >> 8); gb.regs.a = (gb.regs.a + n) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x87: {
            asm: (gb) => { return "ADD  A,A"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.a & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.a) >> 8); gb.regs.a = (gb.regs.a + gb.regs.a) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x88: {
            asm: (gb) => { return "ADC  A,B"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.b & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.b + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.b + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x89: {
            asm: (gb) => { return "ADC  A,C"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.c & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.c + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.c + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8a: {
            asm: (gb) => { return "ADC  A,D"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.d & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.d + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.d + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8b: {
            asm: (gb) => { return "ADC  A,E"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.e & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.e + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.e + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8c: {
            asm: (gb) => { return "ADC  A,H"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.h & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.h + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.h + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8d: {
            asm: (gb) => { return "ADC  A,L"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.l & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.l + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.l + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8e: {
            asm: (gb) => { return "ADC  A,(HL)"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; const hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Register.setH(gb, ((gb.regs.a & 0xf) + (n & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + n + c) >> 8); gb.regs.a = (gb.regs.a + n + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x8f: {
            asm: (gb) => { return "ADC  A,A"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (gb.regs.a & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + gb.regs.a + c) >> 8); gb.regs.a = (gb.regs.a + gb.regs.a + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0x90: {
            asm: (gb) => { return "SUB  A,B"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.b & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.b) >> 8); gb.regs.a = (gb.regs.a - gb.regs.b) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x91: {
            asm: (gb) => { return "SUB  A,C"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.c & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x92: {
            asm: (gb) => { return "SUB  A,D"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.d & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.d) >> 8); gb.regs.a = (gb.regs.a - gb.regs.d) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x93: {
            asm: (gb) => { return "SUB  A,E"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.e & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.e) >> 8); gb.regs.a = (gb.regs.a - gb.regs.e) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x94: {
            asm: (gb) => { return "SUB  A,H"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.h & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.h) >> 8); gb.regs.a = (gb.regs.a - gb.regs.h) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x95: {
            asm: (gb) => { return "SUB  A,L"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.l & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.l) >> 8); gb.regs.a = (gb.regs.a - gb.regs.l) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x96: {
            asm: (gb) => { return "SUB  A,(HL)"; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Register.setH(gb, ((gb.regs.a & 0xf) - (n & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - n) >> 8); gb.regs.a = (gb.regs.a - n) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x97: {
            asm: (gb) => { return "SUB  A,A"; },
            func: (gb) => { Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.a & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.a) >> 8); gb.regs.a = (gb.regs.a - gb.regs.a) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x98: {
            asm: (gb) => { return "SBC  A,B"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.b & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.b - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.b - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x99: {
            asm: (gb) => { return "SBC  A,C"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.c & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.c - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.c - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9a: {
            asm: (gb) => { return "SBC  A,D"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.d & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.d - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.d - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9b: {
            asm: (gb) => { return "SBC  A,E"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.e & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.e - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.e - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9c: {
            asm: (gb) => { return "SBC  A,H"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.h & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.h - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.h - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9d: {
            asm: (gb) => { return "SBC  A,L"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.l & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.l - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.l - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9e: {
            asm: (gb) => { return "SBC  A,(HL)"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; const hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Register.setH(gb, ((gb.regs.a & 0xf) - (n & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - n - c) >> 8); gb.regs.a = (gb.regs.a - n - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0x9f: {
            asm: (gb) => { return "SBC  A,A"; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.a & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.a - c) >> 8); gb.regs.a = (gb.regs.a - gb.regs.a - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0xa0: {
            asm: (gb) => { return "AND  B"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.b) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa1: {
            asm: (gb) => { return "AND  C"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.c) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa2: {
            asm: (gb) => { return "AND  D"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.d) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa3: {
            asm: (gb) => { return "AND  E"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.e) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa4: {
            asm: (gb) => { return "AND  H"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.h) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa5: {
            asm: (gb) => { return "AND  L"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.l) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa6: {
            asm: (gb) => { return "AND  (HL)"; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = (gb.regs.a & Memory.readUByte(gb.mem, hl)) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa7: {
            asm: (gb) => { return "AND  A"; },
            func: (gb) => { gb.regs.a = (gb.regs.a & gb.regs.a) & 0xff; Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa8: {
            asm: (gb) => { return "XOR  B"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.b) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xa9: {
            asm: (gb) => { return "XOR  C"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.c) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xaa: {
            asm: (gb) => { return "XOR  D"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.d) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xab: {
            asm: (gb) => { return "XOR  E"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.e) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xac: {
            asm: (gb) => { return "XOR  H"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.h) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xad: {
            asm: (gb) => { return "XOR  L"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.l) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xae: {
            asm: (gb) => { return `XOR  (HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = (gb.regs.a ^ Memory.readUByte(gb.mem, hl)) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xaf: {
            asm: (gb) => { return "XOR  A"; },
            func: (gb) => { gb.regs.a = (gb.regs.a ^ gb.regs.a) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb0: {
            asm: (gb) => { return "OR   B"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.b) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb1: {
            asm: (gb) => { return "OR   C"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.c) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb2: {
            asm: (gb) => { return "OR   D"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.d) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb3: {
            asm: (gb) => { return "OR   E"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.e) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb4: {
            asm: (gb) => { return "OR   H"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.h) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb5: {
            asm: (gb) => { return "OR   L"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.l) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb6: {
            asm: (gb) => { return "OR   (HL)"; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.a = (gb.regs.a | Memory.readUByte(gb.mem, hl)) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb7: {
            asm: (gb) => { return "OR   A"; },
            func: (gb) => { gb.regs.a = (gb.regs.a | gb.regs.a) & 0xff; Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xb8: {
            asm: (gb) => { return `CP   B`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.b); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.b & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.b) >> 8); }
        },
        0xb9: {
            asm: (gb) => { return `CP   C`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.c); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.c & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.c) >> 8); }
        },
        0xba: {
            asm: (gb) => { return `CP   D`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.d); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.d & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.d) >> 8); }
        },
        0xbb: {
            asm: (gb) => { return `CP   E`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.e); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.e & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.e) >> 8); }
        },
        0xbc: {
            asm: (gb) => { return `CP   H`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.h); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.h & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.h) >> 8); }
        },
        0xbd: {
            asm: (gb) => { return `CP   L`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.l); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.l & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.l) >> 8); }
        },
        0xbe: {
            asm: (gb) => { return `CP   (HL)`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; const n = Memory.readUByte(gb.mem, hl); Register.checkZ(gb, gb.regs.a - n); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (n & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - n) >> 8); }
        },
        0xbf: {
            asm: (gb) => { return `CP   A`; },
            func: (gb) => { Register.checkZ(gb, gb.regs.a - gb.regs.a); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0xf) - (gb.regs.a & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - gb.regs.a) >> 8); }
        },
        0xc0: {
            asm: (gb) => { return "RET  NZ"; },
            func: (gb) => { if(!gb.flags.zero) gb.regs.pc = Gb.popWord(gb); }
        },
        0xc1: {
            asm: (gb) => { return `POP  BC`; },
            func: (gb) => { gb.regs.c = Gb.pop(gb); gb.regs.b = Gb.pop(gb); }
        },
        0xc2: {
            asm: (gb) => { return `JP   NZ,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(!gb.flags.zero) gb.regs.pc = addr; }
        },
        0xc3: {
            asm: (gb) => { return `JP   0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.pc = Gb.loadWord(gb); }
        },
        0xc4: {
            asm: (gb) => { return `CALL NZ,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadWord(gb); if (!gb.flags.zero) { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = n; } }
        },
        0xc5: {
            asm: (gb) => { return `PUSH BC`; },
            func: (gb) => { Gb.push(gb, gb.regs.b); Gb.push(gb, gb.regs.c); }
        },
        0xc6: {
            asm: (gb) => { return `ADD  A,${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadUByte(gb); Register.setH(gb, ((gb.regs.a & 0xf) + (n & 0xf)) >> 4); Register.setC(gb, (gb.regs.a + n) >> 8); gb.regs.a = (gb.regs.a + n) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0xc7: {
            asm: (gb) => { return `RST  0x00`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x00; }
        },
        0xc8: {
            asm: (gb) => { return "RET  Z"; },
            func: (gb) => { if(gb.flags.zero) gb.regs.pc = Gb.popWord(gb); }
        },
        0xc9: {
            asm: (gb) => { return "RET"; },
            func: (gb) => { gb.regs.pc = Gb.popWord(gb); }
        },
        0xca: {
            asm: (gb) => { return `JP   Z,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(gb.flags.zero) gb.regs.pc = addr; }
        },
        0xcc: {
            asm: (gb) => { return `CALL Z,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(gb.flags.zero){ Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = addr; } }
        },
        0xcd: {
            asm: (gb) => { return `CALL 0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = addr; }
        },
        0xce: {
            asm: (gb) => { return `ADC  A,0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadUByte(gb); const c = gb.flags.carry ? 1 : 0; Register.setH(gb, ((gb.regs.a & 0xf) + (n & 0xf) + c) >> 4); Register.setC(gb, (gb.regs.a + n + c) >> 8); gb.regs.a = (gb.regs.a + n + c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 0); }
        },
        0xcf: {
            asm: (gb) => { return `RST  0x08`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x08; }
        },
        0xd0: {
            asm: (gb) => { return "RET  NC"; },
            func: (gb) => { if(!gb.flags.carry) gb.regs.pc = Gb.popWord(gb); }
        },
        0xd1: {
            asm: (gb) => { return `POP  DE`; },
            func: (gb) => { gb.regs.e = Gb.pop(gb); gb.regs.d = Gb.pop(gb); }
        },
        0xd2: {
            asm: (gb) => { return `JP   NC,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(!gb.flags.carry) gb.regs.pc = addr; }
        },
        0xd4: {
            asm: (gb) => { return `CALL NC,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(!gb.flags.carry){ Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = addr; } }
        },
        0xd5: {
            asm: (gb) => { return `PUSH DE`; },
            func: (gb) => { Gb.push(gb, gb.regs.d); Gb.push(gb, gb.regs.e); }
        },
        0xd6: {
            asm: (gb) => { return `SUB  ${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const n = Gb.loadUByte(gb); Register.setH(gb, ((gb.regs.a & 0xf) - (n & 0xf)) >> 4); Register.setC(gb, (gb.regs.a - n) >> 8); gb.regs.a = (gb.regs.a - n) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0xd7: {
            asm: (gb) => { return `RST  0x10`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x10; }
        },
        0xd8: {
            asm: (gb) => { return "RET  C"; },
            func: (gb) => { if(gb.flags.carry) gb.regs.pc = Gb.popWord(gb); }
        },
        0xd9: {
            asm: (gb) => { return "RETI"; },
            func: (gb) => { gb.regs.pc = Gb.popWord(gb); gb.regs.ie = true; }
        },
        0xda: {
            asm: (gb) => { return `JP   C,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(gb.flags.carry) gb.regs.pc = addr; }
        },
        0xdc: {
            asm: (gb) => { return `CALL C,0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const addr = Gb.loadWord(gb); if(gb.flags.carry){ Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = addr; } }
        },
        0xde: {
            asm: (gb) => { return `SBC  A,${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const c = gb.flags.carry ? 1 : 0; const v = Gb.loadUByte(gb); Register.setH(gb, ((gb.regs.a & 0xf) - (v & 0xf) - c) >> 4); Register.setC(gb, (gb.regs.a - v - c) >> 8); gb.regs.a = (gb.regs.a - v - c) & 0xff; Register.checkZ(gb, gb.regs.a); Register.setN(gb, 1); }
        },
        0xdf: {
            asm: (gb) => { return `RST  0x18`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x18; }
        },
        0xe0: {
            asm: (gb) => { return `LDH  0x${hexWord(0xff00 | Memory.readUByte(gb.mem, gb.regs.pc))},A`; },
            func: (gb) => { Memory.writeByte(gb.mem, 0xff00 | Gb.loadUByte(gb), gb.regs.a); }
        },
        0xe1: {
            asm: (gb) => { return `POP  HL`; },
            func: (gb) => { gb.regs.l = Gb.pop(gb); gb.regs.h = Gb.pop(gb); }
        },
        0xe2: {
            asm: (gb) => { return `LD   (C),A`; },
            func: (gb) => { Memory.writeByte(gb.mem, 0xff00 | gb.regs.c, gb.regs.a); }
        },
        0xe5: {
            asm: (gb) => { return `PUSH HL`; },
            func: (gb) => { Gb.push(gb, gb.regs.h); Gb.push(gb, gb.regs.l); }
        },
        0xe6: {
            asm: (gb) => { return `AND  ${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.a &= Gb.loadUByte(gb); Register.setNHC(gb, 0, 1, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xe7: {
            asm: (gb) => { return `RST  0x20`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x20; }
        },
        0xe8: {
            asm: (gb) => { return `ADD  SP,${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const v = Gb.loadSByte(gb); Register.setZ(gb, 0); Register.setN(gb, 0); Register.setH(gb, ((gb.regs.sp & 0x0f) + (v & 0x0f)) >> 4); Register.setC(gb, ((gb.regs.sp & 0xff) + (v & 0xff)) >> 8); gb.regs.sp = (gb.regs.sp + v) & 0xffff; }
        },
        0xe9: {
            asm: (gb) => { return `JP   (HL)`; },
            func: (gb) => { gb.regs.pc = (gb.regs.h << 8) | gb.regs.l; }
        },
        0xea: {
            asm: (gb) => { return `LD   0x${hexWord(Memory.readWord(gb.mem, gb.regs.pc))},A`; },
            func: (gb) => { Memory.writeByte(gb.mem, Gb.loadWord(gb), gb.regs.a); }
        },
        0xee: {
            asm: (gb) => { return `XOR  0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc + 1) | Memory.readUByte(gb.mem, gb.regs.pc))},A`; },
            func: (gb) => { gb.regs.a ^= Gb.loadUByte(gb); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xef: {
            asm: (gb) => { return `RST  0x28`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x28; }
        },
        0xf0: {
            asm: (gb) => { return `LDH  A,0x${hexWord(0xff00 | Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | Gb.loadUByte(gb)); }
        },
        0xf1: {
            asm: (gb) => { return `POP  AF`; },
            func: (gb) => { Register.byteToFlags(gb, Gb.pop(gb)); gb.regs.a = Gb.pop(gb); }
        },
        0xf2: {
            asm: (gb) => { return `LD   A,(C)`; },
            func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, 0xff00 | gb.regs.c); }
        },
        0xf3: {
            asm: (gb) => { return "DI"; },
            func: (gb) => { gb.regs.ie = false; }
        },
        0xf5: {
            asm: (gb) => { return `PUSH AF`; },
            func: (gb) => { Gb.push(gb, gb.regs.a); Gb.push(gb, Register.flagsToByte(gb)); }
        },
        0xf6: {
            asm: (gb) => { return `OR  ${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.a |= Gb.loadUByte(gb); Register.setNHC(gb, 0, 0, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0xf7: {
            asm: (gb) => { return `RST  0x30`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x30; }
        },
        0xf8: {
            asm: (gb) => { return `ADD  HL,SP+0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const v = Gb.loadSByte(gb); Register.setZ(gb, 0); Register.setN(gb, 0); Register.setH(gb, ((gb.regs.sp & 0x0f) + (v & 0x0f)) >> 4); Register.setC(gb, ((gb.regs.sp & 0xff) + (v & 0xff)) >> 8); const hl = (gb.regs.sp + v); gb.regs.h = (hl >> 8) & 0xff; gb.regs.l = hl & 0xff; }
        },
        0xf9: {
            asm: (gb) => { return `LD   SP,HL`; },
            func: (gb) => { const hl = (gb.regs.h << 8) | gb.regs.l; gb.regs.sp = hl; }
        },
        0xfa: {
            asm: (gb) => { return `LD   A,${hexWord(Memory.readWord(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { gb.regs.a = Memory.readUByte(gb.mem, Gb.loadWord(gb)); }
        },
        0xfb: {
            asm: (gb) => { return "EI"; },
            func: (gb) => { gb.regs.ie = true; }
        },
        0xfe: {
            asm: (gb) => { return `CP   0x${hexByte(Memory.readUByte(gb.mem, gb.regs.pc))}`; },
            func: (gb) => { const v = Gb.loadUByte(gb); Register.checkZ(gb, gb.regs.a - v); Register.setN(gb, 1); Register.setH(gb, ((gb.regs.a & 0x0f) - (v & 0x0f)) >> 4); Register.setC(gb, (gb.regs.a - v) >> 8); }
        },
        0xff: {
            asm: (gb) => { return `RST  0x38`; },
            func: (gb) => { Gb.pushWord(gb, gb.regs.pc); gb.regs.pc = 0x38; }
        },
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
            8,12,12,16, 12,16, 8,16,  8,16,12, 0, 12,24, 8,16,  // c
            8,12,12, 0, 12,16, 8,16,  8,16,12, 0, 12, 0, 8,16,  // d
           12,12, 8, 0,  0,16, 8,16, 16, 4,16, 0,  0, 0, 8,16,  // e
           12,12, 8, 4,  0,16, 8,16, 12, 8,16, 4,  0, 0, 8,16,  // f
    ];
}