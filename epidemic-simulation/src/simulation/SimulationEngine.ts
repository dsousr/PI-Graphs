import EpidemicNetworkSystem from "../models/EpidemicNetworkSystem";
import City from "../models/City";

export interface SimulationObserver {
    updateOnTick(cities: City[], tick: number): void;
}

export default class SimulationEngine {
    private readonly system: EpidemicNetworkSystem;
    private readonly observers = new Set<SimulationObserver>();
    private tickCount = 0;

    constructor(system: EpidemicNetworkSystem) {
        this.system = system;
    }

    addObserver(observer: SimulationObserver): void {
        this.observers.add(observer);
    }

    removeObserver(observer: SimulationObserver): void {
        this.observers.delete(observer);
    }

    private notifyObservers(): void {
        const citiesSnapshot = this.system
            .getCities()
            .map(c => new City(c.id, c.clonePopulationState()));
        for (const observer of this.observers) {
            observer.updateOnTick(citiesSnapshot, this.tickCount);
        }
    }

    step(deltaT: number): void {
        this.system.step(deltaT);
        this.tickCount++;
        this.notifyObservers();
    }
}