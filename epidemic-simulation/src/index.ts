import City from "./models/City";
import EpidemicNetworkSystem from "./models/EpidemicNetworkSystem";
import SIRSModel from "./models/SIRSModel";
import SimulationEngine from "./simulation/SimulationEngine";
import ConsoleObserver from "./visualization/ConsoleObserver";
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

//
const nonChagingModel = new SIRSModel({
    infectionRate: 0,
    recoveringRate: 0,
    immunityLossRate: 0,
    mortalityRate: 0,
    natalityRate: 0
});


// Added travelSpeed (50 units/day) and movementInterval (1 day)
const system = new EpidemicNetworkSystem(epidemicModel, 50, 1.0);
system.addCity(new City("A", { susceptible: 5, infected: 500, recovered: 0 }));
system.addCity(new City("B", { susceptible: 500, infected: 150, recovered: 0 }));
system.addCity(new City("C", { susceptible: 800, infected: 0, recovered: 0 }));
//system.addCity(new City("D", 0.05, { susceptible: 1000, infected: 0, recovered: 0 }));

// Distances with travelSpeed=50:
// A->B: 40/50 = 0.8 days travel time
// B->C: 30/50 = 0.6 days travel time  
// A->C: 20/50 = 0.4 days travel time
system.addEdge("A", "B", 40, 0.02, 0.01);
system.addEdge("B", "C", 30, 0.03, 0);
system.addEdge("A", "C", 20, 0.01, 0.02);

const engine = new SimulationEngine(system);
engine.addObserver(new Renderer());
engine.addObserver(new ConsoleObserver("active"));

//engine.addObserver(new Renderer());
//engine.step(1)

// controle do botão
const toggleBtn = document.querySelector(".min-screen") as HTMLElement;
const graphContainer = document.querySelector(".container-graph") as HTMLElement;

toggleBtn?.addEventListener("click", () => {
    graphContainer.classList.toggle("minimized");
});

// Movement happens every 1.0 time units, disease updates every 0.01
// People will travel in batches every day while disease spreads continuously
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
for (let i = 0; i < 1000; i += 1) {
    engine.step(0.05);
    await sleep(500);

}