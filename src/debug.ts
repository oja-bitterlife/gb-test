import { Gb } from "./gb";
import { Op } from "./op";
import { OpCb } from "./op_cb";
import { Cpu } from "./cpu";
import { Gpu } from "./gpu";
import { Memory } from "./memory";

export namespace Debug {
    export let total_step_count = 0;  // ステップ数を実行する

    export const printDisasm = (gb: Gb.Env): void => {
        const op_code = Gb.loadUByte(gb);

        if (op_code != 0xcb) {
            console.log(Op.formatDisAsm(op_code, gb));
            gb.regs.pc -= 1;  // loadした分戻す
        } 
        else {
            const cb_code = Gb.loadUByte(gb);
            console.log(OpCb.formatDisAsm(cb_code, gb));
            gb.regs.pc -= 2;  // loadした分戻す
        }
    };

    // ステップ実行
    // ------------------------------------------------------------------------
    // step over callの中に入らない
    export const stepOver = (gb: Gb.Env): void => {
        if (gb.mem[gb.regs.pc] == 0xcd // call
        || gb.mem[gb.regs.pc] == 0xc4 && gb.flags.zero == false  // call nz
        ){
            Debug.runBreak(gb, [gb.regs.pc+3]);  // goto call next            
        }
        else Gb.step(gb);
    };
    // step out callの外にでる。途中で別のRETが来たらそこで止まる
    export const stepOut = (gb: Gb.Env): void => {
        while (true){
            // retが実行される時は停止する
            if(gb.mem[gb.regs.pc] != 0xc9  // ret
            || (gb.mem[gb.regs.pc] != 0xc8 && gb.flags.zero)  // ret z
            || (gb.mem[gb.regs.pc] != 0xd8 && gb.flags.carry)  // ret c
            ) break;

            Gb.step(gb);  // RETでないときの実行
        }
        Gb.step(gb);  // RETを実行
    };


    // Break付き実行
    // ------------------------------------------------------------------------
    // Breakポイントまで実行
    export const runBreak = (gb: Gb.Env, breakAddrList: number[]): void => {
        while (breakAddrList.indexOf(gb.regs.pc) == -1) Gb.step(gb);
    };

    // VBlankまで実行
    export const runVBlank = (gb: Gb.Env): void => {
        while (true) {
            const old_ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);

            Gb.step(gb);

            // VBlank start
            const ly = Memory.readUByte(gb.mem, Gpu.Addr.ly);
            if (ly == 144 && ly != old_ly) break;
        }
    };

    export const dumpBytes = (mem: Uint8Array, offset: number, width: number, height: number): void => {
        for (let y = 0; y < height; y++) {
            let line = "";
            for (let x = 0; x < width; x++) {
                let hex = mem[offset + y * width + x].toString(16);
                if (hex.length == 1) hex = "0" + hex;
                line += hex + ",";
            }
            console.log(line);
        }
    };
}