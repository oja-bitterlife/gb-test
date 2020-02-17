import { Memory } from "./memory";
import { GB } from "./gb";

export namespace Gpu {
    enum Addr {
        ly = 0xff44,
    }

    // A complete cycle through these states takes 456 clks.
    // VBlank lasts 4560 clks.
    // A complete screen refresh occurs every 70224 clks.)
    const CYCLE_PER_LINE = 456;
    const COMPLETE_REFRESH = 70224;
    const VBLANK_START = COMPLETE_REFRESH - 4560;

    export function step(gb: GB.env, old_cycle: number) {
        const now_gpu_cycle = gb.cycle % CYCLE_PER_LINE
        const old_gpu_cycle = old_cycle % CYCLE_PER_LINE

        if (now_gpu_cycle != old_gpu_cycle) {
            addLY(gb.mem);  // inc LY
        }
    }
    function addLY(mem: Memory.Memory, value = 1) {
        // 画面縦幅を超えたら０に戻す
        const ly = (Memory.readUByte(mem, Addr.ly) + value) % (COMPLETE_REFRESH / CYCLE_PER_LINE);
        Memory.writeByte(mem, Addr.ly, ly);
    }

    function checkMode(cycle: number) {
        // Mode 0 is present between 201-207 clks, 2 about 77-83 clks, and 3 about 169-175 clks.
        if (201 <= cycle && cycle <= 207) return 0;
        if (77 <= cycle && cycle <= 83) return 2;
        if (169 <= cycle && cycle <= 175) return 3;
    }
}