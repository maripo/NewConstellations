var stars = null;
var context = null;
var canvas = null;
var drawingCanvas = null;
var drawingContext = null;
var showLine = false;

function initCanvas() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    drawingCanvas = document.getElementById('drawing');
    drawingContext = drawingCanvas.getContext('2d');
    initStars();
    drawStars(0.3);
}
var drawing = false;
var prevX = 0;
var prevY = 0;
function startDraw () {
	drawing = true;
	prevX = event.x;
	prevY = event.y;
}
function stroke () {
	if (!drawing) return;
	drawingContext.beginPath();
	drawingContext.strokeStyle = 'yellow';
	drawingContext.lineWidth = 4;
	drawingContext.moveTo (prevX, prevY)
	drawingContext.lineTo (event.x, event.y);
	drawingContext.stroke();
	prevX = event.x;
	prevY = event.y;
}
function finishDraw () {
	drawing = false;
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
	    		8 - (star.magnitude), //magnitude
	    		0, 2 * Math.PI, false);
	    context.fillStyle = 'rgba(255,255,255,'+(1-star.magnitude/18)+')';
	    context.fill();
	}
	if (showLine) {
		var edges = new Delauney(WIDTH, HEIGHT).split(starsToShow);
		for (var i=0; i<edges.length; i++ ){
			var e = edges[i];
			context.beginPath();
			context.strokeStyle = 'cyan';
			context.lineWidth = 1;
			context.moveTo (e.node0.x, e.node0.y);
			context.lineTo (e.node1.x, e.node1.y);
			context.stroke();
		}
	}
}
var STAR_COUNT = 400;
function initStars () {
	stars = [];
	for (var i=0; i<STAR_COUNT; i++) {
		stars.push(Star.createRandom());
	}
}
function setThreshold() {
	var sender = document.getElementById('skyBrightness');
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
			(1-rand*rand*rand*rand)* 6.0,
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
function toggleLine(sender) {
	showLine = sender.checked;
	setThreshold();
}