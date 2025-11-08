import type { SIRSGroups } from "./SIRSModel";

export default class City {
    readonly id: string | number;
    outgoingFraction: number; // fraction of population that leaves the city per time unit
    groups: SIRSGroups; // represents population states (susceptible, infected, recovered)

    constructor(
        id: string | number,
        outgoingFraction: number = 0,
        groups: Partial<SIRSGroups> = {},
    ) {
        this.id = id;
        this.outgoingFraction = outgoingFraction;
        this.groups = {
            susceptible: groups.susceptible ?? 0,
            infected: groups.infected ?? 0,
            recovered: groups.recovered ?? 0
        };
    }

    get population(): number {
        return this.groups.susceptible + this.groups.infected + this.groups.recovered;
    }

    clonePopulationState(): SIRSGroups {
        return { ...this.groups };
    }
}