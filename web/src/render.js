var stars = null;
var context = null;
var canvas = null;
var drawingCanvas = null;
var drawingContext = null;
var showLine = false;
var editor = null;
var drawing = false;
var prevX = 0;
var prevY = 0;
var width = 480;
var height = 480;

function initCanvas(_width, _height) {
	width = document.body.clientWidth;//_width;
	height = window.innerHeight - 66;
	editor = new Editor(width, height);
	editor.initCanvas(width, height);
	initStars();
    editor.drawStars(0.1);
}

var STAR_DENSITY = 1/1200;
function getStarCount () {
	return Math.floor(width * height * STAR_DENSITY);
}
function initStars () {
	stars = [];
	var starCount = getStarCount();
	for (var i=0; i<starCount; i++) {
		stars.push(Star.createRandom());
	}
}
function setThreshold() {
	var sender = document.getElementById('skyBrightness');
	editor.drawStars(sender.value/100);
}
var Star = function (x, y, magnitude, color) {
	this.x = x;
	this.y = y;
	this.magnitude = magnitude;
	this.color = color;
};
Star.prototype.getAlpha = function () {
	return (1-this.magnitude/12);
};
Star.prototype.getRadius = function () {
	return 8 - (this.magnitude);
}
Star.prototype.getColorExpression = function () {
	var col =  'rgba('+this.color.r+','+this.color.g+','+this.color.b+','+this.getAlpha()+')';
	//console.log(col)
	return col;
}
var COLOR_MINIMUM = 160;
Star.createRandom = function () {
	var rand = Math.random();
	var r = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var g = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var b = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	return new Star (
			Math.random() * width,
			Math.random() * height,
			(1-Math.pow(rand,6)) * 6.0,
			{r:r, g:g, b:b});
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

var Editor = function () {
};
Editor.prototype.initCanvas = function () {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    drawingCanvas = document.getElementById('drawing');
    drawingContext = drawingCanvas.getContext('2d');
    var wrapper = document.getElementById('wrapper');
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
    drawingCanvas.style.width = width + 'px';
    drawingCanvas.style.height = height + 'px';
    drawingCanvas.width = width;
    drawingCanvas.height = height;
};
Editor.prototype.renderEdge = function (edge) {
	var rank = 7-Math.max(edge.node0.magnitude, edge.node1.magnitude);
	context.beginPath();
	var alpha = rank/8;
	context.strokeStyle = 'rgba(137, 207, 240, ' + alpha + ')';
	context.lineWidth = rank / 3;
	context.moveTo (edge.node0.x, edge.node0.y);
	context.lineTo (edge.node1.x, edge.node1.y);
	context.stroke();
}

Editor.prototype.drawStars = function (brightness) {
	var threshold = (1-brightness) * 6;
	var r = Math.floor(brightness*40);
	var g = Math.floor(brightness*40);
	var b = Math.floor(brightness*120);
	canvas.style.backgroundColor = "rgb("+r+","+g+","+b+")";
	context.clearRect(0, 0, width, height);
	var starsToShow = [];
	for (i=0; i<stars.length; i++) {
		var star = stars[i];
		if (threshold < star.magnitude)
			continue;
		starsToShow.push(star);
		context.beginPath();
	    context.arc(star.x, star.y, 
	    		star.getRadius(), //magnitude
	    		0, 2 * Math.PI, false);
	    context.fillStyle = star.getColorExpression();
	    context.fill();
	}
	if (!showLine) return;
	// Magnitude Rank
	for (var i=6.5-threshold; i<6; i++) {
		var limit = 6-i;
		var starsToLine = [];
		for (var j=0; j<starsToShow.length; j++) {
			if (starsToShow[j].magnitude < limit) {
				starsToLine.push(starsToShow[j]);
			}
		}
		var edges = new Delauney(width, height).split(starsToLine);
		for (var j=0; j<edges.length; j++ ){
			editor.renderEdge(edges[j]);
		}
	}
}
/* Painting */
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
var phase = 0; //sin(phase)
var blurOn = false;
var blurFunc = null;

/* Blur */
function toggleBlur () {
	if (blurOn) {
		window.clearInterval(blurFunc);
	}
	else {
		blurFunc = window.setInterval(changeBlur, 200);
	}
	blurOn = !blurOn;
}
function  changeBlur() {
	phase += 1;
	if (phase>360) phase = phase-360;
	var blurVal = Math.floor((Math.sin(phase/(2*Math.PI)))*8);
    wrapper.style.webkitFilter = "blur("+blurVal+"px)"; 
}