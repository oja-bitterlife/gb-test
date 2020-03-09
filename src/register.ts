import { Gb } from "./gb";

export namespace Register {

    export type Registers = {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        h: number;
        l: number;
        sp: number;
        pc: number;
        ie: boolean;
    }

    export type Flags = {
        zero: boolean;
        add_sub: boolean;  // n
        half_carry: boolean;
        carry: boolean;
    }

    export function createRegisters(): Registers {
        return {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            h: 0,
            l: 0,
            sp: 0,
            pc: 0x100,
            ie: false,
        };
    }

    export function createFlags(): Flags {
        return {
            zero: false,
            add_sub: false,
            half_carry: false,
            carry: false,
        };
    }


    export function updateFlags(gb: Gb.Env, value: number, flagOp: number) {
        if((flagOp>>7)&1) gb.flags.zero = value == 0;
        gb.flags.add_sub = ((flagOp>>6)&1) != 0;
        if((flagOp>>5)&1) gb.flags.half_carry = (value & 0x0f) < (value & 0x0f)
        if((flagOp>>4)&1) gb.flags.carry = (value & 0x80) != 0;
    }
    export function flagsToByte(gb: Gb.Env): number {
        let f = 0;
        if (gb.flags.zero) f |= 1 << 7;
        if (gb.flags.add_sub) f |= 1 << 6;
        if (gb.flags.half_carry) f |= 1 << 5;
        if (gb.flags.carry) f |= 1 << 4;
        return f;
    }
    export function byteToFlags(gb: Gb.Env, f : number) {
        gb.flags.zero = ((f>>7)&1) != 0;
        gb.flags.add_sub = ((f>>6)&1) != 0;
        gb.flags.half_carry = ((f>>5)&1) != 0;
        gb.flags.carry = ((f>>7)&4) != 0;
    }



}

