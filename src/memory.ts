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

        // VRAM
        if(0x8000 <= addr && addr <= 0x9fff) return;
        if(0xfe00 <= addr && addr <= 0xfe9f) return; // Sprite Attribute Table (OAM)

        // RAM
        if(0xc000 <= addr && addr <= 0xcfff) return;  // 4KB Work RAM Bank 0 (WRAM)
        if(0xd000 <= addr && addr <= 0xdfff) return;  // 4KB Work RAM Bank 1 (WRAM)  (switchable bank 1-7 in CGB Mode)
        if(0xe000 <= addr && addr <= 0xfdff) return;  // Same as C000-DDFF (ECHO)

        if(0xa000 <= addr && addr <= 0xbfff) return; // 8KB External RAM
        if(0xff80 <= addr && addr <= 0xfffe) return; // High RAM (HRAM)

        // IO
        if(addr == 0xff40) return;  // LCDC - LCD Control (R/W)
        if(addr == 0xff41) return;  // STAT - LCDC Status (R/W)
        if(addr == 0xff42) return;  // SCY - Scroll Y (R/W)
        if(addr == 0xff43) return;  // SCX - Scroll X (R/W)
        if(addr == 0xff44) return;  // LY - LCDC Y-Coordinate
        if(addr == 0xff45) return;  //  LYC - LY Compare (R/W)
        if(addr == 0xff47) return;  //  BG & Window Palette Data (R/W)
        if(addr == 0xff48) return;  //  Object Palette 0 Data (R/W)
        if(addr == 0xff49) return;  //  Object Palette 1 Data (R/W)

        if(addr == 0xff00) return;  // P1/JOYP - Joypad (R/W)
        if(addr == 0xff01) return;  // SB - Serial transfer data (R/W)
        if(addr == 0xff02) return;  // SC - Serial Transfer Control (R/W)
        if(addr == 0xff04) return;  // DIV - Divider Register (R/W)
        if(addr == 0xff05) return;  // TIMA - Timer counter (R/W)
        if(addr == 0xff06) return;  // TMA - Timer Modulo (R/W)
        if(addr == 0xff07) return;  // TAC - Timer Control (R/W)

        // Interrupt
        if(addr == 0xff0f) return;  // IF - Interrupt Flag (R/W)
        if(addr == 0xffff) return;  // IE - Interrupt Enable (R/W)

        // others
        if(0xfea0 <= addr && addr <= 0xfeff) return;  // Not Usable

        throw new Error(`Cannot access: 0x${addr.toString(16)}`);
    }
}