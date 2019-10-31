/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 4)
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
*	4. Training Model
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
	this.btnMoreGames = game.add.button(1048, 625, 'btnMoreGames', this.onMoreGamesClick, this);
	
	this.btnAuthor = game.add.button(1130, 703, 'btnAuthor', this.onMoreGamesClick, this);
	this.btnAuthor.anchor.setTo(0.5);
	
	// create a bitmap for plotting CNN loss trend during training
	this.bmpAccuChart = game.add.bitmapData(350, 250);
	this.bmpAccuChart.addToWorld(45, 95);
	
	// create a bitmap for plotting CNN accuracy trend during training
	this.bmpLossChart = game.add.bitmapData(350, 250);
	this.bmpLossChart.addToWorld(45, 410);
		
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
};

/**
* Enables buttons.
*/
UI.prototype.enableButtons = function(){
	this.btnTrain.revive();
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
* Shows a message in the status bar.
*
* @param {String} strText - the text to be shown in the status bar
*/
UI.prototype.showStatusBar = function(strText){
	this.txtStatBar.text = strText;
};
