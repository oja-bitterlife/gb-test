
export class Header {
    readonly game_title: string;
    readonly cartridge_type: number;
    readonly rom_size: number;
    readonly ram_size: number;

    constructor(buf: Uint8Array) {
        this.game_title = (new TextDecoder).decode(buf.slice(0x134, 0x142 + 1));
        this.cartridge_type = buf[0x147];
        this.rom_size = (buf[0x148] <= 6) ? 256 << buf[0x148] : [9 * 1024, 10 * 1024, 12 * 1024][buf[0x148] - 0x52];
        this.ram_size = [0, 16, 64, 256, 1024][buf[0x149]];
    }
}
