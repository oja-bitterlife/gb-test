export namespace Interrupt {
    // Bit 0: V-Blank  Interrupt Enable  (INT 40h)  (1=Enable)
    // Bit 1: LCD STAT Interrupt Enable  (INT 48h)  (1=Enable)
    // Bit 2: Timer    Interrupt Enable  (INT 50h)  (1=Enable)
    // Bit 3: Serial   Interrupt Enable  (INT 58h)  (1=Enable)
    // Bit 4: Joypad   Interrupt Enable  (INT 60h)  (1=Enable)
    type Interrupts = {
        vblank: boolean;
        lcd_stat: boolean;
        time: boolean;
        Serial: boolean;
        Joypad: boolean;
    }

    export type Interrupt = {
        enabled: boolean;  // enable/disable

        int_flag: Interrupts;
        int_enable: Interrupts;
    }

    export function create(): Interrupt {
        return {
            enabled: false,
            int_flag: {
                vblank: false,
                lcd_stat: false,
                time: false,
                Serial: false,
                Joypad: false,
            },
            int_enable: {
                vblank: false,
                lcd_stat: false,
                time: false,
                Serial: false,
                Joypad: false,
            },
        }
    }


}