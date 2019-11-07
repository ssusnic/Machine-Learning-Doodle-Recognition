/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 5)
*
* MODULE:	
*	ui.js - UI Class (User Interface)
*
* EXTERNAL LIBRARIES:
*	phaser.min.js - Phaser 2 Framework
*	tensorflow.js - TensorFlow Library
*
* DESCRIPTION:
*   Recognizing Doodles using Deep Machine Learning with Convolutional Neural Network
*
* PART:
*	5. Predicting Samples
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
// UI Constructor
// ---------------------------------------------------------------------------------

var UI = function(main){
	// reference to the Main State
	this.main = main;
	
	// reference to the Phaser Game object
	var game = this.main.game;
	
	// create buttons
	this.btnTrain = game.add.button(460, 625, 'btnTrain', this.onTrainClick, this);
	this.btnTest = game.add.button(652, 625, 'btnTest', this.onTestClick, this);
	this.btnMoreGames = game.add.button(1048, 625, 'btnMoreGames', this.onMoreGamesClick, this);
	
	this.btnAuthor = game.add.button(1130, 703, 'btnAuthor', this.onMoreGamesClick, this);
	this.btnAuthor.anchor.setTo(0.5);
	
	// create a bitmap for plotting CNN loss trend during training
	this.bmpAccuChart = game.add.bitmapData(350, 250);
	this.bmpAccuChart.addToWorld(45, 95);
	
	// create a bitmap for plotting CNN accuracy trend during training
	this.bmpLossChart = game.add.bitmapData(350, 250);
	this.bmpLossChart.addToWorld(45, 410);
	
	// create a bitmap for showing all sample images intended for predicting by CNN
	this.bmpSampleImages = game.add.bitmapData(28, (28+4) * App.NUM_SAMPLES);
	this.bmpSampleImages.addToWorld(470, 95);
		
	// create a bitmap for drawing green/red rectangles as results of CNN predictions on sample images
	this.bmpSampleResults = game.add.bitmapData(125, (28+4) * App.NUM_SAMPLES);
	this.bmpSampleResults.addToWorld(665, 95);
		
	// create text objects
	this.txtSampleClasses = [];	// array of texts describing correct classes of samples
	this.txtSamplePredictions = [];	// array of texts describing predictions for samples
		
	for (var i=0; i<App.NUM_SAMPLES; i++){
		var y = 100 + i*32;
			
		this.txtSampleClasses.push(
			game.add.bitmapText(550, y, "fntBlackChars", "", 18)
		);
		
		this.txtSamplePredictions.push(
			game.add.bitmapText(670, y, "fntBlackChars", "", 18)
		);
	}
		
	// create a text which shows messages in the status bar
	this.txtStatBar = game.add.bitmapText(10, 695, "fntBlackChars", "", 18);
};

// ---------------------------------------------------------------------------------
// UI Prototype
// ---------------------------------------------------------------------------------

/**
* Disables buttons.
*/
UI.prototype.disableButtons = function(){
	this.btnTrain.kill();
	this.btnTest.kill();
};

/**
* Enables buttons.
*/
UI.prototype.enableButtons = function(){
	this.btnTrain.revive();
	this.btnTest.revive();
};

/**
* Triggers on pressing "Train More" button.
*/ 
UI.prototype.onTrainClick = function(){
	if (this.main.mode == this.main.MODE_DRAW){
		this.main.mode = this.main.MODE_CLICK_ON_TRAIN;
	}
};

/**
* Triggers on pressing "Next Test" button.
*/  
UI.prototype.onTestClick = function(){
	if (this.main.mode == this.main.MODE_DRAW){
		this.main.mode = this.main.MODE_CLICK_ON_TEST;
	}
};

/**
* Opens Official Web Site when click on "Play More Games" button.
*/  
UI.prototype.onMoreGamesClick = function(){
	window.open("http://www.askforgametask.com", "_blank");
};

/**
* Plots a line chart to show a trend over time.
*
* @param {Phaser.BitmapData} bmpChart - the bitmap used to draw lines between points on it
* @param {float Array} aValues - the array of trend values on the Y-axis
* @param {integer} dx - the space between two points on the X-axis
*/ 
UI.prototype.plotChart = function(bmpChart, aValues, dx){
	bmpChart.clear();
		
	for (var i = 1; i < aValues.length; i++){
		var x1 = (i-1) * dx;
		var y1 = bmpChart.height * aValues[i-1];
		
		var x2 = i * dx;
		var y2 = bmpChart.height * aValues[i];
		
		bmpChart.line(x1, y1, x2, y2, '#61bc6d', 2);
	}
};

/**
* Draws all sample images intended for CNN prediction.
*/
UI.prototype.drawSampleImages = function(){
	// clear the bitmap used for drawing samples on it
	this.bmpSampleImages.clear();
	
	// get the reference to the first sample
	var sample = this.main.cnn.testElement;
	
	// for all samples...
	for (var n = 0; n < App.NUM_SAMPLES; n++){
		// get the reference to the next sample
		sample = (sample + 1) % this.main.cnn.aTestIndices.length;
		
		// get the starting position of the first pixel of this sample
		var index = this.main.cnn.aTestIndices[sample];
		var start = index * this.main.cnn.IMAGE_SIZE;
	
		// for all pixels of this sample...
		for (var i = 0; i < this.main.cnn.IMAGE_SIZE; i++){
			// get the color of the current pixel
			var pixel = this.main.cnn.aTestImages[i + start];
			var color = 255 - ((pixel * 255)>>0) & 0xFF;
			
			// calculate XY position of this pixel on the bitmap
			var x = i%28;
			var y = (i/28)>>0;						
			
			// set this pixel on the bitmap
			this.bmpSampleImages.setPixel32(x, y + n*32, color, color, color, 255, false);
		}
	}
	
	// put the image data of the bitmap on the context to show all samples
	this.bmpSampleImages.context.putImageData(this.bmpSampleImages.imageData, 0, 0);
};

/**
* Shows correct classifications for all sample images 
* with their predictions displayed inside green/red rectangle.
*
* @param {integer Array} aClassifications 
*	- the array of index numbers pointing to the correct classes of samples
*
* @param {integer Array} aPredictions 
*	- the array of index numbers pointing to the predicted classes of samples
*/
UI.prototype.showSamplePredictions = function(aClassifications, aPredictions){
	this.bmpSampleResults.clear();
			
	for (var i=0; i<aClassifications.length; i++){
		// set the text of correct class of this sample
		this.txtSampleClasses[i].text = App.DATASETS[aClassifications[i]];
		
		// set the text of predicted class of this sample
		this.txtSamplePredictions[i].text = App.DATASETS[aPredictions[i]];
				
		// if (classification = prediction) then draw green rectangle else draw red rectangle
		var color = (this.txtSampleClasses[i].text === this.txtSamplePredictions[i].text) ? '#61bc6d' : '#e24939';
		this.bmpSampleResults.rect(0, 2 + i*32, this.bmpSampleResults.width, 24, color);
	}
};

/**
* Shows a message in the status bar.
*
* @param {String} strText - the text to be shown in the status bar
*/
UI.prototype.showStatusBar = function(strText){
	this.txtStatBar.text = strText;
};
