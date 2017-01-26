## Quasi Sprite Animator App

## How to run
**With Electron**

1. Download or Clone the repo
2. Open command prompt and cd to the folder containing package.json ( not the package.json inside the app folder! )
3. Install the dependencies by using the cli

 `npm install`
4. Run the app with electron by using the cli

 `electron .`

 ( That's assuming you're in the package.json directory, if not cd to that directory )

 or with dev tools run

 `electron . --dev`

**From download**

Run the QuasiSprite shortcut or .exe in the app folder

## Building
Two Scripts are included to build:

`build-64` and `build-32` will build for Windows 64bit and 32bit

To use, run the cli

`npm run build-64` or `npm run build-32`

( That's assuming you're in the package.json directory, if not cd to that directory )

## Prebuilt

Version 2.0.4

* Windows - [32bit](https://www.dropbox.com/s/pkln8arrn8n1emv/SpriteAnimator32.rar?dl=0),
[64bit](https://www.dropbox.com/s/rd25v40c5i4sczk/SpriteAnimator.rar?dl=0)

( If not sure which to get, get the 32bit )

## Instructions
**Creating a Config**

After you have created a new file or loaded an existing file. Click on the “Add New” button at the bottom to create a new config.

**Setting up a Config**

Once you select a configuration you should see something like:

![2016-08-27 20_14_36-sprite animation editor](https://cloud.githubusercontent.com/assets/9346563/18031381/fbcbb118-6c92-11e6-8630-b7e46c67e03e.png)

**Name**

The name of the configuration will be used to identify the config. Each config name should be unique and different!
If using this with Quasi Sprite:
This value is used to identify the image as a Quasi Sprite by naming the file with the following format:
```
#configName-fileName
```
configName – the Name we set for the config.
* The # and – are important!

**Sample Image**

The sample image the application will use to show the slices and preview of poses.

**Columns**

The number of times to slice the image vertically.

**Rows**

The number of times to slice the image horizontally.

**AnchorX / Y**

The anchor position on for the sprite. Shown on the 1st sprite frame as a red cross:

![2016-08-27 20_18_26-sprite animation editor](https://cloud.githubusercontent.com/assets/9346563/18031399/7507659a-6c93-11e6-9211-b8e0e050e227.png)

**Poses**

The poses that are included inside this config.
* Click “Add New” to add another pose to the config.

**Indexes**

If you have a Sample Image loaded and you set your columns and rows, you will see white numbers on the top left of each slice.

![sprite3](https://cloud.githubusercontent.com/assets/9346563/18031386/06aa2e02-6c93-11e6-9309-b8d23780d4db.png)

These numbers are the Index for that slice. These values will be used when setting the pattern for a pose.

**Setting up Poses**

Once you select a pose, you should see something like:

![sprite2](https://cloud.githubusercontent.com/assets/9346563/18031387/0e46116c-6c93-11e6-8a85-1e26d9b7f096.png)

**Name**

The name of the pose.

**Speed**

The time between changing frames

**Adjust?**

Sets a value to true or false. Can be used to adjust the Speed value if you don’t want it to be constant.
If using this with Quasi Sprite:
Adjust? will adjust the Speed value by the characters move speed ( MV Default behavior )

**Pattern**

A list of indexes that the pose will play. Each index should be separated a comma. For a range you can also use Start-End, ex: 0-10, will be reformatted as 0,1,2,3,4,5,6,7,8,9,10
