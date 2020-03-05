import { Register } from "./register";
import { Memory } from "./memory";
import { Gpu } from "./gpu";
import { Cpu } from "./cpu";

export namespace Gb {
    export type env = {
        cycle: number;  // current cycle 
        mem: Memory.Memory;
        regs: Register.Registers;
        flags: Register.Flags;
    }


    export function create(buf: Uint8Array): env {
        return {
            cycle: 0,
            mem: Memory.create(buf),
            regs: Register.createRegisters(),
            flags: Register.createFlags(),
        }
    }


    // １命令実行
    export function step(gb: env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
    }


    // memory operation
    export function loadUByte(gb: env) : number {
        return Memory.readUByte(gb.mem, gb.regs.pc++);
    }
    export function loadSByte(gb: env) : number {
        return Memory.readSByte(gb.mem, gb.regs.pc++);
    }

    export function loadWord(gb: env) : number{
        const word = Memory.readWord(gb.mem, gb.regs.pc);
        gb.regs.pc += 2;
        return word;
    }


    // stack operation
    export function push(gb: env, value: number) : void{
        Memory.writeByte(gb.mem, gb.regs.sp--, value);
    }
    export function pushWord(gb: env, value : number) : void{
        push(gb, (value >> 8) & 0xff);
        push(gb, value & 0xff);
    }
    export function pop(gb: env) : number {
        return Memory.readSByte(gb.mem, ++gb.regs.sp);
    }
    export function popWord(gb: env) : number{
        return (pop(gb)&0xff) | ((pop(gb)&0xff)<<8);
    }
}