export namespace Debug {
    export type Breaks = {
        return: boolean;
        vBlank: boolean;
    }

    export function resetBreak(breaks: Breaks){
        breaks.return = false;
        breaks.vBlank = false;
    }
}