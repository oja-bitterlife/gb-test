export namespace Memory {
    export type Memory = Uint8Array;

    export function create(rom_: Uint8Array): Memory {
        let mem = new Uint8Array(65536);
        for (let i = 0; i < rom_.length && i < mem.length; i++) mem[i] = rom_[i];
        return mem;
    }


    // 読み書き基本セット
    // ************************************************************************
    export function readUByte(mem: Memory, addr: number): number {
        _checkImplement(addr);
        return mem[addr];
    }
    export function readSByte(mem: Memory, addr: number): number {
        _checkImplement(addr);
        if (mem[addr] & 0x80) return -(((mem[addr] ^ 0xff) + 1) & 0xff);
        return mem[addr];
    }
    export function readWord(mem: Memory, addr: number): number {
        _checkImplement(addr);
        return (mem[addr + 1] << 8) | mem[addr];
    }

    export function writeByte(mem: Memory, addr: number, value: number) {
        _checkImplement(addr);
        return mem[addr] = value;
    }


    // デバッグ用
    // ************************************************************************
    // 未実装なとき例外を出す。デバッグ用
    function _checkImplement(addr: number){
        // main memory (ROM)
        if(addr < 0x8000) return;

        // IO
        if(addr == 0xff44) return;

        throw new Error(`Cannot access: 0x${addr.toString(16)}`);
    }
}