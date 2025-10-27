
class SIRS {
    private _susceptible: number = 0;
    public get susceptible(): number {
        return this._susceptible;
    }
    public set susceptible(value: number) {
        if(this._susceptible < 0) throw RangeError("The value of susceptible individuals should be greater than 0.");
        this._susceptible = value;
    }

    infected: number;
    recovered: number;

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
}


export default SIRS;