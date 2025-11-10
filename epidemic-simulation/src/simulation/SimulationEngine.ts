import EpidemicNetworkSystem from "../models/EpidemicNetworkSystem";
import City from "../models/City";
import type { Edge, Vertex, TransitFlow } from "../models/GraphCity";
import type SIRSModel from "../models/SIRSModel";

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

        // build visualizable batches
        const transitBatches: TransitBatchSnapshot[] = [];
        for (const flow of this.system.getAllTransitBatches()) {
            const { susceptible, infected, recovered } = flow.groups;
            const count = susceptible + infected + recovered;
            if (count === 0) continue;

            let color = "gray";

            const max = Math.max(susceptible, infected, recovered);

            // if total population is zero or all values are invalid
            if (max <= 0) {
                color = "gray";
            } else if (infected === max && infected > 0) {
                color = "red";
            } else if (susceptible === max && susceptible > 0) {
                color = "blue";
            } else if (recovered === max && recovered > 0) {
                color = "green";
            }

            transitBatches.push({
                id: flow.id,
                edgeId: `${flow.from}${flow.to}`,
                source: flow.from.toString(),
                target: flow.to.toString(),
                elapsedTime: flow.elapsedTime,
                travelTime: flow.travelTime,
                count,
                color,
            });
        }

        const snapshot: SimulationSnapshot = {
            cities: citiesSnapshot,
            edges,
            elapsedTime: this.elapsedTime,
            model: this.system.model,
            transitBatches,
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
    elapsedTime: number;
    model: SIRSModel;
    transitBatches: TransitBatchSnapshot[];
}

export interface TransitBatchSnapshot {
    id: string;
    edgeId: string;
    source: string | number;
    target: string | number;
    elapsedTime: number;
    travelTime: number;
    count: number;
    color: string;
}

export interface SimulationObserver {
    update(snapshot: SimulationSnapshot): void;
}
