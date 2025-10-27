import { Grafo } from "./Grafo";

const g = new Grafo();

g.adicionarAresta("A", "B");
g.adicionarAresta("A", "C");
g.adicionarAresta("B", "D");

g.exibir();
