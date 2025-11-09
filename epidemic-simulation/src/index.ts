import City from "./models/City";
import EpidemicNetworkSystem from "./models/EpidemicNetworkSystem";
import SIRSModel from "./models/SIRSModel";
import ConsoleObserver from "./simulation/ConsoleObserver";
import SimulationEngine, { type SimulationSnapshot } from "./simulation/SimulationEngine";
import Renderer from "./visualization/Renderer";

//startGraph();

// Epidemic growth (R0 > 1) // 3.33
const epidemicModel = new SIRSModel({
    infectionRate: 10,
    recoveringRate: 1,
    immunityLossRate: 0.5,
    mortalityRate: 2,
    natalityRate: 2
});

// Stable equilibrium (R0 = 1) // 1.0
const stableModel = new SIRSModel({
    infectionRate: 3,
    recoveringRate: 1,
    immunityLossRate: 0.5,
    mortalityRate: 2,
    natalityRate: 2
});

// Disease dies out (R0 < 1) // 0.67
const extinctionModel = new SIRSModel({
    infectionRate: 2,
    recoveringRate: 1,
    immunityLossRate: 0.5,
    mortalityRate: 2,
    natalityRate: 2
});


const system = new EpidemicNetworkSystem(epidemicModel);
system.addCity(new City("A", 0.01, { susceptible: 900, infected: 10, recovered: 0 }));
system.addCity(new City("B", 0.05, { susceptible: 500, infected: 15, recovered: 0 }));
system.addCity(new City("C", 0.10, { susceptible: 800, infected: 0, recovered: 0 }));
//system.addCity(new City("D", 0.05, { susceptible: 1000, infected: 0, recovered: 0 }));
system.addEdge("A", "B", 40);
system.addEdge("B", "C", 20);
system.addEdge("A", "C", 20);
//system.addEdge("B", "D", 50);

const engine = new SimulationEngine(system);
//engine.addObserver(new ConsoleObserver());

engine.addObserver(new Renderer());
engine.step(1)
/*
for (let i = 0; i < 3000; i += 1) {
    engine.step(0.01);
}*/