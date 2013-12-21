function Program() {
	// Progress variable
	var status = 0;	
	var error_code = 0;
	var callback_list = [FBLogin, GetFriendList, GetMutualFriendList, InitGraph, ClusterGraph, DrawGraph];

	// FB Data
	var Friends = [];

	// Clustering
	var cluster_number = 5;
	var Clusters = [];
	
	// Sigma.js
	var sigma_instance;

	function Progress() {
		FBLogin();

		GetFriendList();

		GetMutualFriendList();

		InitGraph();

		ClusterGraph();

		DrawGraph();
	}
	
	var FBLogin = function() {
		FB.login(function (response) {
			if (response.authResponse) {
				status = 1;
			}
			else {
				status = -1;
				error_code = -100; 
			}
		});
	};

	var GetFriendList = function() {
		FB.api('/me/friends', function(response) {
			if (response.data) {
				numFriends = response.data.length;
				$.each(response.data, function(index, friend) {
					Friends[friend.id] = {
						'id': friend.id,
						'name': friend.name,
						'numMutuals': 0,
						'mutuals': []
					};
				});

				status = 2;
			}
			else {
				status = -1;
				error_code = -101;
			}
		});
	};	

	var GetMutualFriendList = function() {
		var success = true;
		for (var friend in Friends) {
			FB.api('/me/mutualfriends/' + friend.id, function(response) {
				if (response.data) {
					Friends[friend.id]['numMutuals'] = response.data.length;
					Friends[friend.id]['mutuals'] = response.data;
				}
				else {
					success = false;
					break;
				}
			});
		}

		if (success) {
			status = 3;	
		}
		else {
			status = -1;
			error_code = -102;
		}
	};

	var InitGraph = function() {
		sigma_instance = sigma.init(
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
	};

	var ClusterGraph = function() {
		for(i = 0; i < cluster_number; i++){
			Clusters.push({
				'id': i,
				'nodes': [],
				'color': 'rgb('+Math.round(Math.random()*256)+','+
								Math.round(Math.random()*256)+','+
								Math.round(Math.random()*256)+')'
			});
		}

		for (friend in Friends) {
			var cluster = Clusters[(Math.random()*cluster_number)|0];
			// TODO: not randomly select cluster
			sigma_instance.addNode(friend, {
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
				sigma_instance.addEdge(numEdge++, friend, Friends[friend]['mutuals'][mutual]["id"]);
			}
		}
	};	

	var DrawGraph = function() {
		sigma_instance.draw();	
	};	
}
