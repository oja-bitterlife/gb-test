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
