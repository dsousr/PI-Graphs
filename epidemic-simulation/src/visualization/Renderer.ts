import cytoscape from "cytoscape";
import "./style.css";
import type { SimulationSnapshot } from "../simulation/SimulationEngine";

export function renderGraph(snapshot: SimulationSnapshot) {
    let paused = false;

    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [
            { data: { id: 'a', label: 'C-1' }, position: { x: 400, y: 300 }, locked: true },
            { data: { id: 'b', label: 'C-2' }, position: { x: 550, y: 300 }, locked: true },
            { data: { id: 'c', label: 'C-3' }, position: { x: 400, y: 100 }, locked: true },
            { data: { id: 'ab', source: 'a', target: 'b', distance: 10 } },
            { data: { id: 'bc', source: 'b', target: 'c', distance: 50 } },
            { data: { id: 'ac', source: 'a', target: 'c', distance: 30 } }
        ],
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
                    'label': 'data(label)',
                    'font-size': 14,
                    'color': 'black',
                    'text-rotation': 'autorotate'
                }
            }
        ],
        layout: { name: 'preset', fit: true }
    });

    const container = document.getElementById('container');

    function moveParticle(edgeId: string) {
        if (paused) return;
        const edge = cy.getElementById(edgeId);
        const src = cy.getElementById(edge.data('source')).renderedPosition();
        const dst = cy.getElementById(edge.data('target')).renderedPosition();
        const dist = edge.data('distance');

        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = '20px';
        particle.style.height = '20px';
        particle.style.borderRadius = '50%';

        const cores = ['green', 'red', 'blue'];
        particle.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];

        if (!container) return;
        container.appendChild(particle);

        const steps = 60;
        const msPorKm = 300;
        const duration = msPorKm * dist;
        let t = 0;

        const interval = setInterval(() => {
            if (paused) return;
            t++;
            const srcPos = cy.getElementById(edge.data('source')).renderedPosition();
            const dstPos = cy.getElementById(edge.data('target')).renderedPosition();

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

    setInterval(() => moveParticle('ab'), 1500);
    setInterval(() => moveParticle('bc'), 900);
    setInterval(() => moveParticle('ac'), 1800);

    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.textContent = paused ? 'Retomar' : 'Pausar';
    });
}