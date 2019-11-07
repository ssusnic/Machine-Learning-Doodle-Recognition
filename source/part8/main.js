 /***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 8)
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
App.DATASETS = ['bee', 'candle', 'car', 'clock', 'fish', 'guitar', 'octopus', 'snowman', 'tree', 'umbrella'];

// the number of test data samples intended for predicting by CNN model
App.NUM_SAMPLES = 16;

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
	this.MODE_CLICK_ON_TRAIN = 9;
	this.MODE_CLICK_ON_TEST = 10;
	this.MODE_CLICK_ON_CLEAR = 11;
	
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
		this.game.load.image('imgBack', '../assets/img_back_7.png');
		this.game.load.image('imgDisable', '../assets/img_disable.png');
		
		this.game.load.image('btnTrain', '../assets/btn_train.png');
		this.game.load.image('btnTest', '../assets/btn_test.png');
		this.game.load.image('btnClear', '../assets/btn_clear.png');
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
		
		// create a painter for drawing doodles
		this.painter = new Painter(this);
	},
	
	/**
	* Automatically called on every tick representing the main loop.
	*/
	update : function(){
		switch(this.mode){
			// initialize the game
			case this.MODE_INIT:
				this.painter.reset();
				this.painter.disable();
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
						this.ui.showStatusBar("Initializing training.");
						this.mode = this.MODE_START_TRAIN;
					}
				}
				break;

			// start with CNN training
			case this.MODE_START_TRAIN:
				this.painter.disable();
				this.ui.disableButtons();
					
				this.cnn.train();
				
				this.mode = this.MODE_DO_TRAIN;				
				break;
				
			// wait for completion of the CNN training
			case this.MODE_DO_TRAIN:
				if (this.cnn.isTrainCompleted){
					this.ui.showStatusBar("Training completed. Predicting samples...");
					
					this.mode = this.MODE_START_PREDICT;
				}
				break;
				
			// draw sample images and start with predicting them by using CNN
			case this.MODE_START_PREDICT:
				this.ui.drawSampleImages();
				this.cnn.predictSamples();
				
				this.mode = this.MODE_DO_PREDICT;
				break;
				
			// wait for CNN to make predictions for all samples
			case this.MODE_DO_PREDICT:
				if (this.cnn.isSamplesPredicted){
					this.painter.enable();
					this.ui.enableButtons();
					
					this.ui.showStatusBar(
						"Draw " + App.DATASETS.join(", ") + 
						" to recognize your drawing!"
					);
					
					this.mode = this.MODE_DRAW;
				}
				break;
				
			// draw a doodle and recognize it by using CNN
			case this.MODE_DRAW:
				if (this.game.input.mousePointer.isDown){
					this.painter.draw(this.game.input.x, this.game.input.y);
					
				} else {
					this.painter.recognize();
				}

				break;
				
			// actions on clicking "Train More" button
			case this.MODE_CLICK_ON_TRAIN:
				this.mode = this.MODE_START_TRAIN;
				break;
			
			// actions on clicking "Next Test" button
			case this.MODE_CLICK_ON_TEST:
				this.mode = this.MODE_START_PREDICT;
				break;
				
			// actions on clicking "Clear" button
			case this.MODE_CLICK_ON_CLEAR:
				this.painter.reset();
				this.ui.txtDoodlePrediction.setText("");
				
				this.mode = this.MODE_DRAW;
				break;
		}
	}
};
