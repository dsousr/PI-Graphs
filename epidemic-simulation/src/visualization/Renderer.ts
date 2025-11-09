import cytoscape, { type ElementDefinition } from "cytoscape";
import "./style.css";
import type { SimulationObserver, SimulationSnapshot } from "../simulation/SimulationEngine";

export default class Renderer implements SimulationObserver {

    private started = false;
    private paused = false;
    private cy!: cytoscape.Core;
    private container!: HTMLElement;

    private x = 40;
    private y = 20;

    constructor() { }

    private moveParticle(edgeId: string) {
        if (this.paused) return;
        const edge = this.cy.getElementById(edgeId);
        if (!edge || !this.container) return;

        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = '20px';
        particle.style.height = '20px';
        particle.style.borderRadius = '50%';

        const cores = ['green', 'red', 'blue'];
        particle.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];

        this.container.appendChild(particle);

        const steps = 60;
        const msPorKm = 300;
        const dist = edge.data('distance') || 1;
        const duration = msPorKm * dist;
        let t = 0;

        const interval = setInterval(() => {
            if (this.paused) return;
            t++;
            const srcPos = this.cy.getElementById(edge.data('source')).renderedPosition();
            const dstPos = this.cy.getElementById(edge.data('target')).renderedPosition();

            const progress = t / steps;
            const x = srcPos.x + (dstPos.x - srcPos.x) * progress;
            const y = srcPos.y + (dstPos.y - srcPos.y) * progress;

            particle.style.left = `${x - 10}px`;
            particle.style.top = `${y - 10}px`;

            if (t >= steps) {
                clearInterval(interval);
                particle.remove();
            }
        }, duration / steps);
    }

    update(snapshot: SimulationSnapshot) {

        const elements: ElementDefinition[] = [];

        snapshot.cities.forEach((city, index) => {
            const xOffset = (index % 5) * 200; // Adjust x position based on index

            const yOffset = Math.floor(index / 5) * 200; // Adjust y position based on index
            //essa linha add vertices
            elements.push({ data: { id: city.id.toString(), label: city.id }, position: { x: this.x + xOffset, y: this.y + yOffset }, locked: true });
            const edges = snapshot.edges.get(city.id);
            //add arestas
            edges?.forEach(edge => {
                elements.push({
                    data: {
                        id: `${city.id}${edge.neighbor}`,
                        source: city.id,
                        target: edge.neighbor.toString(),
                        distance: edge.weight
                    }
                });
            });
        });
        console.log(elements)
        if (!this.started) {
            this.container = document.getElementById('container')!;
            this.cy = cytoscape({
                container: document.getElementById('cy'),
                elements,
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'black',
                            'label': 'data(label)',
                            'color': 'white',
                            'font-weight': 'bold',
                            'text-valign': 'center',
                            'padding': '10px'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 4,
                            'line-color': 'white',
                            'target-arrow-shape': 'triangle',
                            'label': 'data(distance)',
                            'font-size': 14,
                            'color': 'black',
                            'text-rotation': 'autorotate'
                        }
                    }
                ],
                layout: { name: 'preset', fit: true }

            });

            // Disparar partículas
            elements
            .filter(e => e.data.source && e.data.target)
            .forEach(e => {
                if (e.data.id) {
                    setInterval(() => this.moveParticle(e.data.id!), 1500);
                }
            });

            const pauseBtn = document.getElementById('pauseBtn');
            pauseBtn?.addEventListener('click', () => {
                this.paused = !this.paused;
                if (pauseBtn instanceof HTMLElement) {
                    pauseBtn.textContent = this.paused ? 'Retomar' : 'Pausar';
                }
            });
            this.started = true;
        }
    }
}
