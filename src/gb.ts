import { Register } from "./register";
import { Memory } from "./memory";
import { Gpu } from "./gpu";
import { Cpu } from "./cpu";

export namespace Gb {
    export type Env = {
        cycle: number;  // current cycle 
        mem: Memory.Memory;
        regs: Register.Registers;
        flags: Register.Flags;
    }


    export function create(buf: Uint8Array): Env {
        return {
            cycle: 0,
            mem: Memory.create(buf),
            regs: Register.createRegisters(),
            flags: Register.createFlags(),
        }
    }


    // 実行
    // ------------------------------------------------------------------------
    export function step(gb: Env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
    }
    export function run(gb: Env){
        while(true) step(gb);
    }


    // memory operation
    // ------------------------------------------------------------------------
    export function loadUByte(gb: Env) : number {
        return Memory.readUByte(gb.mem, gb.regs.pc++);
    }
    export function loadSByte(gb: Env) : number {
        return Memory.readSByte(gb.mem, gb.regs.pc++);
    }

    export function loadWord(gb: Env) : number{
        const word = Memory.readWord(gb.mem, gb.regs.pc);
        gb.regs.pc += 2;
        return word;
    }


    // stack operation
    // ------------------------------------------------------------------------
    export function push(gb: Env, value: number) : void{
        Memory.writeByte(gb.mem, gb.regs.sp--, value);
    }
    export function pushWord(gb: Env, value : number) : void{
        push(gb, (value >> 8) & 0xff);
        push(gb, value & 0xff);
    }
    export function pop(gb: Env) : number {
        return Memory.readSByte(gb.mem, ++gb.regs.sp);
    }
    export function popWord(gb: Env) : number{
        return (pop(gb)&0xff) | ((pop(gb)&0xff)<<8);
    }
}