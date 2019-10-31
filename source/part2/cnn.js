/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 2)
*
* MODULE:	
*	cnn.js - CNN Class (Convolution Neural Network)
*
* EXTERNAL LIBRARIES:
*	phaser.min.js - Phaser 2 Framework
*	tensorflow.js - TensorFlow Library
*
* DESCRIPTION:
*   Recognizing Doodles using Deep Machine Learning with Convolutional Neural Network
*
* PART:
*	2. Getting Data
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
// CNN Constructor
// ---------------------------------------------------------------------------------

var CNN = function(main){
	// reference to the Main State
	this.main = main;
	
	this.NUM_CLASSES = App.DATASETS.length; // number of classes which can be recognized by CNN model
	
	this.IMAGE_SIZE = 784; // size of an image in a dataset
	
	this.NUM_TRAIN_IMAGES = 400; // number of training images in a dataset 
	this.NUM_TEST_IMAGES = 100; // number of test images in a dataset
	
	// total number of training images in all classes
	const TOTAL_TRAIN_IMAGES = this.NUM_CLASSES * this.NUM_TRAIN_IMAGES;
	
	// total number of test images in all classes
	const TOTAL_TEST_IMAGES = this.NUM_CLASSES * this.NUM_TEST_IMAGES;
	
	// create Training Data arrays for storing training images and their corresponding classes
	this.aTrainImages = new Float32Array(TOTAL_TRAIN_IMAGES * this.IMAGE_SIZE);
	this.aTrainClasses = new Uint8Array(TOTAL_TRAIN_IMAGES);
	
	// shuffle Training Data by creating an array of shuffled Train indices 
	this.aTrainIndices = tf.util.createShuffledIndices(TOTAL_TRAIN_IMAGES);
	
	// the reference to the current element in the aTrainIndices[] array
	this.trainElement = -1;
					
	// create arrays of Test Data for storing test images and their corresponding classes
	this.aTestImages = new Float32Array(TOTAL_TEST_IMAGES * this.IMAGE_SIZE);
	this.aTestClasses = new Uint8Array(TOTAL_TEST_IMAGES);
	
	// shuffle Test Data by creating an array of shuffled Test indices 
	this.aTestIndices = tf.util.createShuffledIndices(TOTAL_TEST_IMAGES);
	
	// the reference to the current element in the aTestIndices[] array
	this.testElement = -1;
};

// ---------------------------------------------------------------------------------
// CNN Prototype
// ---------------------------------------------------------------------------------

/**
* Splits the entire dataset into training data and test data.
*
* @param {Uint8Array} imagesBuffer - the array with binary data of all images in the dataset
* @param {integer} dataset - the ordinal number of the dataset
*/
CNN.prototype.splitDataset = function(imagesBuffer, dataset){
	// slice dataset to get training images and normalize them
	var trainBuffer = new Float32Array(imagesBuffer.slice(0, this.IMAGE_SIZE * this.NUM_TRAIN_IMAGES));
	trainBuffer = trainBuffer.map(function (cv){return cv/255.0});
	
	// add training images and their corresponding classes into Training Data arrays
	var start = dataset * this.NUM_TRAIN_IMAGES;
	this.aTrainImages.set(trainBuffer, start * this.IMAGE_SIZE);
	this.aTrainClasses.fill(dataset, start, start + this.NUM_TRAIN_IMAGES);
	
	// slice dataset to get test images and normalize them
	var testBuffer = new Float32Array(imagesBuffer.slice(this.IMAGE_SIZE * this.NUM_TRAIN_IMAGES));
	testBuffer = testBuffer.map(function (cv){return cv/255.0});
	
	// add test images and their corresponding classes into Test Data arrays
	start = dataset * this.NUM_TEST_IMAGES;
	this.aTestImages.set(testBuffer, start * this.IMAGE_SIZE);
	this.aTestClasses.fill(dataset, start, start + this.NUM_TEST_IMAGES);
};
