/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 8)
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
*	8. Adding More Categories
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
		
	// create a bitmap of the cropped drawing where empty borders are cut away
	this.bmpCropDrawing = game.make.bitmapData(this.DRAWING_AREA.width, this.DRAWING_AREA.height);
	
	// create a bitmap of the cropped drawing downsampled to 104x104 pixels
	this.bmpDownSample1 = game.make.bitmapData(104, 104);
	
	// create a bitmap of the cropped drawing downsampled to 52x52 pixels
	this.bmpDownSample2 = game.make.bitmapData(52, 52);
	
	// create a bitmap of the final drawing downsampled to 28x28 pixels which is applicable to fed the CNN
	this.bmpFinalDrawing = game.make.bitmapData(28, 28);
	
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
	
	// reset the cropping area used to cut empty borders away from the original drawing
	this.cropArea = {left:2000, top:2000, right:-2000, bottom:-2000, width:0, height:0, tx:0, ty:0};
	
	// clear bitmaps by filling them with white color
	this.bmpOrigDrawing.fill(255, 255, 255);
	this.bmpCropDrawing.fill(255, 255, 255);
	this.bmpFinalDrawing.fill(255, 255, 255);
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
					
		// recalculate the cropping area by finding the edge points of the original drawing
		if (this.pencil.left < this.cropArea.left){
			this.cropArea.left = this.pencil.left;
			if (this.cropArea.left < 0) this.cropArea.left = 0;
		}
			
		if (this.pencil.right > this.cropArea.right){
			this.cropArea.right = this.pencil.right;
			if (this.cropArea.right > this.DRAWING_AREA.width) this.cropArea.right = this.DRAWING_AREA.width;
		}
			
		if (this.pencil.top < this.cropArea.top){
			this.cropArea.top = this.pencil.top;
			if (this.cropArea.top < 0) this.cropArea.top = 0;
		}
				
		if (this.pencil.bottom > this.cropArea.bottom){
			this.cropArea.bottom = this.pencil.bottom;
			if (this.cropArea.bottom > this.DRAWING_AREA.height) this.cropArea.bottom = this.DRAWING_AREA.height;
		}
		
		this.cropArea.width = this.cropArea.right - this.cropArea.left;
		this.cropArea.height = this.cropArea.bottom - this.cropArea.top;
		
		this.cropArea.tx = 0;
		this.cropArea.ty = 0;
		
		if (this.cropArea.width > this.cropArea.height){
			this.cropArea.ty = (this.cropArea.width - this.cropArea.height)/2;
		}
			
		if (this.cropArea.width < this.cropArea.height){
			this.cropArea.tx = (this.cropArea.height - this.cropArea.width)/2;
		}
		
		// resize the original drawing
		this.resizeDrawing();
		
	} else { // else if mouse is outside of the drawing area...
		// start recognizing the doodle drawing
		this.recognize();
	}
};

/**
* Resizes the original drawing to the size of 28x28 pixels.
*/
Painter.prototype.resizeDrawing = function(){
	// resize the bitmap of the cropped drawing to the cropping area size
	this.bmpCropDrawing.resize(
		this.cropArea.width + this.cropArea.tx * 2, 
		this.cropArea.height + this.cropArea.ty * 2
	);

	// fill the bitmap of the cropped drawing with the white color
	this.bmpCropDrawing.fill(255, 255, 255);
	
	// copy the original drawing without empty borders to the cropped drawing using the cropping area
	this.bmpCropDrawing.copy(
		this.bmpOrigDrawing, 
		this.cropArea.left, this.cropArea.top, 
		this.cropArea.width, this.cropArea.height,
		this.cropArea.tx, this.cropArea.ty
	);
	
	// gradually downsample the cropped drawing to the size of 28x28 pixels as follows:
	
	// step 1: downsample the cropped drawing to 104x104
	this.bmpDownSample1.copy(this.bmpCropDrawing, null, null, null, null, 0, 0, 104, 104);
	
	// step 2: downsample the drawing from 104x104 to 52x52
	this.bmpDownSample2.copy(this.bmpDownSample1, null, null, null, null, 0, 0, 52, 52);
	
	// step 3: downsample the drawing from 52x52 to 26x26 and translate it 
	//         for 1px right and 1px down to put it in the center of the final 28x28 bitmap
	this.bmpFinalDrawing.copy(this.bmpDownSample2, null, null, null, null, 1, 1, 26, 26);
};

/**
* Initiates the drawing recognition by normalizing input array of pixels.
*/
Painter.prototype.recognize = function(){
	if (this.isDrawing){ // only if something new has been drawn...
		// update the final 28x28 bitmap
		this.bmpFinalDrawing.update();
				
		// set all pixels from the final 28x28 bitmap to a local Float32 Array
		// because this is a grayscale drawing, we are mapping only one color component of each pixel
		var aPixels = Float32Array.from(
			this.bmpFinalDrawing.pixels.map(function (cv){return cv & 255;})
		);
		
		// normalize pixels to be in the range between 0.0 and 1.0
		var aNormalizedPixels = aPixels.map(function (cv){return (255-cv)/255.0;});
		
		// use CNN to predict the doodle drawing
		this.main.cnn.predictDoodle(aNormalizedPixels);
						
		// reset the drawing flag so we know there is no need 
		// for the next recognition until something new is drawn
		this.isDrawing = false;
	}
};