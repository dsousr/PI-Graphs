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
    
    getBasicReproductionNumber(): number {
        // R0 > 1 => each infected person infects more than one person on average (epidemic spreads)
        // R0 < 1 => each infected person infects less than one person on average (epidemic dies out)
        // R0 == 1 => each infected person infects one person on average (disease remains stable)
        const denominator = this.recoveringRate + this.mortalityRate;
        return denominator > 0 ? this.infectionRate / denominator : 0;
    }

    getEffectiveReproductionNumber(groups: SIRSGroups): number {
        const population = groups.susceptible + groups.infected + groups.recovered;
        if (population === 0) return 0;
        const R0 = this.getBasicReproductionNumber();
        return R0 * (groups.susceptible / population);
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