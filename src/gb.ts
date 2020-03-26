import { Register } from "./register";
import { Memory } from "./memory";
import { Gpu } from "./gpu";
import { Cpu } from "./cpu";
import { Debug } from "./debug";
import { Interrupt } from "./interrupt";
import { Timer } from "./timer";

export namespace Gb {
    export const CLOCK_SPEED = (1<<22);  // 4.194304 MHz

    export type Env = {
        cycle: number;  // current cycle 
        mem: Uint8Array;
        regs: Register.Registers;
        flags: Register.Flags;
        halt: boolean;  // wait for irq
    };


    export const create = (buf: Uint8Array): Env => {
        return {
            cycle: 0,
            mem: Memory.create(buf),
            regs: Register.createRegisters(),
            flags: Register.createFlags(),
            halt: false,
        }
    };


    // 実行
    // ------------------------------------------------------------------------
    export const step = (gb: Env) => {
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
        Debug.total_step_count++;  // ステップ数を数える

        // タイマー更新
        const trans_cycle = gb.cycle - old_cycle;
        Timer.update(gb, trans_cycle);

        // 割り込みチェック
        if(Interrupt.check(gb)) gb.halt = false;
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