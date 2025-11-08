import type { SIRSGroups } from "./SIRSModel";

export default class City {
    readonly id: string | number;
    name: string;
    groups: SIRSGroups; // represents population states (susceptible, infected, recovered)

    constructor(
        id: string | number,
        groups: Partial<SIRSGroups> = {},
        name: string
    ) {
        this.id = id;
        this.name = name;
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