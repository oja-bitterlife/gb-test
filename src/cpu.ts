import { Gb } from './gb.js';
import { Op } from './op.js';
import { OpCb } from './op_cb.js';

export namespace Cpu {
    export const step = (gb: Gb.Env): void => {
        if(gb.halt) gb.regs.pc--;  // HALT継続

        const op_code = Gb.loadUByte(gb);

        if (op_code != 0xcb) {
            Op.process_op_code(op_code, gb);
            gb.cycle += Op.cycles[op_code];
        }
        else {
            const cb_code = Gb.loadUByte(gb);
            OpCb.process_cb_code(cb_code, gb);
            gb.cycle += Op.cycles[op_code] + OpCb.cycles[cb_code];
        }
    };
}