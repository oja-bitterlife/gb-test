import { Register } from "./register";
import { Memory } from "./memory";
import { Gpu } from "./gpu";
import { Cpu } from "./cpu";
import { Debug } from "./debug";

export namespace Gb {
    export type Env = {
        cycle: number;  // current cycle 
        mem: Uint8Array;
        regs: Register.Registers;
        flags: Register.Flags;
    };


    export const create = (buf: Uint8Array): Env => {
        return {
            cycle: 0,
            mem: Memory.create(buf),
            regs: Register.createRegisters(),
            flags: Register.createFlags(),
        }
    };


    // 実行
    // ------------------------------------------------------------------------
    export const step = (gb: Env) => {
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);

        if(gb.regs.ie && (gb.mem[0xffff] & 4) && (gb.mem[0xff0f] & 4)){
            Gb.pushWord(gb, gb.regs.pc);
            gb.mem[0xff0f] &= ~4;
            gb.regs.pc = 0x0050;
        }

        Debug.total_step_count++;  // ステップ数を数える
    };
    export const run = (gb: Env) => {
        while (true) step(gb);
    };


    // memory operation
    // ------------------------------------------------------------------------
    export const loadUByte = (gb: Env): number => {
        return Memory.readUByte(gb.mem, gb.regs.pc++);
    };
    export const loadSByte = (gb: Env): number => {
        return Memory.readSByte(gb.mem, gb.regs.pc++);
    };

    export const loadWord = (gb: Env): number => {
        const word = Memory.readWord(gb.mem, gb.regs.pc);
        gb.regs.pc += 2;
        return word;
    };


    // stack operation
    // ------------------------------------------------------------------------
    export const push = (gb: Env, value: number): void => {
        Memory.writeByte(gb.mem, --gb.regs.sp, value);
    };
    export const pushWord = (gb: Env, value: number): void => {
        push(gb, (value >> 8) & 0xff);
        push(gb, value & 0xff);
    };
    export const pop = (gb: Env): number => {
        return Memory.readUByte(gb.mem, gb.regs.sp++);
    };
    export const popWord = (gb: Env): number => {
        return (pop(gb) & 0xff) | ((pop(gb) & 0xff) << 8);
    };
}