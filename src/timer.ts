import { Gb } from "./gb";
import { Memory } from "./memory";

export namespace Timer {
    export let current_time = 0;

    export const update = (gb: Gb.Env, cycle: number) => {
        if (Memory.readUByte(gb.mem, 0xff07) & 0x04) {
            const consume_cycle = ((mode: number) => {
                switch (mode) {
                    case 0: return (1 << 22) / 4096;
                    case 1: return (1 << 22) / 262144;
                    case 2: return (1 << 22) / 65536;
                    case 3: return (1 << 22) / 16384;
                    default: throw new Error("timer clock error: " + (gb.mem[0xff07] & 0x03));
                }
            })(Memory.readUByte(gb.mem, 0xff06) & 0x03);

            for (; cycle >= 0; cycle -= consume_cycle) {
                let tima = Memory.readUByte(gb.mem, 0xff05) + 1;
                if(tima >> 8){
                    tima = Memory.readUByte(gb.mem, 0xff06);

                    // タイマーインタラプト設定
                    const IF = Memory.readUByte(gb.mem, 0xff0f) | 0x04;
                    Memory.writeByte(gb.mem, 0xff0f, IF);
                }
                Memory.writeByte(gb.mem, 0xff05, tima);
            }
        }
    };
}
