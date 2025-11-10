import City from "./City";
import GraphCity from "./GraphCity";
import type { Edge, TransitFlow, Vertex } from "./GraphCity";
import type { SIRSGroups } from "./SIRSModel";
import type SIRSModel from "./SIRSModel";

export default class EpidemicNetworkSystem {
    public readonly model: SIRSModel;
    private readonly graph: GraphCity;
    private cities = new Map<Vertex, City>();

    travelSpeed = 1; // units per time unit
    private movementInterval: number = 1; // move every 1 time unit
    private timeSinceLastMovement: number = 0;
    private elapsedTime: number = 0; // Track total time for transit batches

    constructor(model: SIRSModel, travelSpeed = 1, movementInterval = 1) {
        this.model = model;
        this.graph = new GraphCity();
        this.travelSpeed = travelSpeed;
        this.movementInterval = movementInterval;
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
        this.elapsedTime += deltaT;
        this.timeSinceLastMovement += deltaT;
        
        // update transit batches first (they might complete during this time)
        this.updateTransitBatches(deltaT);
        this.deliverTransitBatches();
        
        // only create new batches when movement interval is reached
        if (this.timeSinceLastMovement >= this.movementInterval) {
            this.createTransitBatches();
            this.timeSinceLastMovement = 0;
        }
        
        this.updateInfections(deltaT);
    }

    private createTransitBatches(): void {
        for (const [originId, originCity] of this.cities.entries()) {
            const edges = this.graph.getNeighbors(originId);
            
            for (const edge of edges) {
                if (!edge.movementFraction || edge.movementFraction === 0) continue;
                
                const totalMovingPeople = Math.floor(originCity.population * edge.movementFraction);
                
                if (totalMovingPeople > 0) {
                    const movingGroups = this.calculateMovingGroups(originCity, totalMovingPeople);
                    
                    // only create batch if we have at least 1 person moving
                    if (this.hasPeople(movingGroups)) {
                        this.createTransitBatch(
                            originId,
                            edge.neighbor,
                            movingGroups,
                            edge.weight / this.travelSpeed
                        );
                        
                        // remove moving people from origin city
                        this.removeFromCity(originCity, movingGroups);
                    }
                }
            }
        }
    }

    private removeFromCity(city: City, groups: SIRSGroups): void {
        city.groups.susceptible -= groups.susceptible;
        city.groups.infected -= groups.infected;
        city.groups.recovered -= groups.recovered;
        
        // ensure no negative values, due to floor operations
        city.groups.susceptible = Math.max(0, city.groups.susceptible);
        city.groups.infected = Math.max(0, city.groups.infected);
        city.groups.recovered = Math.max(0, city.groups.recovered);
    }

    private addToCity(city: City, groups: SIRSGroups): void {
        city.groups.susceptible += groups.susceptible;
        city.groups.infected += groups.infected;
        city.groups.recovered += groups.recovered;
    }

    private hasPeople(groups: SIRSGroups): boolean {
        return groups.susceptible > 0 || groups.infected > 0 || groups.recovered > 0;
    }

    private calculateMovingGroups(city: City, totalMoving: number): SIRSGroups {
        // #TODO: improve distribution logic to avoid rounding issues, maybe using a random approach

        const totalPopulation = city.population;
        if (totalPopulation === 0) return { susceptible: 0, infected: 0, recovered: 0 };
        
        // distribute moving people proportionally to current city composition
        const ratio = totalMoving / totalPopulation; // fraction of each group to move
        
        return {
            susceptible: Math.floor(city.groups.susceptible * ratio),
            infected: Math.floor(city.groups.infected * ratio),
            recovered: Math.floor(city.groups.recovered * ratio)
        };
    }

    private createTransitBatch(from: Vertex, to: Vertex, groups: SIRSGroups, travelTime: number): void {
        const edges = this.graph.getNeighbors(from);
        const edge = edges.find(e => e.neighbor === to);
        if (!edge) return;
        
        if (!edge.flows) {
            edge.flows = [];
        }
        
        const batch: TransitFlow = {
            id: `${from}-${to}-${Date.now()}-${Math.random()}`,
            from,
            to,
            groups,
            travelTime,
            elapsedTime: 0,
            departureTime: this.elapsedTime
        };
        
        edge.flows.push(batch);
    }
    
    private updateTransitBatches(deltaT: number): void {
        for (const edges of this.graph.getAdjacencyView().values()) {
            for (const edge of edges) {
                if (!edge.flows) continue;
                
                for (const flow of edge.flows) {
                    flow.elapsedTime += deltaT;
                }
            }
        }
    }    

    private deliverTransitBatches(): void {
        for (const edges of this.graph.getAdjacencyView().values()) {
            for (const edge of edges) {
                if (!edge.flows) continue;
                
                // find completed batches
                const completedBatches = edge.flows.filter(flow => 
                    flow.elapsedTime >= flow.travelTime
                );
                
                // remove completed batches from transit and deliver to destination
                edge.flows = edge.flows.filter(flow => 
                    flow.elapsedTime < flow.travelTime
                );
                
                for (const batch of completedBatches) {
                    const destinationCity = this.cities.get(batch.to);
                    if (destinationCity) {
                        this.addToCity(destinationCity, batch.groups);
                    }
                }
            }
        }
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