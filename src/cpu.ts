import { GB } from './gb';
import { Op } from './op';

export namespace Cpu {
    export function step(gb: GB.env) {
        const op_code = gb.mem.rom[gb.regs.pc];
        gb.regs.pc += 1;

        console.log((gb.regs.pc-1).toString(16) + ": " + op_code.toString(16));

        const op_result = Op.process_op_code(op_code, gb);
        let cylcle = Op.cycles[op_code];
    }

}