import { Gb } from "./gb";
import { Memory } from "./memory";
import { Register } from "./register";

export namespace OpCb {
    export const formatDisAsm = (cb_code: number, gb: Gb.Env) : string => {
        const op_hex = hexByte(cb_code);
        try{
            return `0x${hexWord(gb.regs.pc-1)}: (CB ${op_hex}):${cb_code_map[cb_code].asm(gb)}`;
        }catch(ex){
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc-1).toString(16) + " => cb_op: 0x" + cb_code.toString(16));
            throw ex;  // exit
        }
    };

    export const process_cb_code = (cb_code: number, gb: Gb.Env) => {
        try{
            cb_code_map[cb_code].func(gb);
        }catch(ex){
            // not find instruction
            console.log("addr: 0x" + (gb.regs.pc-1).toString(16) + " => cb_op: 0x" + cb_code.toString(16));
            throw ex;  // exit
        }
    };

    const hexByte = (byte : number) : string => { return ( '00' + (byte&0xff).toString(16) ).slice( -2 ); };
    const hexWord = (word : number) : string => { return ( '0000' + (word&0xffff).toString(16) ).slice( -4 ); };

    const cb_code_map: {
        [cb_code: number]: {
            asm: (gb: Gb.Env) => string,
            func: (gb: Gb.Env) => void
        }
    } = {
        0x38: { asm: (gb) => { return "SRL  B"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.b&0x1) == 0x1; gb.regs.b >>= 1; }},
            0x39: { asm: (gb) => { return "SRL  C"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.c&0x1) == 0x1; gb.regs.c >>= 1; }},
            0x3a: { asm: (gb) => { return "SRL  D"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.d&0x1) == 0x1; gb.regs.d >>= 1; }},
            0x3b: { asm: (gb) => { return "SRL  E"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.e&0x1) == 0x1; gb.regs.e >>= 1; }},
            0x3c: { asm: (gb) => { return "SRL  H"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.h&0x1) == 0x1; gb.regs.h >>= 1; }},
            0x3d: { asm: (gb) => { return "SRL  L"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.l&0x1) == 0x1; gb.regs.l >>= 1; }},
            0x3e: { asm: (gb) => { return "SRL  (HL)"; },
                func: (gb) => { Register.byteToFlags(gb, 0); const hl = ((gb.regs.h&0xff)<<8) | (gb.regs.l&0xff); let n = Memory.readUByte(gb.mem, hl); gb.flags.carry = (n&0x1) == 0x1; Memory.writeByte(gb.mem, hl, n>>1); }},
            0x3f: { asm: (gb) => { return "SRL  A"; },
                func: (gb) => { Register.byteToFlags(gb, 0); gb.flags.carry = (gb.regs.a&0x1) == 0x1; gb.regs.a >>= 1; }},
    };

    export const cycles = [
    //  0  1  2  3   4  5  6  7   8  9  a  b   c  d  e  f
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 0
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 1
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 2
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 3
        2, 2, 2, 2,  2, 2, 3, 2,  2, 2, 2, 2,  2, 2, 3, 2,  // 4
        2, 2, 2, 2,  2, 2, 3, 2,  2, 2, 2, 2,  2, 2, 3, 2,  // 5
        2, 2, 2, 2,  2, 2, 3, 2,  2, 2, 2, 2,  2, 2, 3, 2,  // 6
        2, 2, 2, 2,  2, 2, 3, 2,  2, 2, 2, 2,  2, 2, 3, 2,  // 7
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 8
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // 9
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // a
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // b
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // c
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // d
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // e
        2, 2, 2, 2,  2, 2, 4, 2,  2, 2, 2, 2,  2, 2, 4, 2,  // f
    ];
}
