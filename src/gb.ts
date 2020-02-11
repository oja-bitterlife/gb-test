import { Register } from "./register";
import { Memory } from "./memory";
//import { CPU } from "./cpu";

export namespace GB {
    export type env = {
        memory: Memory.Memory;
        registers: Register.Registers;
        flags: Register.Flags;
    }

    export function create(buf: Uint8Array): env {
        return {
            memory: Memory.create(buf),
            registers: Register.create_registers(),
            flags: Register.create_flags(),
        }
    }


    export function loadByte(gb: GB.env) : number {
        return gb.memory.rom[gb.registers.pc++];
    }

    export function loadWord(gb: GB.env) : number{
        const word = (gb.memory.rom[gb.registers.pc+1] << 8) | gb.memory.rom[gb.registers.pc];
        gb.registers.pc += 2;
        return word;
    }
}