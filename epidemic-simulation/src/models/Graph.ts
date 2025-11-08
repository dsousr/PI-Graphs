export type Vertex = string | number;

export type Edge = { neighbor: Vertex; weight: number };

export default class Graph {
  private adjacency: Map<Vertex, Edge[]>;

  constructor() {
    this.adjacency = new Map();
  }

  addVertex(vertex: Vertex): void {
    if (!this.adjacency.has(vertex)) {
      this.adjacency.set(vertex, []);
    }
  }

  addEdge(v1: Vertex, v2: Vertex, weight: number = 1): void {
    this.addVertex(v1);
    this.addVertex(v2);

    this.adjacency.get(v1)!.push({ neighbor: v2, weight });
    this.adjacency.get(v2)!.push({ neighbor: v1, weight });
  }

  addDirectedEdge(origin: Vertex, destination: Vertex, weight: number = 1): void {
    this.addVertex(origin);
    this.addVertex(destination);

    this.adjacency.get(origin)!.push({ neighbor: destination, weight });
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