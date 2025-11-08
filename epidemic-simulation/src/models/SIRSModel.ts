export default class SIRSModel {
    infectionRate: number;
    recoveringRate: number;
    immunityLossRate: number;
    mortalityRate: number;
    natalityRate: number;

    constructor(params: SIRSParameters = {}) {
        this.infectionRate = params.infectionRate ?? 0;
        this.recoveringRate = params.recoveringRate ?? 0;
        this.immunityLossRate = params.immunityLossRate ?? 0;
        this.mortalityRate = params.mortalityRate ?? 0;
        this.natalityRate = params.natalityRate ?? 0;
    }

    updateState(groups: SIRSGroups, deltaT: number) : SIRSGroups {
        let susceptible = groups.susceptible;
        let infected = groups.infected;
        let recovered = groups.recovered;

        const population = susceptible + infected + recovered;

        const dS = deltaT * (
            this.natalityRate * population
            - this.infectionRate * ((susceptible * infected) / population)
            + this.immunityLossRate * recovered
            - this.mortalityRate * susceptible
        );

        const dI = deltaT * (
            this.infectionRate * ((susceptible * infected) / population)
            - this.recoveringRate * infected
            - this.mortalityRate * infected
        );

        const dR = deltaT * (
            this.recoveringRate * infected
            - this.immunityLossRate * recovered
            - this.mortalityRate * recovered
        );

        susceptible += dS;
        infected += dI;
        recovered += dR;

        // Prevent negative values caused by float numbers inaccuracies
        if (susceptible < 0) susceptible = 0;
        if (infected < 0) infected = 0;
        if (recovered < 0) recovered = 0;

        return { susceptible, infected, recovered };
    }   
}

export interface SIRSGroups { 
    susceptible: number; 
    infected: number; 
    recovered: number; 
};

export interface SIRSParameters {
    infectionRate?: number;
    recoveringRate?: number;
    immunityLossRate?: number;
    mortalityRate?: number;
    natalityRate?: number;
}