import cytoscape, { type Core, type NodeSingular } from 'cytoscape';

// Define your node data type
interface PieNodeData {
  id: string;
  slice1: number;
  slice2: number;
}

const cy: Core = cytoscape({
  container: document.getElementById('cy') as HTMLElement,

  elements: [
    { data: { id: 'a', slice1: 0, slice2: 100 } as PieNodeData },
    { data: { id: 'b', slice1: 0, slice2: 100 } as PieNodeData },
  ],

  style: [
    {
      selector: 'node',
      style: {
        shape: 'ellipse',
        width: 50,
        height: 50,
        'background-color': '#fff',
        'pie-size': '100%',
        'pie-1-background-color': '#ff0000',
        'pie-1-background-size': 'data(slice1)' as any,
        'pie-2-background-color': '#0000ff',
        'pie-2-background-size': 'data(slice2)' as any,
      }
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#ccc'
      }
    }
  ],

  layout: {
    name: 'grid',
    rows: 1
  }
});

// Animate pie slices
function animatePie(node: NodeSingular, targetSlice1: number, duration = 2000) {
  const steps = 60;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;

    const newSlice1 = targetSlice1 * progress;
    const newSlice2 = 100 - newSlice1;

    node.data('slice1', newSlice1);
    node.data('slice2', newSlice2);

    if (currentStep >= steps) clearInterval(interval);
  }, duration / steps);
}

// Start animation for each node
cy.nodes().forEach((node: NodeSingular) => {
  const targetSlice1 = node.id() === 'a' ? 40 : 70;
  animatePie(node, targetSlice1);
});