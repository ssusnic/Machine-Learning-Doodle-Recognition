# Machine Learning: Doodle Recognition with Convolutional Neural Network

Step by step tutorial series on making a game like **Quick, Draw!**. It is an online game that challenges players to draw a doodle and then artificial intelligence guesses what the drawings represent.

This tutorial series shows the whole process of developing the same game called **Doodle Predictor** that runs directly in the browser.

To get a quick insight into the project, watch the video trailer:  
[https://www.youtube.com/watch?v=kLF5vx5Ya1A](https://www.youtube.com/watch?v=kLF5vx5Ya1A)


## Tutorial Info

The game is made in HTML5 using [Phaser 2 framework](http://phaser.io/) and [TensorFlow.js library](https://js.tensorflow.org/) for machine learning. 

To classify drawings, we will implement an **Artificial Intelligence (AI)** based on **Machine Learning (ML)** and **Convolutional Neural Network (CNN)**.

To avoid loading big data files, the model will be trained on a small subset of the [Quick Draw Dataset](https://quickdraw.withgoogle.com/data).

Here is a screenshot of the fully completed Doodle Predictor game:
![Doodle Predictor Screenshot](https://github.com/ssusnic/Machine-Learning-Doodle-Recognition/raw/master/screenshots/machine_learning_doodle_s1_640x360.png "Doodle Predictor Screenshot")

Play Doodle Predictor here:  
http://www.askforgametask.com/tutorial/doodle-recognition-convolutional-neural-network-intro

Read articles about the full series here:  
http://www.askforgametask.com/tutorial/doodle-recognition-convolutional-neural-network-part1 

Visit us:  
http://www.askforgametask.com



## Tutorial Topics

This project is divided into the following 8 parts:

Part 1: Project Setup
Part 2: Getting Data
Part 3: Building the Model
Part 4: Training the Model
Part 5: Predicting Samples
Part 6: Drawing Doodles
Part 7: Recognizing Doodles
Part 8: Adding More Doodle Categories

Each part contains a video and a fully commented source code so you can easily follow the game development step by step.



## Running the Game

To play this game locally, you need to run it in a browser using a local web server as follows:

1. install, configure and run a web server: for instance, let's suppose your server is XAMPP installed in **C:\Xampp** 
2. navigate to the server document root: **C:\Xampp\htdocs**
3. create a new folder called 'doodle_predictor': **C:\Xampp\htdocs\doodle_predictor**
4. download the project
5. copy all project files directly in **C:\Xampp\htdocs\doodle_predictor**
6. now you should have the following folder structure under **C:\Xampp\htdocs\doodle_predictor**:  
	**\assets** (with game resources)  
	**\data** (with datasets)  
	**\libs** (with libraries)  
	**\part1** (with source files of the part 1)  

7. open a web browser and navigate to the **http\://localhost:\<port\>/doodle_predictor/part1**  
  to run the game of the part 1


## Part 1: Introduction 

In this part, we just create a new Phaser Game object and build the basic game structure. 

Revision history:  

`main.js`
- created the Main Program with the main state
- defined all substates of the main state
- added the main loop where the entire game logic will be implemented


`ui.js`
- created a new User Interface class to allow users an interaction with the game
- created 'Play More Games' button with the corresponding trigger function
- created text object for showing messages in the status-bar

Links: 
* [Tutorial & Game - Chapter 1](http://www.askforgametask.com/tutorial/doodle-recognition-convolutional-neural-network-part1)  
* [Video - Episode 1](https://www.youtube.com/watch?v=kLF5vx5Ya1A)


## Part 2: Getting Data

Coming soon...


## Part 3: Building the Model

Coming soon...


## Part 4: Training the Model

Coming soon...


## Part 5: Predicting Samples

Coming soon...


## Part 6: Drawing Doodles

Coming soon...


## Part 7: Recognizing Doodles

Coming soon...


## Part 8: Adding More Doodle Categories

Coming soon...

