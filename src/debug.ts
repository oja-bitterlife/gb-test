import { Gb } from "./gb";
import { Op } from "./op";
import { Cpu } from "./cpu";
import { Gpu } from "./gpu";
import { Memory } from "./memory";

export namespace Debug {
    function printDisasm(gb: Gb.env) {
        const op_code = Gb.loadUByte(gb);
        console.log(Op.formatDisAsm(op_code, gb));
        gb.regs.pc--;  // loadした分戻す
    }

    // ステップ実行
    export function stepIn(gb: Gb.env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);

        printDisasm(gb);
    }
    export function stepOut(gb: Gb.env){
        if(gb.mem[gb.regs.pc] == 0xcd) stepOver(gb); // call
        else stepIn(gb);
    }
    export function stepOver(gb: Gb.env){
        while(gb.mem[gb.regs.pc] != 0xc9) Gb.step(gb);  // RET前まで実行
        stepIn(gb);  // RETを実行
    }


    // Breakポイントまで実行
    export function runBreak(gb: Gb.env, breakAddrList: number[]){
        while(breakAddrList.indexOf(gb.regs.pc) == -1) Gb.step(gb);
        printDisasm(gb);
    }

    // VBlankまでステップ実行
    export function runVBlank(gb: Gb.env){
        while(true){
            const old_ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);

            Gb.step(gb);

            // VBlank start
            const ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);
            if(ly == 144 && ly != old_ly) break;
        }
        printDisasm(gb);
    }
}