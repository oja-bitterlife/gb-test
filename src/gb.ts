import { Register } from "./register";
import { Memory } from "./memory";

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