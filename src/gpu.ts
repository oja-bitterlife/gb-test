import { Memory } from "./memory";
import { Gb } from "./gb";

export namespace Gpu {
    export enum Addr {
        stat = 0xff41,  // FF41 - STAT - LCDC Status (R/W)
        ly = 0xff44,  // FF44 - LY - LCDC Y-Coordinate (R)
    }

    // A complete cycle through these states takes 456 clks.
    // VBlank lasts 4560 clks.
    // A complete screen refresh occurs every 70224 clks.)
    const CYCLE_PER_LINE = 456;
    const COMPLETE_REFRESH = 70224;
    const VBLANK_START = COMPLETE_REFRESH - 4560;

    export function step(gb: Gb.Env, old_cycle: number) {
        const now_gpu_cycle = gb.cycle % CYCLE_PER_LINE
        const old_gpu_cycle = old_cycle % CYCLE_PER_LINE

        if (now_gpu_cycle != old_gpu_cycle) {
            const ly = addLY(gb.mem, 1);  // inc LY
            updateMode(now_gpu_cycle, gb.mem);
        }
    }
    function addLY(mem: Memory.Memory, value : number): number {
        // 画面縦幅を超えたら０に戻す
        const ly = (Memory.readUByte(mem, Addr.ly) + value) % (COMPLETE_REFRESH / CYCLE_PER_LINE);
        Memory.writeByte(mem, Addr.ly, ly);
        return ly;
    }

    // FF41 - STAT - LCDC Status (R/W)
    // Bit 6 - LYC=LY Coincidence Interrupt (1=Enable) (Read/Write)
    // Bit 5 - Mode 2 OAM Interrupt         (1=Enable) (Read/Write)
    // Bit 4 - Mode 1 V-Blank Interrupt     (1=Enable) (Read/Write)
    // Bit 3 - Mode 0 H-Blank Interrupt     (1=Enable) (Read/Write)
    // Bit 2 - Coincidence Flag  (0:LYC<>LY, 1:LYC=LY) (Read Only)
    // Bit 1-0 - Mode Flag       (Mode 0-3, see below) (Read Only)
    //           0: During H-Blank
    //           1: During V-Blank
    //           2: During Searching OAM-RAM
    //           3: During Transfering Data to LCD Driver

    function updateMode(cycle: number, mem: Memory.Memory) {
        const stat = Memory.readUByte(mem, Addr.stat) & ~0x3;
        Memory.writeByte(mem, Addr.stat, stat | getMode(cycle));
    }

    // Mode 0 is present between 201-207 clks, 2 about 77-83 clks, and 3 about 169-175 clks.
    function getMode(cycle: number) {
        if(201 <= cycle && cycle <= 207) return 0;
        if(77 <= cycle && cycle <= 83) return 2;
        if(169 <= cycle && cycle <= 175) return 3;
        return 1;  // VBlank mode
    }

}