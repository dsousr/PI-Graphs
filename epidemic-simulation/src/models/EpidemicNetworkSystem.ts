import City from "./City";
import GraphCity from "./GraphCity";
import type { Edge, TransitFlow, Vertex } from "./GraphCity";
import type { SIRSGroups } from "./SIRSModel";
import type SIRSModel from "./SIRSModel";

export default class EpidemicNetworkSystem {
    public readonly model: SIRSModel;
    private readonly graph: GraphCity;
    private cities = new Map<Vertex, City>();

    travelSpeed = 1; // default: 1 distance unit / time unit

    constructor(model: SIRSModel, travelSpeed = 1) {
        this.model = model;
        this.graph = new GraphCity();
        this.travelSpeed = travelSpeed;
    }

    addCity(city: City): void {
        if (this.cities.has(city.id)) throw new Error(`City with ID '${city.id}' already exists.`);
        this.cities.set(city.id, city);
        this.graph.addVertex(city.id);
    }

    hasCity(id: Vertex): boolean {
        return this.cities.has(id);
    }

    getCities(): City[] {
        return Array.from(this.cities.values());
    }

    getCitiesIds(): Vertex[] {
        return Array.from(this.cities.keys());
    }

    getCity(id: Vertex): City | undefined {
        return this.cities.get(id);
    }

    addEdge(
        v1: Vertex,
        v2: Vertex,
        distance: number = 1,
        fractionV1toV2: number = 0,
        fractionV2toV1: number = 0
    ): void {
        if (!this.hasCity(v1) || !this.hasCity(v2)) {
            throw new Error(`Cannot connect '${v1}' and '${v2}': one or both cities not found.`);
        }
        this.graph.addEdge(v1, v2, distance, fractionV1toV2, fractionV2toV1);
    }

    getNeighbors(id: Vertex): Edge[] {
        if (!this.hasCity(id)) {
            throw new Error(`City '${id}' not found.`);
        }
        return this.graph.getNeighbors(id);
    }    

    step(deltaT: number): void {
        this.movePopulation(deltaT);
        this.updateInfections(deltaT);
    }

    private movePopulation(deltaT: number): void {
    }

    private updateInfections(deltaT: number): void {
        for (const city of this.cities.values()) {
            city.groups = this.model.updateState(city.groups, deltaT);
        }
    }

    getGraphSnapshot(): ReadonlyMap<Vertex, ReadonlyArray<Edge>> {
        return this.graph.getAdjacencyView();
    }

    print(): void {
        console.log("=== Epidemic System State ===");

        for (const [id, city] of this.cities.entries()) {
            const { susceptible, infected, recovered } = city.groups;
            const edges = this.graph.getNeighbors(id);
            const connections = edges.map(e => `${e.neighbor}(${e.weight})`).join(", ") || "none";

            console.log(
                `City ${id}: S=${susceptible.toFixed(2)}, I=${infected.toFixed(2)}, R=${recovered.toFixed(2)}`
            );
            console.log(`  Connections -> ${connections}`);
        }

        console.log("=============================");
    }    
}