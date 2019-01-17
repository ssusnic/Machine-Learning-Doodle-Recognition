/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor
*
* DESCRIPTION:
*	Recognizing Doodles
*	using Deep Machine Learning
*	with Convolutional Neural Network
*
* LIBRARIES:
*	phaser.min.js - Phaser 2 Framework
*	tensorflow.js - TensorFlow Library
*
* MODULE:	
*	ui.js - UI Class (User Interface)
* 
* ABOUT:
*	@author		Srdjan Susnic
*	@copyright	2019 Ask For Game Task
*	@website	http://www.askforgametask.com
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
	this.btnMoreGames = game.add.button(1048, 625, 'btnMoreGames', this.onMoreGamesClick, this);
	
	this.btnAuthor = game.add.button(1130, 703, 'btnAuthor', this.onMoreGamesClick, this);
	this.btnAuthor.anchor.setTo(0.5);
		
	// create a text which shows messages in the status bar
	this.txtStatBar = game.add.bitmapText(10, 695, "fnt_lato36_black", "", 18);
};

// ---------------------------------------------------------------------------------
// UI Prototype
// ---------------------------------------------------------------------------------

/**
* Disables buttons.
*/
UI.prototype.disableButtons = function(){
};

/**
* Enables buttons.
*/
UI.prototype.enableButtons = function(){
};

/**
* Opens Official Web Site when click on "Play More Games" button.
*/  
UI.prototype.onMoreGamesClick = function(){
	window.open("http://www.askforgametask.com", "_blank");
};

/**
* Shows a message in the status bar.
*
* @param {String} strText - the text to be shown in the status bar
*/
UI.prototype.showStatusBar = function(strText){
	this.txtStatBar.text = strText;
};
