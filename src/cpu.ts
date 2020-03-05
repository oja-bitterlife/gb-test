import { Gb } from './gb';
import { Op } from './op';

export namespace Cpu {
    export function step(gb: Gb.env) {
        const op_code = Gb.loadUByte(gb);

        // opコードの実行。cycleが変則のものop_codeの処理の中で調整される(trans_cycle=gb.cycle-befor_cycle)
        const befor_cycle = gb.cycle;
        Op.process_op_code(op_code, gb);
        gb.cycle += Op.cycles[op_code];
    }

}