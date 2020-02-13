export namespace Memory {
    export type Memory = Uint8Array;

    export function create(rom_: Uint8Array): Memory {
        let mem = new Uint8Array(65536);
        for(let i = 0; i < rom_.length && i < mem.length; i++) mem[i] = rom_[i];
        return mem;
    }

    export function readUByte(mem: Memory, addr: number): number {
        return mem[addr];
    }
    export function readSByte(mem: Memory, addr: number): number {
        if(mem[addr]&0x80) return -(((mem[addr]^0xff)+1)&0xff);
        return mem[addr];
    }
    export function readWord(mem: Memory, addr: number) : number{
        return (mem[addr+1] << 8) | mem[addr];
    }

}