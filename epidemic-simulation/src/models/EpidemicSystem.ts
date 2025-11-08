import City from "./City";
import Graph from "./Graph";
import type { Vertex } from "./Graph";
import type { SIRSGroups } from "./SIRSModel";
import type SIRSModel from "./SIRSModel";

export default class EpidemicSystem {
    public readonly model: SIRSModel;
    public readonly graph: Graph;
    private cities = new Map<Vertex, City>();
    private readonly travelFraction: number; // #todo: update, decide how to implement travel logic

    constructor(model: SIRSModel, graph?: Graph, travelFraction: number = 0.01) {
        this.model = model;
        this.graph = graph ?? new Graph();
        this.travelFraction = travelFraction;
    }

    addCity(city: City): void {
        this.cities.set(city.id, city);
        this.graph.addVertex(city.id);
    }

    addEdge(a: Vertex, b: Vertex, weight = 1): void {
        this.graph.addEdge(a, b, weight);
    }

    getCities(): City[] {
        return Array.from(this.cities.values());
    }

    getCity(id: Vertex): City | undefined {
        return this.cities.get(id);
    }

    step(deltaT: number): void {
        this.movePopulation();
        this.updateInfections(deltaT);
    }

    private movePopulation(): void {
        // TODO: implementing ... //
    }

    private updateInfections(deltaT: number): void {
        for (const city of this.cities.values()) {
            city.groups = this.model.updateState(city.groups, deltaT);
        }
    }
}