import type { SimulationObserver, SimulationSnapshot } from "../simulation/SimulationEngine";
import type { TransitFlow, Edge, Vertex } from "../models/GraphCity";

export type PrintMode = "daily" | "active" | "total";

export default class ConsoleObserver implements SimulationObserver {
    private readonly mode: PrintMode;

    constructor(mode: PrintMode = "daily") {
        this.mode = mode;
    }

    update(snapshot: SimulationSnapshot): void {
        const activeFlows = this.collectTransitFlows(snapshot.edges);

        const shouldPrint =
            this.mode === "daily" ||
            (this.mode === "active" && activeFlows.length > 0) ||
            this.mode === "total";

        if (!shouldPrint) return;

        if (this.mode === "total") {
            this.printTotals(snapshot.cities, activeFlows);
        } else {
            this.printHeader(snapshot.elapsedTime, snapshot.model.getBasicReproductionNumber());
            this.printCityStates(snapshot.cities);
            this.printConnections(snapshot.edges);
            this.printTransitFlows(activeFlows);
            this.printFooter();
        }
    }

    private printTotals(cities: SimulationSnapshot["cities"], flows: TransitFlow[]): void {
        let totalS = 0, totalI = 0, totalR = 0;

        // Sum city populations
        for (const city of cities) {
            totalS += city.groups.susceptible;
            totalI += city.groups.infected;
            totalR += city.groups.recovered;
        }

        // Sum people currently in transit
        for (const flow of flows) {
            totalS += flow.groups.susceptible;
            totalI += flow.groups.infected;
            totalR += flow.groups.recovered;
        }

        console.log(`\n====== Total Epidemic Status ======`);
        console.log(`S=${totalS.toFixed(0)}, I=${totalI.toFixed(0)}, R=${totalR.toFixed(0)}`);
        console.log("=====================\n");
    }

    private printHeader(elapsedTime: number, R0: number): void {
        console.log(`\n====== Day ${elapsedTime.toFixed(2)} ======`);
        console.log(`Basic Reproduction Number (R0): ${R0.toFixed(2)}\n`);
    }

    private printCityStates(cities: SimulationSnapshot["cities"]): void {
        for (const city of cities) {
            const { susceptible, infected, recovered } = city.groups;
            const total = susceptible + infected + recovered;
            console.log(
                `City ${city.id}: S=${susceptible.toFixed(0)}, I=${infected.toFixed(
                    0
                )}, R=${recovered.toFixed(0)}, Total=${total.toFixed(0)}`
            );
        }
    }

    private printConnections(edges: ReadonlyMap<Vertex, readonly Edge[]>): void {
        console.log("\nConnections:");
        for (const [id, neighbors] of edges.entries()) {
            const connections =
                neighbors
                    .map(
                        e =>
                            `${e.neighbor} (dist=${e.weight.toFixed(0)}, movement=${(
                                (e.movementFraction ?? 0) * 100
                            ).toFixed(1)}%)`
                    )
                    .join(", ") || "none";
            console.log(`  ${id} -> ${connections}`);
        }
    }

    private collectTransitFlows(edges: ReadonlyMap<Vertex, readonly Edge[]>): TransitFlow[] {
        const flows: TransitFlow[] = [];
        for (const [, neighborEdges] of edges.entries()) {
            for (const edge of neighborEdges) {
                if (edge.flows?.length) flows.push(...edge.flows);
            }
        }
        return flows;
    }

    private printTransitFlows(allFlows: TransitFlow[]): void {
        if (allFlows.length === 0) {
            console.log("\nTransit Flows:\n  None currently active.");
            return;
        }

        console.log("\nTransit Flows:");
        const grouped = new Map<string, TransitFlow[]>();
        for (const f of allFlows) {
            const key = `${f.from}->${f.to}`;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(f);
        }

        let totalInTransit = 0;
        let batchCount = 0;

        for (const [route, flows] of grouped) {
            console.log(`  ${route}:`);
            for (const flow of flows) {
                const { susceptible, infected, recovered } = flow.groups;
                const total = susceptible + infected + recovered;
                const progress = (flow.elapsedTime / flow.travelTime) * 100;
                totalInTransit += total;
                batchCount++;

                console.log(
                    `    Batch: ${total.toFixed(0)} people (S=${susceptible.toFixed(
                        0
                    )}, I=${infected.toFixed(0)}, R=${recovered.toFixed(0)})`
                );
                console.log(
                    `    Progress: ${flow.elapsedTime.toFixed(2)}/${flow.travelTime.toFixed(
                        2
                    )} days (${progress.toFixed(1)}%)`
                );
                console.log(`    Departure: day ${flow.departureTime.toFixed(2)}`);
            }
        }

        console.log(`\nSummary:\n  Total people in transit: ${totalInTransit}`);
        console.log(`  Active transit batches: ${batchCount}`);
    }

    private printFooter(): void {
        console.log("=====================\n");
    }
}
