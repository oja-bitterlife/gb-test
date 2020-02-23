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

        // RAM
        if(0xc000 <= addr && addr <= 0xcfff) return;  // 4KB Work RAM Bank 0 (WRAM)
        if(0xd000 <= addr && addr <= 0xdfff) return;  // 4KB Work RAM Bank 1 (WRAM)  (switchable bank 1-7 in CGB Mode)
        if(0xe000 <= addr && addr <= 0xfdff) return;  // Same as C000-DDFF (ECHO)

        // IO
        if(addr == 0xff40) return;  // LCDC - LCD Control (R/W)
        if(addr == 0xff41) return;  // STAT - LCDC Status (R/W)
        if(addr == 0xff42) return;  // SCY - Scroll Y (R/W)
        if(addr == 0xff43) return;  // SCX - Scroll X (R/W)
        if(addr == 0xff44) return;  // LY - LCDC Y-Coordinate
        if(addr == 0xff45) return;  //  LYC - LY Compare (R/W)

        // Interrupt
        if(addr == 0xff0f) return;  // IF - Interrupt Flag (R/W)
        if(addr == 0xffff) return;  // IE - Interrupt Enable (R/W)

        throw new Error(`Cannot access: 0x${addr.toString(16)}`);
    }
}