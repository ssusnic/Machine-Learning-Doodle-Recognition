/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 6)
*
* MODULE:	
*	painter.js - Painter Class
*
* EXTERNAL LIBRARIES:
*	phaser.min.js - Phaser 2 Framework
*	tensorflow.js - TensorFlow Library
*
* DESCRIPTION:
*   Recognizing Doodles using Deep Machine Learning with Convolutional Neural Network
*
* PART:
*	6. Drawing Doodle
*
* LINKS
*	@website	https://www.askforgametask.com
*	@videos		https://www.youtube.com/ssusnic
*	@repos		https://www.github.com/ssusnic
*
* ABOUT:
*	@author		Srdjan Susnic
*	@copyright	2019 Ask For Game Task
*
*	This program comes with ABSOLUTELY NO WARRANTY.
* 
/***********************************************************************************/

// ---------------------------------------------------------------------------------
// Painter Constructor
// ---------------------------------------------------------------------------------

var Painter = function(main){
	// reference to the Main State
	this.main = main;
	
	// reference to the Phaser Game object
	var game = this.main.game;
	
	// define a drawing area
	this.DRAWING_AREA = new Phaser.Rectangle(842, 95, 416, 416);
		
	// create a bitmap of the same size as the drawing area to draw a doodle on it
	this.bmpOrigDrawing = game.make.bitmapData(this.DRAWING_AREA.width+2, this.DRAWING_AREA.height+2);
	this.bmpOrigDrawing.addToWorld(this.DRAWING_AREA.x-1, this.DRAWING_AREA.y-1);
	
	// create a sprite that visualizes that drawing a doodle is disabled
	this.sprDisableEffect = game.add.sprite(this.DRAWING_AREA.x-1, this.DRAWING_AREA.y-1, 'imgDisable');
	this.sprDisableEffect.width = this.bmpOrigDrawing.width;
	this.sprDisableEffect.height = this.bmpOrigDrawing.height;
};

// ---------------------------------------------------------------------------------
// Painter Prototype
// ---------------------------------------------------------------------------------

/**
* Resets Painter parameters.
*/
Painter.prototype.reset = function(){
	// reset the flag to know if something new is drawn
	this.isDrawing = false;

	// reset pencil position and size
	this.pencil = {x:0, y:0, prevX:0, prevY:0, left:0, top:0, right:0, bottom:0};
	
	// clear bitmaps by filling them with white color
	this.bmpOrigDrawing.fill(255, 255, 255);
};

/**
* Hides the sprite with disabling effect over the drawing area.
*/
Painter.prototype.enable = function(){
	this.sprDisableEffect.kill();
};

/**
* Shows the sprite with disabling effect over the drawing area.
*/
Painter.prototype.disable = function(){
	this.sprDisableEffect.revive();
};

/**
* Draws a quadratic curve from the previous point to the current point
*
* @param {number} x - the X coordinate of the mouse
* @param {number} y - the Y coordinate of the mouse
*/
Painter.prototype.draw = function(x, y){
	if (this.DRAWING_AREA.contains(x, y)){ // if mouse is inside the drawing area...
		// calculate pencil position and size
		this.pencil.prevX = this.pencil.x;
		this.pencil.prevY = this.pencil.y;
					
		this.pencil.x = x - this.DRAWING_AREA.x;
		this.pencil.y = y - this.DRAWING_AREA.y;
					
		this.pencil.left = this.pencil.x - 5;
		this.pencil.top = this.pencil.y - 5;
		this.pencil.right = this.pencil.x + 5;
		this.pencil.bottom = this.pencil.y + 5;
					
		// draw a circle at the current pencil position
		this.bmpOrigDrawing.circle(this.pencil.x, this.pencil.y, 4, '#000');
					
		if (!this.isDrawing){
			// if this is the first drawing point, don't draw anything more,
			// just set the flag to know that drawing has been started
			this.isDrawing = true;
						
		} else {
			// else draw a quadratic curve from the previous to the current point
			var xc = (this.pencil.prevX + this.pencil.x) / 2;
			var yc = (this.pencil.prevY + this.pencil.y) / 2;
						
			var ctx = this.bmpOrigDrawing.context;
						
			ctx.beginPath();

			ctx.quadraticCurveTo(this.pencil.prevX, this.pencil.prevY, xc, yc);
			ctx.quadraticCurveTo(xc, yc, this.pencil.x, this.pencil.y);
						
			ctx.lineWidth = 9;
			ctx.strokeStyle = '#000';
			ctx.stroke();

			ctx.closePath();
		}
		
	} else { // else if mouse is outside of the drawing area...
		this.isDrawing = false;
	}
};
