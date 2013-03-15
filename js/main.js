function init() {
  // Instanciate sigma.js and customize it :
  console.log("init called");
  var sigInst = sigma.init(document.getElementById('social-graph')).drawingProperties({
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

  // Generate a random graph with :
  //   . N nodes
  //   . E edges
  //   . C clusters
  //   . d the proportion of edges that connect two nodes
  //     from the same cluster
  var i, N = 500, E = 3000, C = 5, d = 0.5, clusters = [];
  for(i = 0; i < C; i++){
    clusters.push({
      'id': i,
      'nodes': [],
      'color': 'rgb('+Math.round(Math.random()*256)+','+
                      Math.round(Math.random()*256)+','+
                      Math.round(Math.random()*256)+')'
    });
  }

  for(i = 0; i < N; i++){
    var cluster = clusters[(Math.random()*C)|0];
    sigInst.addNode('n'+i,{
      'x': Math.random(),
      'y': Math.random(),
      'size': 0.5+4.5*Math.random(),
      'color': cluster['color'],
      'cluster': cluster['id']
    });
    cluster.nodes.push('n'+i);
  }

  for(i = 0; i < E; i++){
    if(Math.random() < 1-d){
      sigInst.addEdge(i,'n'+(Math.random()*N|0),'n'+(Math.random()*N|0));
    }else{
      var cluster = clusters[(Math.random()*C)|0], n = cluster.nodes.length;
      sigInst.addEdge(i,cluster.nodes[Math.random()*n|0],cluster.nodes[Math.random()*n|0]);
    }
  }

  // Start the ForceAtlas2 algorithm
  // (requires "sigma.forceatlas2.js" to be included)
      var newParent = document.getElementById('mouselayer-sigma-1');
	      var mouseLayer = document.getElementById('sigma_mouse_1');
      mouseLayer.addEventListener('mouseover', function() {
		        sigInst.activateFishEye();
				    }, true);
	      mouseLayer.addEventListener('mouseout', function() {
			        sigInst.desactivateFishEye().draw(2,2,2);
					    }, true);

  sigInst.startForceAtlas2();

  /*
  var isRunning = true;
  document.getElementById('stop-layout').addEventListener('click',function(){
    if(isRunning){
      isRunning = false;
      sigInst.stopForceAtlas2();
      document.getElementById('stop-layout').childNodes[0].nodeValue = 'Start Layout';
    }else{
      isRunning = true;
      sigInst.startForceAtlas2();
      document.getElementById('stop-layout').childNodes[0].nodeValue = 'Stop Layout';
    }
  },true);
  document.getElementById('rescale-graph').addEventListener('click',function(){
    sigInst.position(0,0,1).draw();
  },true);*/
}
