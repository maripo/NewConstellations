var stars = null;
var context = null;
var canvas = null;
var drawingContext = null;
var drawingCanvas = null;

function initCanvas() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    drawingCanvas = document.getElementById('drawing');
    drawingContext = drawingCanvas.getContext('2d');
    initStars();
    drawStars(0);
}
var drawing = false;
var prevX = 0;
var prevY = 0;
function startDraw () {
	drawing = true;
	prevX = event.x;
	prevY = event.y;
	console.log("startDraw");
}
function stroke () {
	if (!drawing) return;
	drawingContext.beginPath();
	drawingContext.strokeStyle = 'cyan';
	drawingContext.lineWidth = 4;
	drawingContext.moveTo (prevX, prevY)
	drawingContext.lineTo (event.x, event.y);
	drawingContext.stroke();
	prevX = event.x;
	prevY = event.y;
}
function finishDraw () {
	drawing = false;
	console.log("finishDraw");
}
function drawStars (brightness) {
	var threathold = (1-brightness) * 6;
	var r = Math.floor(brightness*40);
	var g = Math.floor(brightness*40);
	var b = Math.floor(brightness*120);
	canvas.style.backgroundColor = "rgb("+r+","+g+","+b+")";
	context.clearRect(0, 0, WIDTH, HEIGHT);
	var starsToShow = [];
	for (i=0; i<stars.length; i++) {
		var star = stars[i];
		if (threathold < star.magnitude)
			continue;
		starsToShow.push(star);
		context.beginPath();
	    context.arc(star.x, star.y, 
	    		5 - (star.magnitude)*0.5, //magnitude
	    		0, 2 * Math.PI, false);
	    context.fillStyle = 'rgba(255,255,255,'+(1-star.magnitude/6)+')';
	    context.fill();
	}
	var d = new Delauney(WIDTH, HEIGHT);
	var triangles = d.split(starsToShow);
	for (var i=0; i<triangles.length; i++ ){
		console.log("Triangle No. " + i);
		var t = triangles[i];
		for (j=0; j<3; j++) {
			var e = t.edges[j];
			context.beginPath();
			context.strokeStyle = 'cyan';
			context.lineWidth = 1;
			context.moveTo (e.node0.x, e.node0.y);
			context.lineTo (e.node1.x, e.node1.y);
			context.stroke();
			
		}
	}
}
var STAR_COUNT = 200;
function initStars () {
	stars = [];
	for (var i=0; i<STAR_COUNT; i++) {
		stars.push(Star.createRandom());
	}
}
function setThreshold(sender) {
	drawStars(sender.value/100);
}
var WIDTH = 480;
var HEIGHT = 480;
var Star = function (x, y, magnitude, color) {
	this.x = x;
	this.y = y;
	this.magnitude = magnitude;
	this.color = color;
};
Star.createRandom = function () {
	var rand = Math.random();
	return new Star (
			Math.random() * WIDTH,
			Math.random() * HEIGHT,
			(1-rand*rand*rand)* 6.0,
			'white');
};
function test () {
	var triangle = new Triangle(
			[
			 {x:0, y:0},
			 {x:2*Math.sqrt(3), y:0},
			 {x:Math.sqrt(3), y:3}
			 ]
			);
}