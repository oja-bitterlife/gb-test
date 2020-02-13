export namespace Memory {
    export type Memory = {
        rom: Uint8Array;
    }

    export function create(rom_: Uint8Array): Memory {
        return {
            rom: rom_,
        };
    }

    export function readUByte(mem: Memory, addr: number): number {
        return mem.rom[addr];
    }
    export function readSByte(mem: Memory, addr: number): number {
        if(mem.rom[addr]&0x80) return -(((mem.rom[addr]^0xff)+1)&0xff);
        return mem.rom[addr];
    }
    export function readWord(mem: Memory, addr: number) : number{
        return (mem.rom[addr+1] << 8) | mem.rom[addr];
    }

}