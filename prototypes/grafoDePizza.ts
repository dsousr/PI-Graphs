const cy = cytoscape({
  container: document.getElementById('cy'),

  elements: [
    { data: { id: 'a', slice1: 40, slice2: 60 } },
    { data: { id: 'b', slice1: 70, slice2: 30 } },
  ],

  style: [
    {
      selector: 'node',
      style: {
        'shape': 'ellipse',
        'width': 50,
        'height': 50,
        'background-fill': 'radial-gradient',
        'background-color': '#fff',
        'pie-size': '100%',  // size of the pie relative to node
        'pie-1-background-color': '#ff0000',
        'pie-1-background-size': 'data(slice1)', // value from node data
        'pie-2-background-color': '#0000ff',
        'pie-2-background-size': 'data(slice2)',
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc'
      }
    }
  ],

  layout: {
    name: 'grid',
    rows: 1
  }
});