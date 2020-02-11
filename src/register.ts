export namespace Register {

    export type Registers = {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;
        h: number;
        l: number;
        sp: number;
        pc: number;
    }

    export type Flags = {
        carry: boolean;
        half_carry: boolean;
        negative: boolean;
        zero: boolean;
    }

    export function create_registers() : Registers {
        return {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            f: 0,
            h: 0,
            l: 0,
            sp: 0,
            pc: 0x100,
        };
    }

    export function create_flags() : Flags {
        return {
            carry: false,
            half_carry: false,
            negative: false,
            zero: false,
        };
    }
}

