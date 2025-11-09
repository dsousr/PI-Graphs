import City from "./City";
import GraphCity from "./GraphCity";
import type { Edge, Vertex } from "./GraphCity";
import type { SIRSGroups } from "./SIRSModel";
import type SIRSModel from "./SIRSModel";

export interface OutgoingFlow {
    to: Vertex;
    groups: SIRSGroups; // people moving along this edge
}

export default class EpidemicNetworkSystem {
    public readonly model: SIRSModel;
    private readonly graph: GraphCity;
    private cities = new Map<Vertex, City>();
    private outgoingFlows = new Map<Vertex, OutgoingFlow[]>(); // { fromCity: { toCity: SIRSGroups } }

    constructor(model: SIRSModel) {
        this.model = model;
        this.graph = new GraphCity();
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

    addEdge(a: Vertex, b: Vertex, distance = 1): void {
        if (!this.hasCity(a) || !this.hasCity(b)) {
            throw new Error(`Cannot connect '${a}' and '${b}': one or both cities not found.`);
        }
        this.graph.addEdge(a, b, distance);
    }

    getNeighbors(id: Vertex): Edge[] {
        if (!this.hasCity(id)) {
            throw new Error(`City '${id}' not found.`);
        }
        return this.graph.getNeighbors(id);
    }    

    step(deltaT: number): void {
        this.movePopulation();
        this.updateInfections(deltaT);
    }

   private movePopulation(): void {
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