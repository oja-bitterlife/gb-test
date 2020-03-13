export namespace Interrupt {
    // Bit 0: V-Blank  Interrupt Enable  (INT 40h)  (1=Enable)
    // Bit 1: LCD STAT Interrupt Enable  (INT 48h)  (1=Enable)
    // Bit 2: Timer    Interrupt Enable  (INT 50h)  (1=Enable)
    // Bit 3: Serial   Interrupt Enable  (INT 58h)  (1=Enable)
    // Bit 4: Joypad   Interrupt Enable  (INT 60h)  (1=Enable)
    enum Bit {
        VBlank = 1 << 0,
        LCDStat = 1 << 1,
        Timer = 1 << 2,
        Serial = 1 << 3,
        Joypad = 1 << 4,
    }

    export type Interrupt = {
        enabled: boolean;  // enable/disable
    };

}