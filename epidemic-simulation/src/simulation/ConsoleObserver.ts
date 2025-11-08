import type { SimulationObserver, SimulationSnapshot } from "./SimulationEngine";

export default class ConsoleObserver implements SimulationObserver {
    update(snapshot: SimulationSnapshot): void {
        console.log(`\n====== Day ${snapshot.elapsedTime.toFixed(2)} ======`);

        for (const city of snapshot.cities) {
            const { susceptible, infected, recovered } = city.groups;
            console.log(
                `City ${city.id}: S=${susceptible.toFixed(2)}, I=${infected.toFixed(2)}, R=${recovered.toFixed(2)}`
            );
        }

        console.log("\nConnections:");
        for (const [id, neighbors] of snapshot.edges.entries()) {
            const connections = neighbors.map(e => `${e.neighbor}(${e.weight})`).join(", ") || "none";
            console.log(`  ${id} -> ${connections}`);
        }
        console.log("=====================\n\n");
    }
}
