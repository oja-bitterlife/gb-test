import { Gb } from "./gb";
import { Memory } from "./memory";

export namespace Timer {
    let internal_cycle_div = 0;
    let internal_cycle_main = 0;

    export const update = (gb: Gb.Env, cycle: number) => {
        internal_cycle_div += cycle;
        internal_cycle_main += cycle;

        updateDivTimer(gb.mem);
        updateMainTimer(gb.mem);
    };

    const updateMainTimer = (mem: Uint8Array) => {
        if (Memory.readUByte(mem, 0xff07) & 0x04) {
            const consume_cycle = ((mode: number) => {
                switch (mode) {
                    case 0: return Gb.CLOCK_SPEED / 4096;
                    case 1: return Gb.CLOCK_SPEED / 262144;
                    case 2: return Gb.CLOCK_SPEED / 65536;
                    case 3: return Gb.CLOCK_SPEED / 16384;
                    default: throw new Error("timer clock error: " + (mem[0xff07] & 0x03));
                }
            })(Memory.readUByte(mem, 0xff07) & 0x03);

//            for (; internal_cycle_main >= consume_cycle; internal_cycle_main -= consume_cycle) {
            if (internal_cycle_main >= consume_cycle) {
                internal_cycle_main -= consume_cycle;
  
                let tima = Memory.readUByte(mem, 0xff05) + 1;
                if(tima >> 8){  // timer overflow?
                    tima = Memory.readUByte(mem, 0xff06);  // reset

                    // タイマーインタラプト設定
                    const IF = Memory.readUByte(mem, 0xff0f) | 0x04;
                    Memory.writeByte(mem, 0xff0f, IF);
                }
                Memory.writeByte(mem, 0xff05, tima);
            }
        }
    }

    // DIV-TIMER
    const updateDivTimer = (mem: Uint8Array) => {
        const consume_cycle = Gb.CLOCK_SPEED / 16384;
        if (internal_cycle_div >= consume_cycle) {
            internal_cycle_div -= consume_cycle;

            const div = Memory.readUByte(mem, 0xff04);
            Memory.writeByte(mem, 0xff04, (div+1) & 0xff);
        }
    }
    export const resetDivTimer = (mem: Uint8Array, value: Number) => {
        internal_cycle_div = 0;
//        Memory.writeByte(mem, 0xff04, 0);  // リセットも書き込みなので中でresetDivTimerが呼ばれるので使わない
        mem[0xff04] = 0;
    }
}
