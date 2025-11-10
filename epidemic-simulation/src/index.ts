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
    recoveringRate: 0.1,
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


const initializeBigNetwork = (
    sirsModel: SIRSModel, 
    travelSpeed: number, 
    movimentInterval: number
): EpidemicNetworkSystem => {
    // added travelSpeed (50 units/day) and movementInterval (1 day/unit, for example)
    const networkSystem = new EpidemicNetworkSystem(sirsModel, travelSpeed, movimentInterval);
    networkSystem.addCity(new City("A", { susceptible: 1800, infected: 150, recovered: 50 }));
    networkSystem.addCity(new City("B", { susceptible: 1200, infected: 600, recovered: 200 }));
    networkSystem.addCity(new City("C", { susceptible: 900, infected: 100, recovered: 0 }));
    networkSystem.addCity(new City("D", { susceptible: 50, infected: 10, recovered: 5 }));
    networkSystem.addCity(new City("E", { susceptible: 400, infected: 300, recovered: 100 }));
    networkSystem.addCity(new City("F", { susceptible: 1300, infected: 400, recovered: 100 }));
    networkSystem.addCity(new City("G", { susceptible: 500, infected: 250, recovered: 125 }));
    networkSystem.addCity(new City("H", { susceptible: 1600, infected: 200, recovered: 100 }));

    // distances with travelSpeed=50
    // A->B: 40/50 = 0.8 days travel time
    // B->C: 30/50 = 0.6 days travel time  
    // A->C: 20/50 = 0.4 days travel time
    networkSystem.addEdge("A", "B", 400, 0.02, 0);
    networkSystem.addEdge("B", "C", 30, 0.03, 0);
    networkSystem.addEdge("A", "C", 20, 0.01, 0.02);
    networkSystem.addEdge("C", "D", 50, 0.02, 0.01);
    networkSystem.addEdge("C", "E", 70, 0.01, 0.03);
    networkSystem.addEdge("B", "F", 80, 0.03, 0.01);
    networkSystem.addEdge("A", "G", 90, 0.02, 0.02);
    networkSystem.addEdge("D", "H", 60, 0.01, 0.01);

    return networkSystem;
}

const initializeTinyNetwork = (
    sirsModel: SIRSModel, 
    travelSpeed: number, 
    movimentInterval: number
): EpidemicNetworkSystem => {
    // added travelSpeed (50 units/day) and movementInterval (ex: 1 day)
    const networkSystem = new EpidemicNetworkSystem(sirsModel, travelSpeed, movimentInterval);
    networkSystem.addCity(new City("A", { susceptible: 500, infected: 200, recovered: 0 }));
    networkSystem.addCity(new City("B", { susceptible: 400, infected: 150, recovered: 0 }));
    networkSystem.addCity(new City("C", { susceptible: 200, infected: 0, recovered: 50 }));

    networkSystem.addEdge("A", "B", 100, 0.02, 0);
    networkSystem.addEdge("B", "C", 50, 0.03, 0);
    networkSystem.addEdge("A", "C", 30, 0.01, 0.02);
    return networkSystem;
}

const travelSpeed = 200; // units per delta
const movementInterval = 0.08; // interval in which people go out to travel
const networkSystem = initializeTinyNetwork(epidemicModel, travelSpeed, movementInterval);
const engine = new SimulationEngine(networkSystem);
engine.addObserver(new Renderer());
engine.addObserver(new ConsoleObserver("total"));

// controle do botão
const toggleBtn = document.querySelector(".min-screen") as HTMLElement;
const graphContainer = document.querySelector(".container-graph") as HTMLElement;

toggleBtn?.addEventListener("click", () => {
    graphContainer.classList.toggle("minimized");
});

// Movement happens every 1.0 time units, disease updates every 0.01
// People will travel in batches every day while disease spreads continuously
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
for (let i = 0; i < 10000; i += 1) {
    engine.step(0.0001);
    await sleep(0.001);
}