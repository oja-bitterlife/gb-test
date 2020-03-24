import { Gb } from "./gb";

export namespace Interrupt {
    // フラグが立っていたら割り込み実行
    const _check = (gb: Gb.Env, flag_bit: number, addr: number) => {
        const flag = 1 << flag_bit;

        // IE & IF
        if((gb.mem[0xffff] & flag) && (gb.mem[0xff0f] & flag)){
            gb.mem[0xff0f] &= ~flag;  // この割り込みは処理済みなのでフラグを落とす

            // 割り込み
            Gb.pushWord(gb, gb.regs.pc);
            gb.regs.pc = addr;

            return true;
        }
        return false;
    };

    // Bit 0: V-Blank  Interrupt Request (INT 40h)  (1=Request)
    // Bit 1: LCD STAT Interrupt Request (INT 48h)  (1=Request)
    // Bit 2: Timer    Interrupt Request (INT 50h)  (1=Request)
    // Bit 3: Serial   Interrupt Request (INT 58h)  (1=Request)
    // Bit 4: Joypad   Interrupt Request (INT 60h)  (1=Request)
    export const check = (gb: Gb.Env) => {
        // timer
        if(_check(gb, 0, 0x0040)) return;
        if(_check(gb, 1, 0x0048)) return;
        if(_check(gb, 2, 0x0050)) return;
        if(_check(gb, 3, 0x0058)) return;
        if(_check(gb, 4, 0x0060)) return;
    }
}
