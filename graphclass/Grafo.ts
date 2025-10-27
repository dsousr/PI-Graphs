export class Grafo {
  private vertices: string[] = [];
  private matriz: number[][] = [];

  adicionarVertice(nome: string): void {
    if (this.vertices.includes(nome)) return;

    this.vertices.push(nome);
    this.matriz.forEach(linha => linha.push(0));
    this.matriz.push(new Array(this.vertices.length).fill(0));
  }

  adicionarAresta(v1: string, v2: string): void {
    this.adicionarVertice(v1);
    this.adicionarVertice(v2);

    const i = this.vertices.indexOf(v1);
    const j = this.vertices.indexOf(v2);

    this.matriz[i]![j] = 1;
    this.matriz[j]![i] = 1;
  }

  exibir(): void {
    console.log("  " + this.vertices.join(" "));
    this.matriz.forEach((linha, i) => {
      console.log(this.vertices[i] + " " + linha.join(" "));
    });
  }
}
