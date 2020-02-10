import { Register } from './register';
import { Op, Op_cycles } from './op';

export class Cpu {
    private register: Register;
    private memory: Uint8Array;

    constructor(buf: Uint8Array) {
        this.memory = buf;

        this.register = {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            f: 0,
            h: 0,
            l: 0,
            sp: 0xfffe,
            pc: 0x100,
        }
    }

    public step() {
        let op_code = this.memory[this.register.pc];
        this.register.pc += 1;
        console.log(op_code.toString(16));

        const op_result = Op.process_op_code(op_code, this.memory, this.register);
        let cylcle = Op_cycles[op_code];
    }

}