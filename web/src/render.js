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

var MARGIN_BOTTOM = 80;

function initCanvas(_width, _height) {
	window.scrollTo(0,0);
	width = document.body.clientWidth;//_width;
	height = window.innerHeight - MARGIN_BOTTOM;
	editor = new Editor(width, height);
	editor.initCanvas(width, height);
	initStars({preset:SHUTTLE});
    editor.drawStars(0.1);
}

var STAR_DENSITY = 1/1200;
function getStarCount () {
	return Math.floor(width * height * STAR_DENSITY);
}
function initStars (option) {
	stars = [];
	var starCount = getStarCount();
	var minMagnitude = 0;
	var maxMagnitude = 6;
	if (option && option.preset) {
		minMagnitude = 2;
		starCount -= option.preset.length;
		for (var i=0; i<option.preset.length; i++) {
			stars.push(Star.createPreset(option.preset[i]));
		}
	}
	for (var i=0; i<starCount; i++) {
		stars.push(Star.createRandom(minMagnitude, maxMagnitude));
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
Star.createRandom = function (minMagnitude, maxMagnitude) {
	var rand = Math.random();
	var r = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var g = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var b = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	return new Star (
			Math.random() * width,
			Math.random() * height,
			minMagnitude + (1-Math.pow(rand,6)) * (maxMagnitude - minMagnitude),
			{r:r, g:g, b:b});
};
Star.createPreset = function (coordinates) {
	var x = coordinates[0];
	var y = coordinates[1];
	//TODO
	var r = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var g = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	var b = COLOR_MINIMUM + Math.floor(Math.random() * (255-COLOR_MINIMUM));
	return new Star (
		x * 10 + 84,
		y * 10 + 24,
		0,
		{r:r, g:g, b:b}
		);
}
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
	var brightnessTop = brightness;
	var brightnessBottom = brightness + 0.6;
	var rTop = Math.floor(brightnessTop*40);
	var gTop = Math.floor(brightnessTop*40);
	var bTop = Math.floor(brightnessTop*110);
	var rBottom = Math.floor(brightnessBottom*40);
	var gBottom = Math.floor(brightnessBottom*40);
	var bBottom = Math.floor(brightnessBottom*120);
	canvas.style.background = "-webkit-linear-gradient(top,"
		+"rgb("+rTop+","+gTop+","+bTop+"),"
		+"rgb("+rBottom+","+gBottom+","+bBottom+"))";
	console.log(canvas.style.background);
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
function startDraw (e) {
    e.preventDefault();
	drawing = true;
	prevX = event.x;
	prevY = event.y;
}
function stroke (e) {
    e.preventDefault();    
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
function finishDraw (e) {
    e.preventDefault();
	drawing = false;
}
function startDrawTouch (e) {
    event.preventDefault();
	drawing = true;
	prevX = event.touches[0].pageX;
	prevY = event.touches[0].pageY;
}
function strokeTouch (e) {
	event.preventDefault();    
	if (!drawing) return;
	drawingContext.beginPath();
	drawingContext.strokeStyle = 'yellow';
	drawingContext.lineWidth = 4;
	drawingContext.moveTo (prevX, prevY)
	drawingContext.lineTo (event.touches[0].pageX, event.touches[0].pageY);
	drawingContext.stroke();
	prevX = event.touches[0].pageX;
	prevY = event.touches[0].pageY;
}
function finishDrawTouch (e) {
	event.preventDefault();
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