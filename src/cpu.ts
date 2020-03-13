import { Gb } from './gb';
import { Op } from './op';
import { OpCb } from './op_cb';

export namespace Cpu {
    export function step(gb: Gb.Env) {
        const befor_cycle = gb.cycle;

        const op_code = Gb.loadUByte(gb);
        if(op_code != 0xcb){
            Op.process_op_code(op_code, gb);
            gb.cycle += Op.cycles[op_code];
        }else{
            const cb_code = Gb.loadUByte(gb);
            OpCb.process_cb_code(cb_code, gb);

            gb.cycle += Op.cycles[op_code] + OpCb.cycles[cb_code];
        }

    }

}