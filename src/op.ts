import { Register } from "./register";

interface OpResult {
    size: number,
    cycle: number,
}

export class Op {
    public static process_op_code(op_code: number, mem: Uint8Array, reg: Register): OpResult {
        return this.op_code_map[op_code](mem, reg);
    }

    private static makeWord(upper:number, lower:number) : number{
        return upper << 8 | lower;
    }

    private static op_code_map: { [op_code: number]: (mem: Uint8Array, reg: Register) => OpResult } = {
        0x00: (_) => { return { size: 0, cycle: 4 }; },
        0x31: (mem, reg) => { reg.sp = Op.makeWord(mem[reg.pc+1], mem[reg.pc]); return { size: 2, cycle: 3 }; },
        0xc3: (mem, reg) => { reg.pc = Op.makeWord(mem[reg.pc+1], mem[reg.pc]); return { size: 0, cycle: 4 }; },
        0xf3: (_) => { return { size:0, cycle:1 }; },
    };
}