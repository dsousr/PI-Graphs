
type Vert = string | number;

export class Graph {
  private adjacenc: Map<Vert, Vert[]>;

  constructor() {
    this.adjacenc = new Map();
  }

  addVert(vert: Vert): void {
    if (!this.adjacenc.has(vert)) {
      this.adjacenc.set(vert, []);
    }
  }

  addArest(v1: Vert, v2: Vert): void {
    this.addVert(v1);
    this.addVert(v2);
    this.adjacenc.get(v1)!.push(v2);
    this.adjacenc.get(v2)!.push(v1);
  }


  addArestDirect(origin: Vert, destin: Vert): void {
    this.addVert(origin);
    this.addVert(destin);
    this.adjacenc.get(origin)!.push(destin);
  }

  exibir(): void {
    for (const [vert, neighbor] of this.adjacenc.entries()) {
      console.log(`${vert} -> ${neighbor.join(", ")}`);
    }
  }

 
  getVertices(): Vert[] {
    return Array.from(this.adjacenc.keys());
  }

 
  getNeighbor(vert: Vert): Vert[] {
    return this.adjacenc.get(vert) || [];
  }

  //DFS
  dfs(init: Vert, found: Set<Vert> = new Set()): void {
    if (found.has(init)) return;
    console.log(init);
    found.add(init);
    for (const neighbor of this.getNeighbor(init)) {
      this.dfs(neighbor, found);
    }
  }
}
