var Delauney = function (width, height) {
	//init
	this.width = width;
	this.height = height;
	this.triangles = [];
	var edges = [];
	var nodes = [];
	this.triangles.push (
			new Triangle ([
	               {x:0,y:0,original:true},
	               {x:this.width,y:0,original:true},
	               {x:0,y:this.height,original:true}
	               ]),
			new Triangle ([
	               {x:this.width,y:0,original:true},
	               {x:0,y:this.height,original:true},
	               {x:this.width,y:this.height,original:true}
	               ])
	);
};
Delauney.prototype.split = function (nodes) {
	this.nodes = nodes;
	for (var i=0; i<this.nodes.length; i++) {
		var tmpTriangles = [];
		var trianglesToMerge = this.getIncluderTriangles (this.triangles, this.nodes[i]);
		for (var j=0; j<this.triangles.length; j++) {
			if (!this.triangles[j].isRemoved) {
				tmpTriangles.push(this.triangles[j]);
			}
		}
		var mergedTriangles = this.merge(trianglesToMerge, this.nodes[i]);
		for (var j=0; j<mergedTriangles.length; j++)
			tmpTriangles.push(mergedTriangles[j]);
		this.triangles = tmpTriangles;
	}
	return this.getUniqueEdges();
};
Delauney.prototype.getUniqueEdges = function () {
	var triangles = this.triangles;
	var allEdges = [];
	var uniqueEdges = [];
	for (var i=0; i<triangles.length; i++) {
		allEdges.push(triangles[i].edges[0]);
		allEdges.push(triangles[i].edges[1]);
		allEdges.push(triangles[i].edges[2]);
	}
	for (var i=0; i<allEdges.length; i++) {
		var duplicated = false;
		for (var j=0; j<i; j++) {
			if (allEdges[i].isEqualTo(allEdges[j]))
				duplicated = true;
		}
		if (!duplicated && !allEdges[i].isOriginal())
			uniqueEdges.push(allEdges[i]);
	}
	return uniqueEdges;
};
Delauney.prototype.merge = function (triangles, node) {
	var allEdges = [];
	for (var i=0; i<triangles.length; i++) {
		// put all edges into array
		var edges = triangles[i].edges;
		for (j=0; j<edges.length; j++)
			allEdges.push(edges[j]);
	}
	for (var i=0; i<allEdges.length; i++) {
		//Compare -> Put into array
		for (var j=0; j<i; j++) {
			var a = allEdges[i];
			var b = allEdges[j];
			if (a.isEqualTo(b)) {
				a.isInner = true;
				b.isInner = true;
			}
		}
	}
	var result = [];
	for (var i=0; i<allEdges.length; i++) {
		var edge = allEdges[i];
		if (edge.isInner) continue;
		result.push (new Triangle ([edge.node0, edge.node1, node]));
	}
	return result;
};

Delauney.prototype.getIncluderTriangles = function (triangles, node) {
	var result = [];
	for (var i=0; i<triangles.length; i++) {
		var triangle = triangles[i];
		if (triangle.isIncluderOf(node)) {
			result.push (triangle);
			triangle.isRemoved = true;
		} else {
			triangle.isRemoved = false;
		}
	}
	return result;
};

var Triangle = function (nodes) {
	this.nodes = nodes;
	this.center = this.getCenter(nodes[0], nodes[1], nodes[2]);
	var dx = nodes[0].x - this.center.x;
	var dy = nodes[0].y - this.center.y;
	this.radius = Math.sqrt (dx*dx + dy*dy);
	this.edges = [
	              new Edge(nodes[0], nodes[1]),
	              new Edge(nodes[1], nodes[2]),
	              new Edge(nodes[2], nodes[0])
	              ];
};
Triangle.prototype.getCenter = function (node0, node1, node2) {
	var dx1 = node1.x-node0.x;
	var dy1 = node1.y-node0.y;
	var dx2 = node2.x-node0.x;
	var dy2 = node2.y-node0.y;
	var Cx1 = (node0.x + node1.x)/2;
	var Cy1 = (node0.y + node1.y)/2;
	var Cx2 = (node0.x + node2.x)/2;
	var Cy2 = (node0.y + node2.y)/2;
	var X =   (dy1*dy2*Cy1 + dx1*dy2*Cx1 - dy1*dy2*Cy2 - dy1*dx2*Cx2) / (dx1*dy2 - dy1*dx2 );
	var Y =   (dx1*dx2*Cx1 + dy1*dx2*Cy1 - dx1*dx2*Cx2 - dx1*dy2*Cy2) / (dy1*dx2 - dx1*dy2 );
	return {x:X, y:Y};
};
Triangle.prototype.isIncluderOf = function (point) {
	var dx = this.center.x - point.x;
	var dy = this.center.y - point.y;
	return dx * dx + dy * dy < this.radius * this.radius;
};

var Edge = function (node0, node1) {
	this.node0 = node0;
	this.node1 = node1;
};
Edge.prototype.isOriginal = function () {
	return (this.node0.original || this.node1.original);
}
Edge.prototype.isEqualTo = function (e) {
	var result =  
			(this.node0.x == e.node0.x && this.node0.y == e.node0.y
					&& this.node1.x == e.node1.x && this.node1.y == e.node1.y)
			||
			(this.node0.x == e.node1.x && this.node0.y == e.node1.y
					&& this.node1.x == e.node0.x && this.node1.y == e.node0.y);
	return result;
};