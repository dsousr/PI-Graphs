import { Graph } from "./Graph";

const g = new Graph();

g.addArest("A", "B", 4);
g.addArest("A", "C", 2);
g.addArest("B", "D", 5);
g.addArest("C", "E", 3);
g.addArest("D", "E", 1);

console.log("ponderado:");
g.exibir();

console.log("\nDFS:");
g.dfs("A");

console.log("\nBFS:");
g.bfs("B");