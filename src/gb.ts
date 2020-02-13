import { Register } from "./register";
import { Memory } from "./memory";
//import { CPU } from "./cpu";

export namespace GB {
    export type env = {
        mem: Memory.Memory;
        regs: Register.Registers;
        flags: Register.Flags;
    }

    export function create(buf: Uint8Array): env {
        return {
            mem: Memory.create(buf),
            regs: Register.createRegisters(),
            flags: Register.createFlags(),
        }
    }


    export function loadUByte(gb: GB.env) : number {
        return Memory.readUByte(gb.mem, gb.regs.pc++);
    }
    export function loadSByte(gb: GB.env) : number {
        return Memory.readSByte(gb.mem, gb.regs.pc++);
    }

    export function loadWord(gb: GB.env) : number{
        const word = Memory.readWord(gb.mem, gb.regs.pc);
        gb.regs.pc += 2;
        return word;
    }
}