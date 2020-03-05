import { GB } from "./gb";
import { Op } from "./op";

export namespace Debug {
    export type Breaks = {
        return: boolean;
        vBlank: boolean;
    }

    export function createBreaks(): Breaks {
        return {
            return: false,
            vBlank: false,
        };
    }

    export function printDisasm(gb: GB.env) {
        const op_code = GB.loadUByte(gb);
        console.log(Op.formatDisAsm(op_code, gb));
        gb.regs.pc--;  // loadした分戻す
    }
}