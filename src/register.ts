import { GB } from "./gb";

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
    }

    export type Flags = {
        zero: boolean;
        add_sub: boolean;  // n
        half_carry: boolean;
        carry: boolean;
    }

    export function createRegisters() : Registers {
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
        };
    }

    export function createFlags() : Flags {
        return {
            zero: false,
            add_sub: false,
            half_carry: false,
            carry: false,
        };
    }


    export function updateFlags(gb: GB.env, value: number, n_flag:boolean){
        gb.flags.zero = (gb.registers.a - value) == 0;
        gb.flags.carry = gb.registers.a < value;
        gb.flags.half_carry = (gb.registers.a & 0x0f) < (value & 0x0f);
        gb.flags.add_sub = n_flag;
    }

}

