import { GB } from "./gb";
import { Op } from "./op";

export namespace Debug {
    export function printDisasm(gb: GB.env) {
        const op_code = GB.loadUByte(gb);
        console.log(Op.formatDisAsm(op_code, gb));
        gb.regs.pc--;  // loadした分戻す
    }
}