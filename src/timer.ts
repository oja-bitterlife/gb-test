import { Gb } from "./gb";
import { Memory } from "./memory";

export namespace Timer {
    let internal_cycle_heap = 0;

    export const update = (gb: Gb.Env, cycle: number) => {
        internal_cycle_heap += cycle;

        if (Memory.readUByte(gb.mem, 0xff07) & 0x04) {
            const consume_cycle = ((mode: number) => {
                switch (mode) {
                    case 0: return Gb.CLOCK_SPEED / 4096;
                    case 1: return Gb.CLOCK_SPEED / 262144;
                    case 2: return Gb.CLOCK_SPEED / 65536;
                    case 3: return Gb.CLOCK_SPEED / 16384;
                    default: throw new Error("timer clock error: " + (gb.mem[0xff07] & 0x03));
                }
            })(Memory.readUByte(gb.mem, 0xff07) & 0x03);

            for (; internal_cycle_heap >= 0; internal_cycle_heap -= consume_cycle) {
                let tima = Memory.readUByte(gb.mem, 0xff05) + 1;
                if(tima >> 8){  // timer overflow?
                    tima = Memory.readUByte(gb.mem, 0xff06);  // reset

                    // タイマーインタラプト設定
                    const IF = Memory.readUByte(gb.mem, 0xff0f) | 0x04;
                    Memory.writeByte(gb.mem, 0xff0f, IF);
                }
                Memory.writeByte(gb.mem, 0xff05, tima);
            }
        }
    };
}
