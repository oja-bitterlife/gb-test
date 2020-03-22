import { Gb } from "./gb";

export namespace Interrupt {
    const _check = (gb: Gb.Env, flag_bit: number, addr: number) => {
        const flag = 1 << flag_bit;

        if((gb.mem[0xffff] & flag) && (gb.mem[0xff0f] & flag)){
            gb.mem[0xff0f] &= ~flag;

            Gb.pushWord(gb, gb.regs.pc);
            gb.regs.pc = 0x0050;

            return true;
        }
        return false;
    };

    export const check = (gb: Gb.Env) => {
        // timer
        if(_check(gb, 2, 0x0050)) return;  // timer overfllow
    }
}
