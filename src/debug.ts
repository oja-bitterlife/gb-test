export namespace Debug {
    export type Breaks = {
        return: boolean;
        vBlank: boolean;
    }

    export function createBreaks() : Breaks {
        return {
            return : false,
            vBlank : false,
        };
    }
}