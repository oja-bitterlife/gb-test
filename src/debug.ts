import { Gb } from "./gb";
import { Op } from "./op";
import { Cpu } from "./cpu";
import { Gpu } from "./gpu";
import { Memory } from "./memory";

export namespace Debug {
    export function printDisasm(gb: Gb.Env) {
        const op_code = Gb.loadUByte(gb);
        console.log(Op.formatDisAsm(op_code, gb));
        gb.regs.pc--;  // loadした分戻す
    }

    // ステップ実行
    // ------------------------------------------------------------------------
    // step into
    export function stepIn(gb: Gb.Env){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
    }
    // step over callの中に入らない
    export function stepOver(gb: Gb.Env){
        if(gb.mem[gb.regs.pc] == 0xcd) stepOut(gb); // call
        else stepIn(gb);
    }
    // step out callの外にでる。途中で別のRETが来たらそこで止まる
    export function stepOut(gb: Gb.Env){
        while(gb.mem[gb.regs.pc] != 0xc9) Gb.step(gb);  // RET前まで実行
        stepIn(gb);  // RETを実行
    }


    // Break付き実行
    // ------------------------------------------------------------------------
    // Breakポイントまで実行
    export function runBreak(gb: Gb.Env, breakAddrList: number[]){
        while(breakAddrList.indexOf(gb.regs.pc) == -1) Gb.step(gb);
    }

    // VBlankまで実行
    export function runVBlank(gb: Gb.Env){
        while(true){
            const old_ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);

            Gb.step(gb);

            // VBlank start
            const ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);
            if(ly == 144 && ly != old_ly) break;
        }
    }

    export function dumpBytes(mem: Memory.Memory, offset: number, width: number, height: number) {
        for (let y = 0; y < height; y++) {
            let line = "";
            for (let x = 0; x < width; x++) {
                let hex = mem[offset + y * width + x].toString(16);
                if (hex.length == 1) hex = "0" + hex;
                line += hex + ",";
            }
            console.log(line);
        }
    }
}