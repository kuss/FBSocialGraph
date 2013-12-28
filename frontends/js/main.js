var Friends = [];
var clusters = [];
var numClusters = 5;
var sigInst;

function initGraph() {
  sigInst = sigma.init(document.getElementById('social-graph')).drawingProperties({
    defaultLabelColor: '#fff',
	defaultLabelSize: 14,
    defaultLabelBGColor: '#fff',
    defaultLabelHoverColor: '#000',
    labelThreshold: 6,
    defaultEdgeType: 'curve'
  }).graphProperties({
    minNodeSize: 0.5,
    maxNodeSize: 5,
    minEdgeSize: 1,
    maxEdgeSize: 1,
  });
}

function generateNode() {
	for(i = 0; i < numClusters; i++){
    	clusters.push({
	    	'id': i,
		    'nodes': [],
		    'color': 'rgb('+Math.round(Math.random()*256)+','+
        	                Math.round(Math.random()*256)+','+
              	  	        Math.round(Math.random()*256)+')'
	    });
  	}

	for (friend in Friends) {
    	var cluster = clusters[(Math.random()*numClusters)|0];
		sigInst.addNode(friend, {
			'x': Math.random(),
			'y': Math.random(),
			'size': 0.5 + 0.05 * Friends[friend]['numMutuals'],
      		'color': cluster['color'],
		    'cluster': cluster['id'],
			'label': Friends[friend]['name']
		});
    	cluster.nodes.push('n'+i);
	}

	var numEdge = 0;
	for (friend in Friends) {
		for (mutual in Friends[friend]['mutuals']) {
			sigInst.addEdge(numEdge++, friend, Friends[friend]['mutuals'][mutual]["id"]);
		}
	}
}

function clustering() {
}

function Main() {
	initGraph();
	generateNode();
	clustering();
	draw();
}

function draw() {
	sigInst.draw();
	/*
	var newParent = document.getElementById('mouselayer-sigma-1');
	var mouseLayer = document.getElementById('sigma_mouse_1');
    mouseLayer.addEventListener('mouseover', function() {
		sigInst.activateFishEye();
	}, true);
	mouseLayer.addEventListener('mouseout', function() {
	    sigInst.desactivateFishEye().draw(2,2,2);
	}, true);
	sigInst.startForceAtlas2();*/
}
