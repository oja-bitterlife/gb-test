export namespace Memory {
    export type Memory = {
        rom: Uint8Array;
    }

    export function create(rom_: Uint8Array): Memory {
        return {
            rom: rom_,
        };
    }

    export function readByte(mem: Memory, addr: number): number {
        return mem.rom[addr];
    }
}