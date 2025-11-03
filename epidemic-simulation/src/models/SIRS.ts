import {  }

class SIRS {
    susceptible: number;
    infected: number;
    recovered: number;
    city: City;

    infectionRate: number;
    recoveringRate: number;
    immunityRate: number;
    immunityLossRate: number;
    mortalityRate: number;
    natalityRate: number;

    constructor(
        susceptible: number = 0,
        infected: number = 0,
        recovered: number = 0,
        infectionRate: number = 0,
        recoveringRate: number = 0,
        immunityRate: number = 0,
        immunityLossRate: number = 0,
        mortalityRate: number = 0,
        natalityRate: number = 0
    ) {
        this.susceptible = susceptible;
        this.infected = infected;
        this.recovered = recovered;

        this.infectionRate = infectionRate;
        this.recoveringRate = recoveringRate;
        this.immunityRate = immunityRate;
        this.immunityLossRate = immunityLossRate;
        this.mortalityRate = mortalityRate;
        this.natalityRate = natalityRate;
    }

    updateState(deltaT: number) {
        const population = this.susceptible + this.infected + this.recovered;

        const dS = deltaT * (
            this.natalityRate * population
            - this.infectionRate * ((this.susceptible * this.infected) / population)
            + this.immunityLossRate * this.recovered
            - this.mortalityRate * this.susceptible
        );

        const dI = deltaT * (
            this.infectionRate * ((this.susceptible * this.infected) / population)
            - this.recoveringRate * this.infected
            - this.mortalityRate * this.infected
        );

        const dR = deltaT * (
            this.recoveringRate * this.infected
            - this.immunityLossRate * this.recovered
            - this.mortalityRate * this.recovered
        );

        this.susceptible += dS;
        this.infected += dI;
        this.recovered += dR;

        // Prevent negative values caused by float numbers inaccuracies
        if (this.susceptible < 0) this.susceptible = 0;
        if (this.infected < 0) this.infected = 0;
        if (this.recovered < 0) this.recovered = 0;
    }
}


export default SIRS;