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
        0x18: {
            asm: (gb) => { return "RR   B"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.b & 0x1) == 0x1; gb.regs.b = (gb.regs.b >> 1) | msb; Register.updateFlags(gb, gb.regs.b, 0x80); }
        },
        0x19: {
            asm: (gb) => { return "RR   C"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.c & 0x1) == 0x1; gb.regs.c = (gb.regs.c >> 1) | msb; Register.updateFlags(gb, gb.regs.c, 0x80); }
        },
        0x1a: {
            asm: (gb) => { return "RR   D"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.d & 0x1) == 0x1; gb.regs.d = (gb.regs.d >> 1) | msb; Register.updateFlags(gb, gb.regs.d, 0x80); }
        },
        0x1b: {
            asm: (gb) => { return "RR   E"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.e & 0x1) == 0x1; gb.regs.e = (gb.regs.e >> 1) | msb; Register.updateFlags(gb, gb.regs.e, 0x80); }
        },
        0x1c: {
            asm: (gb) => { return "RR   H"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.h & 0x1) == 0x1; gb.regs.h = (gb.regs.h >> 1) | msb; Register.updateFlags(gb, gb.regs.h, 0x80); }
        },
        0x1d: {
            asm: (gb) => { return "RR   L"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.l & 0x1) == 0x1; gb.regs.l = (gb.regs.l >> 1) | msb; Register.updateFlags(gb, gb.regs.l, 0x80); }
        },
        0x1e: {
            asm: (gb) => { return "RR   (HL)"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); gb.flags.carry = (n & 0x1) == 0x1; n = (n >> 1) | msb; Memory.writeByte(gb.mem, hl, n); Register.updateFlags(gb, n, 0x80); }
        },
        0x1f: {
            asm: (gb) => { return "RR   A"; },
            func: (gb) => { const msb = gb.flags.carry ? 0x80 : 0; Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.a & 0x1) == 0x1; gb.regs.a = (gb.regs.a >> 1) | msb; Register.updateFlags(gb, gb.regs.a, 0x80); }
        },
        0x38: {
            asm: (gb) => { return "SRL  B"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.b & 0x1) == 0x1; gb.regs.b >>= 1; Register.updateFlags(gb, gb.regs.b, 0x80); }
        },
        0x39: {
            asm: (gb) => { return "SRL  C"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.c & 0x1) == 0x1; gb.regs.c >>= 1; Register.updateFlags(gb, gb.regs.c, 0x80); }
        },
        0x3a: {
            asm: (gb) => { return "SRL  D"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.d & 0x1) == 0x1; gb.regs.d >>= 1; Register.updateFlags(gb, gb.regs.d, 0x80); }
        },
        0x3b: {
            asm: (gb) => { return "SRL  E"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.e & 0x1) == 0x1; gb.regs.e >>= 1; Register.updateFlags(gb, gb.regs.e, 0x80); }
        },
        0x3c: {
            asm: (gb) => { return "SRL  H"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.h & 0x1) == 0x1; gb.regs.h >>= 1; Register.updateFlags(gb, gb.regs.h, 0x80); }
        },
        0x3d: {
            asm: (gb) => { return "SRL  L"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.l & 0x1) == 0x1; gb.regs.l >>= 1; Register.updateFlags(gb, gb.regs.l, 0x80); }
        },
        0x3e: {
            asm: (gb) => { return "SRL  (HL)"; },
            func: (gb) => { Register.byteToFlags(gb, 0); const hl = ((gb.regs.h & 0xff) << 8) | (gb.regs.l & 0xff); let n = Memory.readUByte(gb.mem, hl); gb.flags.carry = (n & 0x1) == 0x1; n >>= 1; Memory.writeByte(gb.mem, hl, n); Register.updateFlags(gb, n, 0x80); }
        },
        0x3f: {
            asm: (gb) => { return "SRL  A"; },
            func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.a & 0x1) == 0x1; gb.regs.a >>= 1; Register.updateFlags(gb, gb.regs.a, 0x80); }
        },
    };

    export const cycles = [
        //  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 0
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 1
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 2
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 3
            8, 8, 8, 8,  8, 8, 18, 8,  8, 8, 8, 8,  8, 8, 18, 8,  // 4
            8, 8, 8, 8,  8, 8, 18, 8,  8, 8, 8, 8,  8, 8, 18, 8,  // 5
            8, 8, 8, 8,  8, 8, 18, 8,  8, 8, 8, 8,  8, 8, 18, 8,  // 6
            8, 8, 8, 8,  8, 8, 18, 8,  8, 8, 8, 8,  8, 8, 18, 8,  // 7
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 8
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // 9
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // a
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // b
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // c
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // d
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // e
            8, 8, 8, 8,  8, 8, 16, 8,  8, 8, 8, 8,  8, 8, 16, 8,  // f
    ];
}
