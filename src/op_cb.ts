import { Gb } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace OpCb {
    export const formatDisAsm = (cb_code: number, gb: Gb.Env): string => {
        const op_hex = hexByte(cb_code);
        try {
            return `0x${hexWord(gb.regs.pc - 1)}: (CB ${op_hex}):${cb_code_map[cb_code].asm(gb)}`;
        } catch (ex) {
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc - 1).toString(16) + " => cb_op: 0x" + cb_code.toString(16));
            throw ex;  // exit
        }
    };

    export const process_cb_code = (cb_code: number, gb: Gb.Env) => {
        try {
            cb_code_map[cb_code].func(gb);
        } catch (ex) {
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc - 1).toString(16) + " => cb_op: 0x" + cb_code.toString(16));
            throw ex;  // exit
        }
    };

    const hexByte = (byte: number): string => { return ('00' + (byte & 0xff).toString(16)).slice(-2); };
    const hexWord = (word: number): string => { return ('0000' + (word & 0xffff).toString(16)).slice(-4); };

    const cb_code_map: {
        [cb_code: number]: {
            asm: (gb: Gb.Env) => string,
            func: (gb: Gb.Env) => void
        }
    } = {
        0x00: {
            asm: (gb) => { return "RLC  B"; },
            func: (gb) => { const lsb = (gb.regs.b >> 7) & 0x1; gb.regs.b = ((gb.regs.b << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.b); Register.setC(gb, lsb); }
        },
        0x01: {
            asm: (gb) => { return "RLC  C"; },
            func: (gb) => { const lsb = (gb.regs.c >> 7) & 0x1; gb.regs.c = ((gb.regs.c << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.c); Register.setC(gb, lsb); }
        },
        0x02: {
            asm: (gb) => { return "RLC  D"; },
            func: (gb) => { const lsb = (gb.regs.d >> 7) & 0x1; gb.regs.d = ((gb.regs.d << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.d); Register.setC(gb, lsb); }
        },
        0x03: {
            asm: (gb) => { return "RLC  E"; },
            func: (gb) => { const lsb = (gb.regs.e >> 7) & 0x1; gb.regs.e = ((gb.regs.e << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.e); Register.setC(gb, lsb); }
        },
        0x04: {
            asm: (gb) => { return "RLC  H"; },
            func: (gb) => { const lsb = (gb.regs.h >> 7) & 0x1; gb.regs.h = ((gb.regs.h << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.h); Register.setC(gb, lsb); }
        },
        0x05: {
            asm: (gb) => { return "RLC  L"; },
            func: (gb) => { const lsb = (gb.regs.l >> 7) & 0x1; gb.regs.l = ((gb.regs.l << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.l); Register.setC(gb, lsb); }
        },
        0x06: {
            asm: (gb) => { return "RLC  (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); const lsb = (n >> 7) & 0x1; n = ((n << 1) | lsb) & 0xff; Memory.writeByte(gb.mem, hl, n); Register.setNH(gb, 0, 0); Register.checkZ(gb, n); Register.setC(gb, lsb); }
        },
        0x07: {
            asm: (gb) => { return "RLC  A"; },
            func: (gb) => { const lsb = (gb.regs.a >> 7) & 0x1; gb.regs.a = ((gb.regs.a << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.a); Register.setC(gb, lsb); }
        },
        0x08: {
            asm: (gb) => { return "RRC  B"; },
            func: (gb) => { const msb = (gb.regs.b << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.b & 0x1); gb.regs.b = (gb.regs.b >> 1) | msb; Register.checkZ(gb, gb.regs.b); }
        },
        0x09: {
            asm: (gb) => { return "RRC  C"; },
            func: (gb) => { const msb = (gb.regs.c << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.c & 0x1); gb.regs.c = (gb.regs.c >> 1) | msb; Register.checkZ(gb, gb.regs.c); }
        },
        0x0a: {
            asm: (gb) => { return "RRC  D"; },
            func: (gb) => { const msb = (gb.regs.d << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.d & 0x1); gb.regs.d = (gb.regs.d >> 1) | msb; Register.checkZ(gb, gb.regs.d); }
        },
        0x0b: {
            asm: (gb) => { return "RRC  E"; },
            func: (gb) => { const msb = (gb.regs.e << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.e & 0x1); gb.regs.e = (gb.regs.e >> 1) | msb; Register.checkZ(gb, gb.regs.e); }
        },
        0x0c: {
            asm: (gb) => { return "RRC  H"; },
            func: (gb) => { const msb = (gb.regs.h << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.h & 0x1); gb.regs.h = (gb.regs.h >> 1) | msb; Register.checkZ(gb, gb.regs.h); }
        },
        0x0d: {
            asm: (gb) => { return "RRC  L"; },
            func: (gb) => { const msb = (gb.regs.l << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.l & 0x1); gb.regs.l = (gb.regs.l >> 1) | msb; Register.checkZ(gb, gb.regs.l); }
        },
        0x0e: {
            asm: (gb) => { return "RRC  (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); const msb = (n << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, n & 0x1); n = (n >> 1) | msb; Memory.writeByte(gb.mem, hl, n); Register.checkZ(gb, n); }
        },
        0x0f: {
            asm: (gb) => { return "RRC  A"; },
            func: (gb) => { const msb = (gb.regs.a << 7) & 0x80; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.a & 0x1); gb.regs.a = (gb.regs.a >> 1) | msb; Register.checkZ(gb, gb.regs.a); }
        },
        0x10: {
            asm: (gb) => { return "RL   B"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.b = ((gb.regs.b << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.b); Register.setC(gb, lsb); }
        },
        0x11: {
            asm: (gb) => { return "RL   C"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.c = ((gb.regs.c << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.c); Register.setC(gb, lsb); }
        },
        0x12: {
            asm: (gb) => { return "RL   D"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.d = ((gb.regs.d << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.d); Register.setC(gb, lsb); }
        },
        0x13: {
            asm: (gb) => { return "RL   E"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.e = ((gb.regs.e << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.e); Register.setC(gb, lsb); }
        },
        0x14: {
            asm: (gb) => { return "RL   H"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.h = ((gb.regs.h << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.h); Register.setC(gb, lsb); }
        },
        0x15: {
            asm: (gb) => { return "RL   L"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.l = ((gb.regs.l << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.l); Register.setC(gb, lsb); }
        },
        0x16: {
            asm: (gb) => { return "RL   (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); const lsb = gb.flags.carry ? 0x1 : 0; n = ((n << 1) | lsb) & 0xff; Memory.writeByte(gb.mem, hl, n); Register.setNH(gb, 0, 0); Register.checkZ(gb, n); Register.setC(gb, lsb); }
        },
        0x17: {
            asm: (gb) => { return "RL   A"; },
            func: (gb) => { const lsb = gb.flags.carry ? 0x1 : 0; gb.regs.a = ((gb.regs.a << 1) | lsb) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.a); Register.setC(gb, lsb); }
        },
        0x18: {
            asm: (gb) => { return "RR   B"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.b & 0x1); gb.regs.b = (gb.regs.b >> 1) | msb; Register.checkZ(gb, gb.regs.b); }
        },
        0x19: {
            asm: (gb) => { return "RR   C"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.c & 0x1); gb.regs.c = (gb.regs.c >> 1) | msb; Register.checkZ(gb, gb.regs.c); }
        },
        0x1a: {
            asm: (gb) => { return "RR   D"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.d & 0x1); gb.regs.d = (gb.regs.d >> 1) | msb; Register.checkZ(gb, gb.regs.d); }
        },
        0x1b: {
            asm: (gb) => { return "RR   E"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.e & 0x1); gb.regs.e = (gb.regs.e >> 1) | msb; Register.checkZ(gb, gb.regs.e); }
        },
        0x1c: {
            asm: (gb) => { return "RR   H"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.h & 0x1); gb.regs.h = (gb.regs.h >> 1) | msb; Register.checkZ(gb, gb.regs.h); }
        },
        0x1d: {
            asm: (gb) => { return "RR   L"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.l & 0x1); gb.regs.l = (gb.regs.l >> 1) | msb; Register.checkZ(gb, gb.regs.l); }
        },
        0x1e: {
            asm: (gb) => { return "RR   (HL)"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); Register.setC(gb, n & 0x1); n = (n >> 1) | msb; Memory.writeByte(gb.mem, hl, n); Register.checkZ(gb, n); }
        },
        0x1f: {
            asm: (gb) => { return "RR   A"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.setNH(gb, 0, 0); Register.setC(gb, gb.regs.a & 0x1); gb.regs.a = (gb.regs.a >> 1) | msb; Register.checkZ(gb, gb.regs.a); }
        },
        0x20: {
            asm: (gb) => { return "SLA  B"; },
            func: (gb) => { const c = (gb.regs.b >> 7) & 0x1; gb.regs.b = (gb.regs.b << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.b); Register.setC(gb, c); }
        },
        0x21: {
            asm: (gb) => { return "SLA  C"; },
            func: (gb) => { const c = (gb.regs.c >> 7) & 0x1; gb.regs.c = (gb.regs.c << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.c); Register.setC(gb, c); }
        },
        0x22: {
            asm: (gb) => { return "SLA  D"; },
            func: (gb) => { const c = (gb.regs.d >> 7) & 0x1; gb.regs.d = (gb.regs.d << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.d); Register.setC(gb, c); }
        },
        0x23: {
            asm: (gb) => { return "SLA  E"; },
            func: (gb) => { const c = (gb.regs.e >> 7) & 0x1; gb.regs.e = (gb.regs.e << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.e); Register.setC(gb, c); }
        },
        0x24: {
            asm: (gb) => { return "SLA  H"; },
            func: (gb) => { const c = (gb.regs.h >> 7) & 0x1; gb.regs.h = (gb.regs.h << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.h); Register.setC(gb, c); }
        },
        0x25: {
            asm: (gb) => { return "SLA  L"; },
            func: (gb) => { const c = (gb.regs.l >> 7) & 0x1; gb.regs.l = (gb.regs.l << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.l); Register.setC(gb, c); }
        },
        0x26: {
            asm: (gb) => { return "SLA  (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); const c = (gb.regs.b >> 7) & 0x1; n = (n << 1) & 0xff; Memory.writeByte(gb.mem, hl, n); Register.setNH(gb, 0, 0); Register.checkZ(gb, n); Register.setC(gb, c); }
        },
        0x27: {
            asm: (gb) => { return "SLA  A"; },
            func: (gb) => { const c = (gb.regs.a >> 7) & 0x1; gb.regs.a = (gb.regs.a << 1) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.a); Register.setC(gb, c); }
        },
        0x28: {
            asm: (gb) => { return "SRA  B"; },
            func: (gb) => { const c = gb.regs.b & 0x1; gb.regs.b = ((gb.regs.b >> 7) | (gb.regs.b & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.b); Register.setC(gb, c); }
        },
        0x29: {
            asm: (gb) => { return "SRA  C"; },
            func: (gb) => { const c = gb.regs.c & 0x1; gb.regs.c = ((gb.regs.c >> 7) | (gb.regs.c & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.c); Register.setC(gb, c); }
        },
        0x2a: {
            asm: (gb) => { return "SRA  D"; },
            func: (gb) => { const c = gb.regs.d & 0x1; gb.regs.d = ((gb.regs.d >> 7) | (gb.regs.d & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.d); Register.setC(gb, c); }
        },
        0x2b: {
            asm: (gb) => { return "SRA  E"; },
            func: (gb) => { const c = gb.regs.e & 0x1; gb.regs.e = ((gb.regs.e >> 7) | (gb.regs.e & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.e); Register.setC(gb, c); }
        },
        0x2c: {
            asm: (gb) => { return "SRA  H"; },
            func: (gb) => { const c = gb.regs.h & 0x1; gb.regs.h = ((gb.regs.h >> 7) | (gb.regs.h & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.h); Register.setC(gb, c); }
        },
        0x2d: {
            asm: (gb) => { return "SRA  L"; },
            func: (gb) => { const c = gb.regs.l & 0x1; gb.regs.l = ((gb.regs.l >> 7) | (gb.regs.l & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.l); Register.setC(gb, c); }
        },
        0x2e: {
            asm: (gb) => { return "SRA  (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); const c = n & 0x1; n = ((n >> 7) | (n & 0x80)) & 0xff; Memory.writeByte(gb.mem, hl, n); Register.setNH(gb, 0, 0); Register.checkZ(gb, n); Register.setC(gb, c); }
        },
        0x2f: {
            asm: (gb) => { return "SRA  A"; },
            func: (gb) => { const c = gb.regs.a & 0x1; gb.regs.a = ((gb.regs.a >> 7) | (gb.regs.a & 0x80)) & 0xff; Register.setNH(gb, 0, 0); Register.checkZ(gb, gb.regs.a); Register.setC(gb, c); }
        },
        0x30: {
            asm: (gb) => { return "SWAP B"; },
            func: (gb) => { gb.regs.b = ((gb.regs.b >> 4) & 0xf) | ((gb.regs.b << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.b); }
        },
        0x31: {
            asm: (gb) => { return "SWAP C"; },
            func: (gb) => { gb.regs.c = ((gb.regs.c >> 4) & 0xf) | ((gb.regs.c << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.c); }
        },
        0x32: {
            asm: (gb) => { return "SWAP D"; },
            func: (gb) => { gb.regs.d = ((gb.regs.d >> 4) & 0xf) | ((gb.regs.d << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.d); }
        },
        0x33: {
            asm: (gb) => { return "SWAP E"; },
            func: (gb) => { gb.regs.e = ((gb.regs.e >> 4) & 0xf) | ((gb.regs.e << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.e); }
        },
        0x34: {
            asm: (gb) => { return "SWAP H"; },
            func: (gb) => { gb.regs.h = ((gb.regs.h >> 4) & 0xf) | ((gb.regs.h << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.h); }
        },
        0x35: {
            asm: (gb) => { return "SWAP L"; },
            func: (gb) => { gb.regs.l = ((gb.regs.l >> 4) & 0xf) | ((gb.regs.l << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.l); }
        },
        0x36: {
            asm: (gb) => { return "SWAP (HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); n = ((n >> 4) & 0xf) | ((n << 4) & 0xf0); Memory.writeByte(gb.mem, hl, n); Register.byteToFlags(gb, 0); Register.checkZ(gb, n); }
        },
        0x37: {
            asm: (gb) => { return "SWAP A"; },
            func: (gb) => { gb.regs.a = ((gb.regs.a >> 4) & 0xf) | ((gb.regs.a << 4) & 0xf0); Register.byteToFlags(gb, 0); Register.checkZ(gb, gb.regs.a); }
        },
        0x38: {
            asm: (gb) => { return "SRL  B"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.b & 0x1) == 0x1; gb.regs.b >>= 1; Register.checkZ(gb, gb.regs.b); }
        },
        0x39: {
            asm: (gb) => { return "SRL  C"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.c & 0x1) == 0x1; gb.regs.c >>= 1; Register.checkZ(gb, gb.regs.c); }
        },
        0x3a: {
            asm: (gb) => { return "SRL  D"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.d & 0x1) == 0x1; gb.regs.d >>= 1; Register.checkZ(gb, gb.regs.d); }
        },
        0x3b: {
            asm: (gb) => { return "SRL  E"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.e & 0x1) == 0x1; gb.regs.e >>= 1; Register.checkZ(gb, gb.regs.e); }
        },
        0x3c: {
            asm: (gb) => { return "SRL  H"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.h & 0x1) == 0x1; gb.regs.h >>= 1; Register.checkZ(gb, gb.regs.h); }
        },
        0x3d: {
            asm: (gb) => { return "SRL  L"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.l & 0x1) == 0x1; gb.regs.l >>= 1; Register.checkZ(gb, gb.regs.l); }
        },
        0x3e: {
            asm: (gb) => { return "SRL  (HL)"; },
            func: (gb) => { Register.byteToFlags(gb, 0); const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); gb.flags.carry = (n & 0x1) == 0x1; n >>= 1; Memory.writeByte(gb.mem, hl, n); Register.checkZ(gb, n); }
        },
        0x3f: {
            asm: (gb) => { return "SRL  A"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.a & 0x1) == 0x1; gb.regs.a >>= 1; Register.checkZ(gb, gb.regs.a); }
        },
        0x40: {
            asm: (gb) => { return "BIT  0,B"; },
            func: (gb) => { const n = (gb.regs.b >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x41: {
            asm: (gb) => { return "BIT  0,C"; },
            func: (gb) => { const n = (gb.regs.c >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x42: {
            asm: (gb) => { return "BIT  0,D"; },
            func: (gb) => { const n = (gb.regs.d >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x43: {
            asm: (gb) => { return "BIT  0,E"; },
            func: (gb) => { const n = (gb.regs.e >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x44: {
            asm: (gb) => { return "BIT  0,H"; },
            func: (gb) => { const n = (gb.regs.h >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x45: {
            asm: (gb) => { return "BIT  0,L"; },
            func: (gb) => { const n = (gb.regs.l >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x46: {
            asm: (gb) => { return "BIT  0,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x47: {
            asm: (gb) => { return "BIT  0,A"; },
            func: (gb) => { const n = (gb.regs.a >> 0) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x48: {
            asm: (gb) => { return "BIT  1,B"; },
            func: (gb) => { const n = (gb.regs.b >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x49: {
            asm: (gb) => { return "BIT  1,C"; },
            func: (gb) => { const n = (gb.regs.c >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4a: {
            asm: (gb) => { return "BIT  1,D"; },
            func: (gb) => { const n = (gb.regs.d >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4b: {
            asm: (gb) => { return "BIT  1,E"; },
            func: (gb) => { const n = (gb.regs.e >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4c: {
            asm: (gb) => { return "BIT  1,H"; },
            func: (gb) => { const n = (gb.regs.h >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4d: {
            asm: (gb) => { return "BIT  1,L"; },
            func: (gb) => { const n = (gb.regs.l >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4e: {
            asm: (gb) => { return "BIT  1,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x4f: {
            asm: (gb) => { return "BIT  1,A"; },
            func: (gb) => { const n = (gb.regs.a >> 1) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x50: {
            asm: (gb) => { return "BIT  2,B"; },
            func: (gb) => { const n = (gb.regs.b >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x51: {
            asm: (gb) => { return "BIT  2,C"; },
            func: (gb) => { const n = (gb.regs.c >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x52: {
            asm: (gb) => { return "BIT  2,D"; },
            func: (gb) => { const n = (gb.regs.d >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x53: {
            asm: (gb) => { return "BIT  2,E"; },
            func: (gb) => { const n = (gb.regs.e >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x54: {
            asm: (gb) => { return "BIT  2,H"; },
            func: (gb) => { const n = (gb.regs.h >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x55: {
            asm: (gb) => { return "BIT  2,L"; },
            func: (gb) => { const n = (gb.regs.l >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x56: {
            asm: (gb) => { return "BIT  2,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x57: {
            asm: (gb) => { return "BIT  2,A"; },
            func: (gb) => { const n = (gb.regs.a >> 2) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x58: {
            asm: (gb) => { return "BIT  3,B"; },
            func: (gb) => { const n = (gb.regs.b >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x59: {
            asm: (gb) => { return "BIT  3,C"; },
            func: (gb) => { const n = (gb.regs.c >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5a: {
            asm: (gb) => { return "BIT  3,D"; },
            func: (gb) => { const n = (gb.regs.d >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5b: {
            asm: (gb) => { return "BIT  3,E"; },
            func: (gb) => { const n = (gb.regs.e >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5c: {
            asm: (gb) => { return "BIT  3,H"; },
            func: (gb) => { const n = (gb.regs.h >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5d: {
            asm: (gb) => { return "BIT  3,L"; },
            func: (gb) => { const n = (gb.regs.l >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5e: {
            asm: (gb) => { return "BIT  3,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x5f: {
            asm: (gb) => { return "BIT  3,A"; },
            func: (gb) => { const n = (gb.regs.a >> 3) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x60: {
            asm: (gb) => { return "BIT  4,B"; },
            func: (gb) => { const n = (gb.regs.b >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x61: {
            asm: (gb) => { return "BIT  4,C"; },
            func: (gb) => { const n = (gb.regs.c >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x62: {
            asm: (gb) => { return "BIT  4,D"; },
            func: (gb) => { const n = (gb.regs.d >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x63: {
            asm: (gb) => { return "BIT  4,E"; },
            func: (gb) => { const n = (gb.regs.e >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x64: {
            asm: (gb) => { return "BIT  4,H"; },
            func: (gb) => { const n = (gb.regs.h >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x65: {
            asm: (gb) => { return "BIT  4,L"; },
            func: (gb) => { const n = (gb.regs.l >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x66: {
            asm: (gb) => { return "BIT  4,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x67: {
            asm: (gb) => { return "BIT  4,A"; },
            func: (gb) => { const n = (gb.regs.a >> 4) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x68: {
            asm: (gb) => { return "BIT  5,B"; },
            func: (gb) => { const n = (gb.regs.b >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x69: {
            asm: (gb) => { return "BIT  5,C"; },
            func: (gb) => { const n = (gb.regs.c >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6a: {
            asm: (gb) => { return "BIT  5,D"; },
            func: (gb) => { const n = (gb.regs.d >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6b: {
            asm: (gb) => { return "BIT  5,E"; },
            func: (gb) => { const n = (gb.regs.e >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6c: {
            asm: (gb) => { return "BIT  5,H"; },
            func: (gb) => { const n = (gb.regs.h >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6d: {
            asm: (gb) => { return "BIT  5,L"; },
            func: (gb) => { const n = (gb.regs.l >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6e: {
            asm: (gb) => { return "BIT  5,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 1) & 0x5; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x6f: {
            asm: (gb) => { return "BIT  5,A"; },
            func: (gb) => { const n = (gb.regs.a >> 5) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x70: {
            asm: (gb) => { return "BIT  6,B"; },
            func: (gb) => { const n = (gb.regs.b >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x71: {
            asm: (gb) => { return "BIT  6,C"; },
            func: (gb) => { const n = (gb.regs.c >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x72: {
            asm: (gb) => { return "BIT  6,D"; },
            func: (gb) => { const n = (gb.regs.d >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x73: {
            asm: (gb) => { return "BIT  6,E"; },
            func: (gb) => { const n = (gb.regs.e >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x74: {
            asm: (gb) => { return "BIT  6,H"; },
            func: (gb) => { const n = (gb.regs.h >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x75: {
            asm: (gb) => { return "BIT  6,L"; },
            func: (gb) => { const n = (gb.regs.l >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x76: {
            asm: (gb) => { return "BIT  6,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x77: {
            asm: (gb) => { return "BIT  6,A"; },
            func: (gb) => { const n = (gb.regs.a >> 6) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x78: {
            asm: (gb) => { return "BIT  7,B"; },
            func: (gb) => { const n = (gb.regs.b >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x79: {
            asm: (gb) => { return "BIT  7,C"; },
            func: (gb) => { const n = (gb.regs.c >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7a: {
            asm: (gb) => { return "BIT  7,D"; },
            func: (gb) => { const n = (gb.regs.d >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7b: {
            asm: (gb) => { return "BIT  7,E"; },
            func: (gb) => { const n = (gb.regs.e >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7c: {
            asm: (gb) => { return "BIT  7,H"; },
            func: (gb) => { const n = (gb.regs.h >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7d: {
            asm: (gb) => { return "BIT  7,L"; },
            func: (gb) => { const n = (gb.regs.l >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7e: {
            asm: (gb) => { return "BIT  7,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = (Memory.readUByte(gb.mem, hl) >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x7f: {
            asm: (gb) => { return "BIT  7,A"; },
            func: (gb) => { const n = (gb.regs.a >> 7) & 0x1; Register.checkZ(gb, n); Register.setNH(gb, 0, 1); }
        },
        0x80: {
            asm: (gb) => { return "RES  0,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 0); }
        },
        0x81: {
            asm: (gb) => { return "RES  0,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 0); }
        },
        0x82: {
            asm: (gb) => { return "RES  0,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 0); }
        },
        0x83: {
            asm: (gb) => { return "RES  0,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 0); }
        },
        0x84: {
            asm: (gb) => { return "RES  0,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 0); }
        },
        0x85: {
            asm: (gb) => { return "RES  0,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 0); }
        },
        0x86: {
            asm: (gb) => { return "RES  0,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 0); Memory.writeByte(gb.mem, hl, n); }
        },
        0x87: {
            asm: (gb) => { return "RES  0,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 0); }
        },
        0x88: {
            asm: (gb) => { return "RES  1,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 1); }
        },
        0x89: {
            asm: (gb) => { return "RES  1,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 1); }
        },
        0x8a: {
            asm: (gb) => { return "RES  1,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 1); }
        },
        0x8b: {
            asm: (gb) => { return "RES  1,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 1); }
        },
        0x8c: {
            asm: (gb) => { return "RES  1,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 1); }
        },
        0x8d: {
            asm: (gb) => { return "RES  1,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 1); }
        },
        0x8e: {
            asm: (gb) => { return "RES  1,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 1); Memory.writeByte(gb.mem, hl, n); }
        },
        0x8f: {
            asm: (gb) => { return "RES  1,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 1); }
        },
        0x90: {
            asm: (gb) => { return "RES  2,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 2); }
        },
        0x91: {
            asm: (gb) => { return "RES  2,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 2); }
        },
        0x92: {
            asm: (gb) => { return "RES  2,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 2); }
        },
        0x93: {
            asm: (gb) => { return "RES  2,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 2); }
        },
        0x94: {
            asm: (gb) => { return "RES  2,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 2); }
        },
        0x95: {
            asm: (gb) => { return "RES  2,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 2); }
        },
        0x96: {
            asm: (gb) => { return "RES  2,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 2); Memory.writeByte(gb.mem, hl, n); }
        },
        0x97: {
            asm: (gb) => { return "RES  2,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 2); }
        },
        0x98: {
            asm: (gb) => { return "RES  3,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 3); }
        },
        0x99: {
            asm: (gb) => { return "RES  3,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 3); }
        },
        0x9a: {
            asm: (gb) => { return "RES  3,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 3); }
        },
        0x9b: {
            asm: (gb) => { return "RES  3,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 3); }
        },
        0x9c: {
            asm: (gb) => { return "RES  3,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 3); }
        },
        0x9d: {
            asm: (gb) => { return "RES  3,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 3); }
        },
        0x9e: {
            asm: (gb) => { return "RES  3,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 3); Memory.writeByte(gb.mem, hl, n); }
        },
        0x9f: {
            asm: (gb) => { return "RES  3,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 3); }
        },
        0xa0: {
            asm: (gb) => { return "RES  4,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 4); }
        },
        0xa1: {
            asm: (gb) => { return "RES  4,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 4); }
        },
        0xa2: {
            asm: (gb) => { return "RES  4,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 4); }
        },
        0xa3: {
            asm: (gb) => { return "RES  4,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 4); }
        },
        0xa4: {
            asm: (gb) => { return "RES  4,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 4); }
        },
        0xa5: {
            asm: (gb) => { return "RES  4,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 4); }
        },
        0xa6: {
            asm: (gb) => { return "RES  4,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 4); Memory.writeByte(gb.mem, hl, n); }
        },
        0xa7: {
            asm: (gb) => { return "RES  4,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 4); }
        },
        0xa8: {
            asm: (gb) => { return "RES  5,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 5); }
        },
        0xa9: {
            asm: (gb) => { return "RES  5,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 5); }
        },
        0xaa: {
            asm: (gb) => { return "RES  5,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 5); }
        },
        0xab: {
            asm: (gb) => { return "RES  5,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 5); }
        },
        0xac: {
            asm: (gb) => { return "RES  5,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 5); }
        },
        0xad: {
            asm: (gb) => { return "RES  5,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 5); }
        },
        0xae: {
            asm: (gb) => { return "RES  5,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 5); Memory.writeByte(gb.mem, hl, n); }
        },
        0xaf: {
            asm: (gb) => { return "RES  5,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 5); }
        },
        0xb0: {
            asm: (gb) => { return "RES  6,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 6); }
        },
        0xb1: {
            asm: (gb) => { return "RES  6,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 6); }
        },
        0xb2: {
            asm: (gb) => { return "RES  6,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 6); }
        },
        0xb3: {
            asm: (gb) => { return "RES  6,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 6); }
        },
        0xb4: {
            asm: (gb) => { return "RES  6,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 6); }
        },
        0xb5: {
            asm: (gb) => { return "RES  6,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 6); }
        },
        0xb6: {
            asm: (gb) => { return "RES  6,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 6); Memory.writeByte(gb.mem, hl, n); }
        },
        0xb7: {
            asm: (gb) => { return "RES  6,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 6); }
        },
        0xb8: {
            asm: (gb) => { return "RES  7,B"; },
            func: (gb) => { gb.regs.b &= ~(1 << 7); }
        },
        0xb9: {
            asm: (gb) => { return "RES  7,C"; },
            func: (gb) => { gb.regs.c &= ~(1 << 7); }
        },
        0xba: {
            asm: (gb) => { return "RES  7,D"; },
            func: (gb) => { gb.regs.d &= ~(1 << 7); }
        },
        0xbb: {
            asm: (gb) => { return "RES  7,E"; },
            func: (gb) => { gb.regs.e &= ~(1 << 7); }
        },
        0xbc: {
            asm: (gb) => { return "RES  7,H"; },
            func: (gb) => { gb.regs.h &= ~(1 << 7); }
        },
        0xbd: {
            asm: (gb) => { return "RES  7,L"; },
            func: (gb) => { gb.regs.l &= ~(1 << 7); }
        },
        0xbe: {
            asm: (gb) => { return "RES  7,(HL)"; },
            func: (gb) => { const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); const n = Memory.readUByte(gb.mem, hl) & ~(1 << 7); Memory.writeByte(gb.mem, hl, n); }
        },
        0xbf: {
            asm: (gb) => { return "RES  7,A"; },
            func: (gb) => { gb.regs.a &= ~(1 << 7); }
        },
    };

    export const cycles = [
        //  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 0
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 1
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 2
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 3
        8, 8, 8, 8, 8, 8, 18, 8, 8, 8, 8, 8, 8, 8, 18, 8,  // 4
        8, 8, 8, 8, 8, 8, 18, 8, 8, 8, 8, 8, 8, 8, 18, 8,  // 5
        8, 8, 8, 8, 8, 8, 18, 8, 8, 8, 8, 8, 8, 8, 18, 8,  // 6
        8, 8, 8, 8, 8, 8, 18, 8, 8, 8, 8, 8, 8, 8, 18, 8,  // 7
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 8
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // 9
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // a
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // b
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // c
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // d
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // e
        8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,  // f
    ];
}
