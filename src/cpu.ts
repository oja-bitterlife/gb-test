import { GB } from './gb';
import { Op } from './op';

export namespace Cpu {
    export function step(gb: GB.env) {
        const op_code = gb.mem[gb.regs.pc];
        gb.regs.pc += 1;

        console.log((gb.regs.pc-1).toString(16) + ": " + op_code.toString(16));

        // opコードの実行。cycleが変則のものop_codeの処理の中で調整される(trans_cycle=gb.cycle-befor_cycle)
        const befor_cycle = gb.cycle;
        Op.process_op_code(op_code, gb);
        gb.cycle += Op.cycles[op_code];

        
    }

}