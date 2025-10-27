import { Graph } from "./Graph";

const g = new Graph();

g.addArest("A", "B");
g.addArest("A", "C");
g.addArest("B", "D");
g.addArest("C", "D");

console.log("Graph:");
g.exibir();

console.log("\nDFS in A:");
g.dfs("A");