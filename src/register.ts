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
    };
    export const createRegisters = (): Registers => {
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
    };

    export type Flags = {
        zero: boolean;
        add_sub: boolean;  // n
        half_carry: boolean;
        carry: boolean;
    };
    export const createFlags = (): Flags => {
        return {
            zero: false,
            add_sub: false,
            half_carry: false,
            carry: false,
        };
    };

    export const updateZ = (gb: Gb.Env, value: number): void => {
        gb.flags.zero = value == 0;
    };
    export const setZ = (gb: Gb.Env, value: number): void => {
        gb.flags.zero = value != 0;
    };
    export const setN = (gb: Gb.Env, value: number): void => {
        gb.flags.add_sub = value != 0;
    };
    export const updateH = (gb: Gb.Env, v1: number, v2: number): void => {
        gb.flags.half_carry = (v1 & 0x0f) < (v2 & 0x0f)
    };
    export const setH = (gb: Gb.Env, value: number): void => {
        gb.flags.half_carry = value != 0;
    };
    export const updateC = (gb: Gb.Env, v1: number, v2: number): void => {
        gb.flags.carry = (v1 & 0xff) < (v2 & 0xff);
    };
    export const setC = (gb: Gb.Env, value: number): void => {
        gb.flags.carry = value != 0;
    };
    export const updateHC = (gb: Gb.Env, v1: number, v2: number): void => {
        updateH(gb, v1, v2);
        updateC(gb, v1, v2);
    };
    export const setNH = (gb: Gb.Env, n: number, h: number): void => {
        setN(gb, n);
        setH(gb, h);
    }
    export const setNHC = (gb: Gb.Env, n: number, h: number, c: number): void => {
        setN(gb, n);
        setH(gb, h);
        setH(gb, c);
    }

    export const flagsToByte = (gb: Gb.Env): number => {
        let f = 0;
        if (gb.flags.zero) f |= 1 << 7;
        if (gb.flags.add_sub) f |= 1 << 6;
        if (gb.flags.half_carry) f |= 1 << 5;
        if (gb.flags.carry) f |= 1 << 4;
        return f;
    };
    export const byteToFlags = (gb: Gb.Env, f: number): void => {
        gb.flags.zero = ((f >> 7) & 1) != 0;
        gb.flags.add_sub = ((f >> 6) & 1) != 0;
        gb.flags.half_carry = ((f >> 5) & 1) != 0;
        gb.flags.carry = ((f >> 4) & 1) != 0;
    };
}

