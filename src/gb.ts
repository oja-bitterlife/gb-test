import { Register } from "./register";
import { Memory } from "./memory";
import { Gpu } from "./gpu";
import { Cpu } from "./cpu";
import { Debug } from "./debug";
import { Op } from "./op";

export namespace GB {
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
    function step(gb: GB.env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
    }

    // ステップ実行
    export function stepIn(gb: GB.env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);

        Debug.printDisasm(gb);
    }
    export function stepOut(gb: GB.env){
        if(gb.mem[gb.regs.pc] == 0xcd) stepOver(gb); // call
        else stepIn(gb);
    }
    export function stepOver(gb: GB.env){
        while(gb.mem[gb.regs.pc] != 0xc9) step(gb);  // RET前まで実行
        stepIn(gb);  // RETを実行
    }


    // Breakポイントまで実行
    export function runBreak(gb: GB.env, breakAddrList: number[]){
        while(breakAddrList.indexOf(gb.regs.pc) == -1) step(gb);
        Debug.printDisasm(gb);
    }

    // VBlankまでステップ実行
    export function runVBlank(gb: GB.env){
        while(true){
            const old_ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);

            step(gb);

            // VBlank start
            const ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);
            if(ly == 144 && ly != old_ly) break;
        }
        Debug.printDisasm(gb);
    }


    // memory operation
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


    // stack operation
    export function push(gb: GB.env, value: number) : void{
        Memory.writeByte(gb.mem, gb.regs.sp--, value);
    }
    export function pushWord(gb: GB.env, value : number) : void{
        push(gb, (value >> 8) & 0xff);
        push(gb, value & 0xff);
    }
    export function pop(gb: GB.env) : number {
        return Memory.readSByte(gb.mem, ++gb.regs.sp);
    }
    export function popWord(gb: GB.env) : number{
        return (pop(gb)&0xff) | ((pop(gb)&0xff)<<8);
    }
}