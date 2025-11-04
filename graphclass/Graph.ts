type Vert = string | number;

type Edge = { neighbor: Vert; weight: number };

export class Graph {
  private adjacenc: Map<Vert, Edge[]>;

  constructor() {
    this.adjacenc = new Map();
  }

  addVert(vert: Vert): void {
    if (!this.adjacenc.has(vert)) {
      this.adjacenc.set(vert, []);
    }
  }

  addArest(v1: Vert, v2: Vert, weight: number = 1): void {
    this.addVert(v1);
    this.addVert(v2);

    const neighbors1 = this.adjacenc.get(v1)!;
    const neighbors2 = this.adjacenc.get(v2)!;

    neighbors1.push({ neighbor: v2, weight });
    neighbors2.push({ neighbor: v1, weight });
  }

  addArestDirect(origin: Vert, destin: Vert, weight: number = 1): void {
    this.addVert(origin);
    this.addVert(destin);

    const neighbors = this.adjacenc.get(origin)!;
    neighbors.push({ neighbor: destin, weight });
  }

  exibir(): void {
    for (const [vert, edges] of this.adjacenc.entries()) {
      const text = edges.map(e => `${e.neighbor}(${e.weight})`).join(", ");
      console.log(`${vert} -> ${text}`);
    }
  }

  getVertices(): Vert[] {
    return Array.from(this.adjacenc.keys());
  }

 
  getNeighbor(vert: Vert): Edge[] {
    return this.adjacenc.get(vert) ?? [];
  }

 
  dfs(init: Vert, found: Set<Vert> = new Set()): void {
    if (found.has(init)) return;
    console.log(init);
    found.add(init);

    for (const { neighbor } of this.getNeighbor(init)) {
      this.dfs(neighbor, found);
    }
  }

  bfs(init: Vert): void {
    const visited = new Set<Vert>();
    const queue: Vert[] = [init];

    visited.add(init);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      console.log(vertex);

      for (const { neighbor } of this.getNeighbor(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
}