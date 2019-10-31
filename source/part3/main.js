/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 3)
*
* MODULE:	
*	main.js - Main Program
*
* EXTERNAL LIBRARIES:
*	phaser.min.js - Phaser 2 Framework
*	tensorflow.js - TensorFlow Library
*
* DESCRIPTION:
*   Recognizing Doodles using Deep Machine Learning with Convolutional Neural Network
*
* PART:
*	3. Building Model
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

/***********************************************************************************
/* Setup procedure for creating a new Phaser Game object on window load event
/***********************************************************************************/

window.onload = function () {	
	// create a new game object which is an instance of Phaser.Game
	var game = new Phaser.Game(1280, 720, Phaser.CANVAS);
	
	// add all States to the game object (this program has only the Main State)
	game.state.add('MainState', App.MainState);
	
	// start the Main State
	game.state.start('MainState');
};

/***********************************************************************************
/* The Application Namespace
/***********************************************************************************/

var App = App || {};

// ---------------------------------------------------------------------------------
// Global constants and variables
// ---------------------------------------------------------------------------------

// the names of all datasets
App.DATASETS = ['car', 'fish', 'snowman'];

// ---------------------------------------------------------------------------------
// The Main State constructor
// ---------------------------------------------------------------------------------

App.MainState = function(){
	// constants describing all modes of the main state
	this.MODE_INIT = 1;
	this.MODE_OPEN_FILE = 2;
	this.MODE_LOAD_FILE = 3;
	this.MODE_START_TRAIN = 4;
	this.MODE_DO_TRAIN = 5;
	this.MODE_START_PREDICT = 6;
	this.MODE_DO_PREDICT = 7;
	this.MODE_DRAW = 8;
	
	// set initial mode
	this.mode = this.MODE_INIT;
	
	// the counter of currently loaded datasets
	this.dataset = 0;
};

// ---------------------------------------------------------------------------------
// The Main State prototype
// ---------------------------------------------------------------------------------

App.MainState.prototype = {
	/**
	* Automatically called only once to load all assets.
	*/
	preload : function(){
		this.game.load.image('imgBack', '../assets/img_back_3.png');
		
		this.game.load.image('btnMoreGames', '../assets/btn_moregames.png');
		this.game.load.image('btnAuthor', '../assets/btn_author.png');
		
		this.load.bitmapFont('fntBlackChars', '../assets/fnt_black_chars.png', '../assets/fnt_black_chars.fnt');
	},
	
	/**
	* Automatically called immediately after all assets are loaded to create all objects.
	*/
	create : function(){
		// scale game to cover the entire screen
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignVertically = true;
		this.scale.pageAlignHorizontally = true;
		
		// keep game running if it loses the focus
		this.game.stage.disableVisibilityChange = true;

		// create background
		this.game.add.sprite(0, 0, 'imgBack');
		
		// create a loader for loading datasets
		this.loader = new Phaser.Loader(this.game);

		// create user interface with buttons, bitmaps and texts
		this.ui = new UI(this);
		
		// create a convolution neural network
		this.cnn = new CNN(this);
	},
	
	/**
	* Automatically called on every tick representing the main loop.
	*/
	update : function(){
		switch(this.mode){
			// initialize the game
			case this.MODE_INIT:
				this.ui.disableButtons();
				
				this.mode = this.MODE_OPEN_FILE;
				break;
				
			// open dataset file and start loading it
			case this.MODE_OPEN_FILE:
				var fileName = App.DATASETS[this.dataset] + '.bin';
				
				this.loader.reset();
				this.loader.binary('input_file', '../data/'+fileName);
				this.loader.start();
				
				this.ui.showStatusBar("Loading " + fileName + " file.");

				this.mode = this.MODE_LOAD_FILE;
				break;
				
			// wait on dataset file to be loaded
			case this.MODE_LOAD_FILE:		
				if (this.loader.hasLoaded){
					// split the loaded dataset into training data and test data
					this.cnn.splitDataset(
						new Uint8Array(this.game.cache.getBinary('input_file')),
						this.dataset
					);
					
					// increase the number of loaded datasets
					this.dataset++;
					
					// if we have not loaded all datasets yet then go to load the next one
					// else go to the CNN training
					if (this.dataset < App.DATASETS.length){
						this.mode = this.MODE_OPEN_FILE;
						
					} else {
						this.ui.showStatusBar("All datasets loaded and CNN model created.");
						this.mode = this.MODE_START_TRAIN;
					}
				}
				break;

			case this.MODE_START_TRAIN:
				this.mode = this.MODE_DO_TRAIN;				
				break;
				
			case this.MODE_DO_TRAIN:
				this.mode = this.MODE_START_PREDICT;
				break;
			
			case this.MODE_START_PREDICT:
				this.mode = this.MODE_DO_PREDICT;
				break;

			case this.MODE_DO_PREDICT:
				this.mode = this.MODE_DRAW;
				break;
				
			case this.MODE_DRAW:
				break;
				
		}
	}
};
