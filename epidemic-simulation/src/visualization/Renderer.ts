import cytoscape, { type ElementDefinition } from "cytoscape";
import { Chart } from "chart.js/auto";

import "./style.css";
import type { SimulationObserver, SimulationSnapshot } from "../simulation/SimulationEngine";

export default class Renderer implements SimulationObserver {

    private chart!: Chart;
    private dataHistory = {
        labels: [] as string[],
        susceptible: [] as number[],
        infected: [] as number[],
        recovered: [] as number[],
    };

    private started = false;
    private paused = false;
    private cy!: cytoscape.Core;
    private container!: HTMLElement;
    private particleMap = new Map<string, HTMLElement>();

    private x = 40;
    private y = 20;

    constructor() { }

    private ensureParticle(batchId: string, color: string, count: number): HTMLElement {
        let particle = this.particleMap.get(batchId);
        if (!particle) {
            particle = document.createElement("div");
            particle.className = "particle";
            particle.style.position = "absolute";
            particle.style.width = "30px";
            particle.style.height = "30px";
            particle.style.borderRadius = "50%";
            particle.style.display = "flex";
            particle.style.alignItems = "center";
            particle.style.justifyContent = "center";
            particle.style.fontSize = "10px";
            particle.style.color = "white";
            particle.style.fontWeight = "bold";
            particle.style.backgroundColor = color;
            this.container.appendChild(particle);
            this.particleMap.set(batchId, particle);
        }
        particle.textContent = count.toString();
        return particle;
    }

    private updateParticlePosition(batch: any) {
        const edge = this.cy.getElementById(batch.edgeId);
        const srcPos = this.cy.getElementById(batch.source).renderedPosition();
        const dstPos = this.cy.getElementById(batch.target).renderedPosition();

        const progress = Math.min(1, Math.max(0, batch.elapsedTime / batch.travelTime));
        const x = srcPos.x + (dstPos.x - srcPos.x) * progress;
        const y = srcPos.y + (dstPos.y - srcPos.y) * progress;

        const particle = this.particleMap.get(batch.id);
        if (particle) {
            particle.style.left = `${x - 12}px`;
            particle.style.top = `${y - 12}px`;
        }
    }

    private removeInactiveBatches(activeBatchIds: Set<string>) {
        for (const [id, particle] of this.particleMap.entries()) {
            if (!activeBatchIds.has(id)) {
                particle.remove();
                this.particleMap.delete(id);
            }
        }
    }

    update(snapshot: SimulationSnapshot) {
        if (!this.started) {
            this.container = document.getElementById("container")!;
            const elements: ElementDefinition[] = [];

            snapshot.cities.forEach((city, index) => {
                const xOffset = index * 200;
                const yOffset = (index % 2) * 200;
                elements.push({
                    data: { id: city.id.toString(), label: city.id },
                    position: { x: this.x + xOffset, y: this.y + yOffset },
                    locked: true,
                });
                const edges = snapshot.edges.get(city.id);
                edges?.forEach((edge) => {
                    elements.push({
                        data: {
                            id: `${city.id}${edge.neighbor}`,
                            source: city.id,
                            target: edge.neighbor.toString(),
                            distance: edge.weight,
                        },
                    });
                });
            });

            const ctx = (document.getElementById('statusChart') as HTMLCanvasElement).getContext('2d')!;
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        { label: 'Suscetíveis', data: [], borderColor: 'blue', fill: false },
                        { label: 'Infectados', data: [], borderColor: 'red', fill: false },
                        { label: 'Recuperados', data: [], borderColor: 'green', fill: false }
                    ]
                },
                options: {
                    animation: false,
                    scales: {
                        x: { title: { display: true, text: 'Tempo (dias)' } },
                        y: { title: { display: true, text: 'População' } }
                    }
                }
            });

            this.container = document.getElementById('container')!;

            this.cy = cytoscape({
                container: document.getElementById("cy"),
                elements,
                style: [
                    {
                        selector: "node",
                        style: {
                            "background-color": "black",
                            label: "data(label)",
                            color: "white",
                            "font-weight": "bold",
                            "text-valign": "center",
                            padding: "10px",
                        },
                    },
                    {
                        selector: "edge",
                        style: {
                            width: 4,
                            "line-color": "white",
                            "target-arrow-shape": "triangle",
                            label: "data(distance)",
                            "font-size": 14,
                            color: "black",
                            "text-rotation": "autorotate",
                        },
                    },
                ],
                layout: { name: "preset", fit: true },
            });

            const pauseBtn = document.getElementById("pauseBtn");
            pauseBtn?.addEventListener("click", () => {
                this.paused = !this.paused;
                if (pauseBtn instanceof HTMLElement) {
                    pauseBtn.textContent = this.paused ? "Retomar" : "Pausar";
                }
            });

            this.started = true;
        }

        if (this.paused) return;

        // Render active batches
        const activeBatchIds = new Set<string>();
        snapshot.transitBatches.forEach((batch: any) => {
            
            const color = batch.color ?? "gray";

            const particle = this.ensureParticle(batch.id, color, Math.round(batch.count));
            this.updateParticlePosition(batch);
            activeBatchIds.add(batch.id);
        });

        this.removeInactiveBatches(activeBatchIds);

        //Para usar no chart.js
        const totalSusceptible = snapshot.cities.reduce((acc, c) => acc + c.groups.susceptible, 0);
        const totalInfected = snapshot.cities.reduce((acc, c) => acc + c.groups.infected, 0);
        const totalRecovered = snapshot.cities.reduce((acc, c) => acc + c.groups.recovered, 0);

        //para não poluir o gráfico
        if (Math.abs(snapshot.elapsedTime % 1) < 0.001) {
            this.dataHistory.labels.push(snapshot.elapsedTime.toFixed(0)); // mostra "1", "2", "3", etc.
            this.dataHistory.susceptible.push(totalSusceptible);
            this.dataHistory.infected.push(totalInfected);
            this.dataHistory.recovered.push(totalRecovered);

            // Mantém o gráfico com no máximo 100 pontos visíveis
            if (this.dataHistory.labels.length > 100) {
                this.dataHistory.labels.shift();
                this.dataHistory.susceptible.shift();
                this.dataHistory.infected.shift();
                this.dataHistory.recovered.shift();
            }

            this.chart.data.labels = this.dataHistory.labels;
            this.chart.data.datasets[0].data = this.dataHistory.susceptible;
            this.chart.data.datasets[1].data = this.dataHistory.infected;
            this.chart.data.datasets[2].data = this.dataHistory.recovered;
            this.chart.update("none"); // sem animação
        }

        // Atualizar os blocos
        const greenBlock = document.querySelector(".b-green") as HTMLElement;
        const redBlock = document.querySelector(".b-red") as HTMLElement;
        const blueBlock = document.querySelector(".b-blue") as HTMLElement;

        if (greenBlock) greenBlock.textContent = `${Math.round(totalRecovered)}`;
        if (redBlock) redBlock.textContent = `${Math.round(totalInfected)}`;
        if (blueBlock) blueBlock.textContent = `${Math.round(totalSusceptible)}`;

    }
}
