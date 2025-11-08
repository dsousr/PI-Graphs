import City from "./models/City";
import EpidemicNetworkSystem from "./models/EpidemicNetworkSystem";
import SIRSModel from "./models/SIRSModel";
import SimulationEngine from "./simulation/SimulationEngine";
import { startGraph } from "./visualization/Renderer";

//startGraph();

const sirsModel = new SIRSModel({
    infectionRate: 3,
    immunityLossRate: 1/2,
    mortalityRate: 1,
    natalityRate: 2,
    recoveringRate: 1
});
const system = new EpidemicNetworkSystem(sirsModel);
system.addCity(new City("A", { susceptible: 900, infected: 100, recovered: 0 }));
system.addCity(new City("B", { susceptible: 500, infected: 500, recovered: 0 }));
system.addCity(new City("C", { susceptible: 800, infected: 200, recovered: 0 }));
system.addCity(new City("D", { susceptible: 1000, infected: 0, recovered: 0 }));
system.addEdge("A", "B", 40);
system.addEdge("A", "C", 20);
system.addEdge("B", "D", 50);

const engine = new SimulationEngine(system);
system.print();