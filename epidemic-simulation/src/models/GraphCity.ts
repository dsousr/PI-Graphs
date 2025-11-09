import type { SIRSGroups } from "./SIRSModel";

export type Vertex = string | number;

export interface TransitFlow {
    id: string; // unique identifier for this batch
    from: Vertex; // origin city
    to: Vertex; // destination city  
    groups: SIRSGroups; // people in transit (always integers)
    travelTime: number; // total time needed
    elapsedTime: number; // time already spent
    departureTime: number; // when this batch started traveling
}

export type Edge = { 
  neighbor: Vertex; 
  weight: number;
  movementFraction?: number; // fraction of origin's population that moves along this directed edge (per time unit)
  flows?: TransitFlow[]; // people currently in transit along this edge
};

export default class GraphCity {
  private adjacency: Map<Vertex, Edge[]>;

  constructor() {
    this.adjacency = new Map();
  }

  addVertex(vertex: Vertex): void {
    if (!this.adjacency.has(vertex)) {
      this.adjacency.set(vertex, []);
    }
  }

  addEdge(
    v1: Vertex,
    v2: Vertex,
    weight: number = 1,
    fractionV1toV2: number = 0,
    fractionV2toV1: number = 0
  ): void {
    this.addVertex(v1);
    this.addVertex(v2);

    this.adjacency.get(v1)!.push({ neighbor: v2, weight, movementFraction: fractionV1toV2 });
    this.adjacency.get(v2)!.push({ neighbor: v1, weight, movementFraction: fractionV2toV1 });
  }

  addDirectedEdge(origin: Vertex, destination: Vertex, weight: number = 1, movementFraction: number = 0): void {
    this.addVertex(origin);
    this.addVertex(destination);

    this.adjacency.get(origin)!.push({ neighbor: destination, weight, movementFraction });
  }

  updateEdgeMovementFraction(origin: Vertex, destination: Vertex, fraction: number): void {
    const edges = this.adjacency.get(origin);
    if (!edges) return;
    const edgeToUpdate = edges.find(x => x.neighbor === destination);
    if (edgeToUpdate) edgeToUpdate.movementFraction = fraction;
  }

  print(): void {
    for (const [vert, edges] of this.adjacency.entries()) {
      const text = edges.map(e => `${e.neighbor}(${e.weight})`).join(", ");
      console.log(`${vert} -> ${text}`);
    }
  }

  getVertices(): Vertex[] {
    return Array.from(this.adjacency.keys());
  }

  getNeighbors(vert: Vertex): Edge[] {
    return this.adjacency.get(vert) ?? [];
  }

  // This will avoid graph being mutated from outside
  getAdjacencyView(): ReadonlyMap<Vertex, ReadonlyArray<Edge>> {
    return this.adjacency;
  }
 
  dfs(init: Vertex, found: Set<Vertex> = new Set()): void {
    if (found.has(init)) return;
    console.log(init);
    found.add(init);

    for (const { neighbor } of this.getNeighbors(init)) {
      this.dfs(neighbor, found);
    }
  }

  bfs(init: Vertex): void {
    const visited = new Set<Vertex>();
    const queue: Vertex[] = [init];

    visited.add(init);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      console.log(vertex);

      for (const { neighbor } of this.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
}