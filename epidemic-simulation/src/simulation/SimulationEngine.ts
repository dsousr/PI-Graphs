import EpidemicNetworkSystem from "../models/EpidemicNetworkSystem";
import City from "../models/City";
import type { Edge, Vertex } from "../models/Graph";

export default class SimulationEngine {
    private readonly system: EpidemicNetworkSystem;
    private readonly observers = new Set<SimulationObserver>();
    private elapsedTime = 0; // total simulation time ("days")

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

        const edges = this.system.getGraphSnapshot();

        const snapshot: SimulationSnapshot = {
            cities: citiesSnapshot,
            edges,
            elapsedTime: this.elapsedTime
        };

        for (const observer of this.observers) {
            observer.update(snapshot);
        }
    }

    step(deltaT: number): void {
        this.system.step(deltaT);
        this.elapsedTime += deltaT;
        this.notifyObservers();
    }
}

export interface SimulationSnapshot {
    cities: City[];
    edges: ReadonlyMap<Vertex, ReadonlyArray<Edge>>;
    elapsedTime: number; // total "days" elapsed (or any other time unit used)
}

export interface SimulationObserver {
    update(snapshot: SimulationSnapshot): void;
}