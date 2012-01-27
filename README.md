# CAM.js #

Client Asset Manager (CAM) is a javascript library for managing assets on a users machine.

The library is designed to help with the growing problem of managing client side assets in HTML5 applications. The library provides all of the code necessary to setup a dynamic asset manager that controls downloading and updating of all assets associated with your HTML5 application. 

The library is cross-browser compatible and has failbacks via xhr for browsers that do not support the FileSystemAPI. 


## Usage ##

Below are usage examples for a variety of operations.

#### Asset Configuration ####
The asset configuration file is a json file that depicts your remote directory structure. You must specify "binary" for the library to correctly write to the FileSystem.

``` json

{
	"images": {
		"Files": [
				{"Filename": "GitHub.svg", "binary": true},
				{"Filename": "octocat.png", "binary": true}
			],
		"mydir1": {
		},
		"mydir2": {
		}
}
```

#### Asset Versioning & Updates ####
The version file is a json  file that tells the library if the clients files need to be update. The file is loaded at initialization and checked against the user's local copy. If updates are needed the process of downloading the files will automatically begin. In order to push updates to your clients on the next page load you will need to update the version file on your server.

``` json

{
	"version": "1.0",
	"changes": ""
}
```

#### Initialization ####


``` javascript

	//Define the Filesystem data
	FU.LocalRoot = "CAMExample";
	FU.PersistantSize = 157286400;
	
	//Define Configuration File
	CAM.AssetConfig = "assets.json";
	CAM.VersionAsset = "version.json";
	
	//Define Asset Paths
	CAM.LocalRootPath = "/assets/";
	CAM.RemoteRootPath = "assets/";

	//Initialize with callbacks
	CAM.Initialize(initialized, assetsLoaded);
```

#### Loading an Asset ####
In the loading function below the return type can be a FileSystemAPI fileEntry, a FileAPI file, a FileSystemAPI Url, or binary or text data depending upon the fileType.

``` javascript

	CAM.Load({
		assetName: "octocat.png",
		returnType: "url",
		fileType: FU.FILE_TYPE.BINARY, 
		callback: function(url){
			document.write("</br></br><img src=" + url +" />");
			document.write("</br></br>If you are seeing the github Octocat above the example was successfull!");
		}
	});
```


## Dependencies ##

[FU.js](https://github.com/jpf200124/FU.js "File Utilities for javascript.") - File Utilities for javascript.