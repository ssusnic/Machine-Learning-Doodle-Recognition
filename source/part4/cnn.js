/***********************************************************************************
*
* PROGRAM:
*	Doodle Predictor (Part 4)
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
// CNN Constructor
// ---------------------------------------------------------------------------------

var CNN = function(main){
	// reference to the Main State
	this.main = main;
	
	this.NUM_CLASSES = App.DATASETS.length; // number of classes which can be recognized by CNN model
	
	this.IMAGE_SIZE = 784; // size of an image in a dataset
	
	this.NUM_TRAIN_IMAGES = 400; // number of training images in a dataset 
	this.NUM_TEST_IMAGES = 100; // number of test images in a dataset
	
	this.TRAIN_ITERATIONS = 50; // total number of training iterations
	this.TRAIN_BATCH_SIZE = 100; // number of training images used to train model during one iteration

	this.TEST_FREQUENCY = 5; // frequency of testing model accuracy (one test on every 5 training iterations)
	this.TEST_BATCH_SIZE = 50; // number of test images used to test model accuracy
	
	this.trainIteration = 0; // current number of executed training iterations
	
	this.aLoss = []; // array to store model's loss values during training
	this.aAccu = []; // array to store model's accuracy values during training
	
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

	// create a CNN model using a Sequential model type in which
	// tensors are consecutively passed from one layer to the next 
	this.model = tf.sequential();

	// add a convolutional layer
	this.model.add(tf.layers.conv2d({
		inputShape: [28, 28, 1],
		kernelSize: 5,
		filters: 8,
		strides: 1,
		activation: 'relu',
		kernelInitializer: 'varianceScaling'
	}));
	
	// add a max pooling layer
	this.model.add(tf.layers.maxPooling2d({
		poolSize: [2, 2], 
		strides: [2, 2]
	}));
	
	// add a second convolutional layer
	this.model.add(tf.layers.conv2d({
		kernelSize: 5,
		filters: 16,
		strides: 1,
		activation: 'relu',
		kernelInitializer: 'varianceScaling'
	}));
	
	// add a second max pooling layer
	this.model.add(tf.layers.maxPooling2d({
		poolSize: [2, 2], 
		strides: [2, 2]
	}));
	
	// add a flatten layer to flatten the output of the previous layer to a vector
	this.model.add(tf.layers.flatten());
	
	// add a dense (fully connected) layer to perform the final classification 
	this.model.add(tf.layers.dense({
		units: this.NUM_CLASSES, 
		kernelInitializer: 'varianceScaling', 
		activation: 'softmax'
	}));
	
	// compile the model
	this.model.compile({
		optimizer: tf.train.sgd(0.15), // optimizer with learning rate
		loss: 'categoricalCrossentropy', // loss function
		metrics: ['accuracy'], // evaluation metric
	});
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

/**
* Trains the model
*/
CNN.prototype.train = async function(){
	// reset the training flag to know the training is currently in progress
	this.isTrainCompleted = false;
						
	for (let i = 0; i < this.TRAIN_ITERATIONS; i++){
		// increase the number of training iterations
		this.trainIteration++;
		this.main.ui.showStatusBar("Training the CNN - iteration " + this.trainIteration + ".");
		
		// fetch the next Training Batch
		let trainBatch = this.nextTrainBatch(this.TRAIN_BATCH_SIZE);
		
		// create new Test Batch and Validation Set
		let testBatch;
		let validationSet;
				
		if (i % this.TEST_FREQUENCY === 0){ // every few training passes...	
			// fetch the next Test Batch
			testBatch = this.nextTestBatch(this.TEST_BATCH_SIZE);
			
			// build Validation Set by using images and corresponding labels from Test Batch
			validationSet = [testBatch.images, testBatch.labels];
		}
		
		// train the model
		const training = await this.model.fit(
			trainBatch.images,
			trainBatch.labels,
			{batchSize: this.TRAIN_BATCH_SIZE, validationData: validationSet, epochs: 1}
		);

		// get the model loss from the last training iteration and plot the Loss Chart
		var maxLossLength = this.main.ui.bmpLossChart.width;
		if (this.aLoss.length > maxLossLength) this.aLoss.shift();
		this.aLoss.push(1 - Math.min(1, training.history.loss[0]));
		this.main.ui.plotChart(this.main.ui.bmpLossChart, this.aLoss, 1);
		
		if (testBatch != null) {
			// get the model accuracy from the last training iteration and plot the Accuracy Chart
			var maxAccuLength = this.main.ui.bmpAccuChart.width;
			if (this.aAccu.length * this.TEST_FREQUENCY > maxAccuLength) this.aAccu.shift();
			this.aAccu.push(1 - Math.min(1, training.history.acc[0]));
			this.main.ui.plotChart(this.main.ui.bmpAccuChart, this.aAccu, this.TEST_FREQUENCY);
			
			// dispose Test Batch from memory
			testBatch.images.dispose();
			testBatch.labels.dispose();
		}
		
		// dispose Training Batch from memory
		trainBatch.images.dispose();
		trainBatch.labels.dispose();

		// mitigate blocking the UI thread and freezing the tab during training
		await tf.nextFrame();
	}
	
	// set the training flag to know the training is completed
	this.isTrainCompleted = true;
};

/**
* Returns a batch of images and their corresponding classes from the Training Data
*
* @param {integer} batchSize - how many images are included in training batch
*/
CNN.prototype.nextTrainBatch = function(batchSize){
	return this.fetchBatch(
		batchSize, this.aTrainImages, this.aTrainClasses, 
		() => {
			this.trainElement = (this.trainElement + 1) % this.aTrainIndices.length;
			return this.aTrainIndices[this.trainElement];
		}
	);
};

/**
* Returns a batch of images and their corresponding classes from the Test Data
*
* @param {integer} batchSize - how many images are included in test batch
*/
CNN.prototype.nextTestBatch = function(batchSize){
	return this.fetchBatch(
		batchSize, this.aTestImages, this.aTestClasses, 
		() => {
			this.testElement = (this.testElement + 1) % this.aTestIndices.length;
			return this.aTestIndices[this.testElement];
		}
	);
};

/**
* Fetches a batch of images and their corresponding classes
*
* @param {integer} batchSize - how many images are included in the batch
* @param {Float32Array} aImages - array of images
* @param {Uint8Array} aClasses - array of corresponding classes
* @param {integer} getIndex - a function which returns the index of an image that must be fetched
*/
CNN.prototype.fetchBatch = function(batchSize, aImages, aClasses, getIndex){
	// create batch arrays
	const batchImages = new Float32Array(batchSize * this.IMAGE_SIZE);
	const batchLabels = new Uint8Array(batchSize * this.NUM_CLASSES);

	for (let i = 0; i < batchSize; i++){
		// get the index of the image we want to fetch
		const idx = getIndex();
		
		// fetch the image
		const image = aImages.slice(idx * this.IMAGE_SIZE, (idx + 1) * this.IMAGE_SIZE);
		
		// add the image to the batch of images
		batchImages.set(image, i * this.IMAGE_SIZE);

		// get the class number of this image
		const class_num = aClasses[idx];
		
		// generate the label for this image by using "one hot encoding method":
		// define a vector where all elements are 0, beside one element 
		// which points to the correct class of this image 
		const label = new Uint8Array(this.NUM_CLASSES);
		label[class_num] = 1;
		
		// add the label to the batch of labels
		batchLabels.set(label, i * this.NUM_CLASSES);
	}

	// convert batch of images to a temporary tensor
	const images_temp = tf.tensor2d(batchImages, [batchSize, this.IMAGE_SIZE]);
	
	// reshape the temporary tensor to the size of the model input shape
	const images = images_temp.reshape([batchSize, 28, 28, 1]);
	
	// dispose the temporary tensor to free memory
	images_temp.dispose();
	
	// convert batch of labels to tensor
	const labels = tf.tensor2d(batchLabels, [batchSize, this.NUM_CLASSES]);

	return {images, labels};
};