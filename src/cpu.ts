import { GB } from './gb';
import { Op } from './op';

export namespace Cpu {
    export function step(gb: GB.env) {
        const op_code = gb.memory.rom[gb.registers.pc];
        gb.registers.pc += 1;

        console.log(op_code.toString(16));

        const op_result = Op.process_op_code(op_code, gb);
        let cylcle = Op.cycles[op_code];
    }

}