var Program = {
	Initialize: function() {
		// Progress variable
		this.status = 0;	
		this.error_code = 0;
		this.cb_list = [
			this.FBLogin, 
			this.GetFriendList,
			this.GetMutualFriendList,
			this.InitGraph,
//			this.ClusterGraph,
			this.ClusterGraphFromServer,
			this.DrawGraph,
			this.End
			];

		// FB Data
		this.Friends = [];
		this.nFriends = 0;

		// FB Progress
		this.MutualProgress = 0;

		// Clustering
		this.cluster_number = 5;
		this.Clusters = [];
		
		// Sigma.js
		this.sigma_instance;

		FB.data = {};
	},

	Progress: function() {
		this.FBLogin();	
	},

	ProgressCallback: function() {
		if (Program.status == -1) Program.Error();
		else (Program.cb_list[Program.status])();
	},

	Error: function() {
		alert('error_code: ' + Program.error_code);
	},

	End: function() {
	},

	FBLogin: function() {
		FB.login(function (response) {
			if (response.authResponse) {
				Program.status = 1;
				Program.ProgressCallback();
			}
			else {
				Program.status = -1;
				Program.error_code = -100; 
				Program.ProgressCallback();
			}
		});
	},

	GetFriendList: function() {
		FB.api('/me/friends', function(response) {
			if (response.data) {
				numFriends = response.data.length;
				$.each(response.data, function(index, friend) {
					Program.Friends[friend.id] = {
						'id': friend.id,
						'name': friend.name,
						'numMutuals': 0,
						'mutuals': []
					};
					++Program.nFriends;
				});

				Program.status = 2;
				Program.ProgressCallback();
			}
			else {
				Program.status = -1;
				Program.error_code = -101;
				Program.ProgressCallback();
			}
		});
	},	

	GetMutualFriendList: function() {
		var success = true;
		var fbfunction = function(friend) {
			FB.api('/me/mutualfriends/' + friend, function(response) {
				if (response.data) {
					Program.Friends[friend]['numMutuals'] = response.data.length;
					Program.Friends[friend]['mutuals'] = response.data;
					Program.GetMutualListCallback();
				}
				else {
					Program.status = -1;
					Program.error_code = -102;
					Program.Error();
				}
			});
		};
		for (var friend in Program.Friends) {
			(fbfunction)(friend);
		}
	},

	GetMutualListCallback: function() {
		++Program.MutualProgress;
		if (Program.status == -1) {
			return;
		}
		if (Program.MutualProgress == Program.nFriends) {
			Program.status = 3;
			Program.ProgressCallback();
		}
	},

	InitGraph: function() {
		Program.sigma_instance = sigma.init(
			document.getElementById('social-graph')).drawingProperties({
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
		
		Program.status = 4;
		Program.ProgressCallback();
	},

	ClusterGraph: function() {
		
		for(i = 0; i < Program.cluster_number; i++){
			Program.Clusters.push({
				'id': i,
				'nodes': [],
				'color': 'rgb('+Math.round(Math.random()*256)+','+
								Math.round(Math.random()*256)+','+
								Math.round(Math.random()*256)+')'
			});
		}

		for (friend in Program.Friends) {
			var cluster = Program.Clusters[(Math.random()*Program.cluster_number)|0];
			// TODO: not randomly select cluster
			Program.sigma_instance.addNode(friend, {
				'x': Math.random(),
				'y': Math.random(),
				'size': 0.5 + 0.05 * Program.Friends[friend]['numMutuals'],
				'color': cluster['color'],
				'cluster': cluster['id'],
				'label': Program.Friends[friend]['name']
			});
			cluster.nodes.push('n'+i);
		}

		var numEdge = 0;
		for (friend in Program.Friends) {
			for (mutual in Program.Friends[friend]['mutuals']) {
				Program.sigma_instance.addEdge(numEdge++, friend, Program.Friends[friend]['mutuals'][mutual]["id"]);
			}
		}
		
		Program.status = 5;
		Program.ProgressCallback();
	},	

	ClusterGraphFromServer: function() {
		$.ajax({
			type: "POST",
			url: "/cluster/",
			data: Program.Friends,
			success: function(data) {
				// addCluster
				for (var i=0;i<int(data["cluster_number"]);i++) {
					Program.Clusters.push({
						'id': i,
						'nodes': [],
						'color': 'rgb('+Math.round(Math.random()*256)+','+
										Math.round(Math.random()*256)+','+
										Math.round(Math.random()*256)+')'
					});
				}

				// addNode
				for (friend_id in data["list"]) {
					var cluster_id = int(data[friend_id]);
					Program.Friends[friend_id] = cluster_id;
					Program.sigma_instance.addNode(friend_id, {
						'x': Math.random(),
						'y': Math.random(),
						'size': 0.5 + 0.05 * Program.Friends[friend_id]['numMutuals'],
						'color': Program.Clusters[cluster_id]['color'],
						'cluster': cluster_id,
						'label': Program.Friends[friend]['name']
					});
				}

				// addEdge
				var numEdge = 0;
				for (friend in Program.Friends) {
					for (mutual in Program.Friends[friend]['mutuals']) {
						Program.sigma_instance.addEdge(numEdge++, friend, Program.Friends[friend]['mutuals'][mutual]["id"]);
					}
				}
				Program.status = 5;
				Program.ProgressCallback();
			},
			error: function(error) {
				Program.status = -1;
				Program.error_code = -103;
				Program.Error();
			}
		});
	},

	DrawGraph: function() {
		Program.sigma_instance.draw();	

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
		
		Program.status = 6;
		Program.ProgressCallback();
	}	
}
