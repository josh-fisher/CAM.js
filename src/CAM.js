/**
 * @author JFisher
 */

/**
 * @name CAM
 */
(function( CAM, undefined ) {
	
	if(!window.FU)
		throw Error("Required library FU.js is not loaded. Aborting ...");
	
	CAM.Assets = [];
	CAM.Directories = [];
	CAM.Initialized = false;

	
	/**********************************************************************************************************************
	 * Initialization
	 **********************************************************************************************************************/
	CAM.Initialize = function(initializedCallback, assetsLoadedCallback){
		if(FU.CLIENT_FEATURES.FilesystemAPI)
		{
			//Init the local Filesystem
			FU.InitLocalFileSystem(function initialized(){				
				//Load Remote Assets
				if(assetsLoadedCallback){
					LoadAssets(assetsLoadedCallback);
					CAM.Initialized = true;
					initializedCallback();
				}
				else{
					LoadAssets(initializedCallback);
				}
			});
		}else{
			CAM.Initialized = true;
			initializedCallback();
			
			//Load Remote Asset Configuration File (Json file)
			FU.LoadFile({
				fileType: FU.FILE_TYPE.TXT,
				loadMechanism: FU.LOAD_MECHANISM.XHR,
				remoteURL: CAM.RemoteRootPath.concat(CAM.AssetConfig),
				loaded: function remoteAssetDataLoaded(data){
					//Parse configuration file into object using json parser
					var parsedAssetObject = JSON.parse(data);
					
					//Parse asset object into directories and asset paths
					ParseDirectoriesAndAssets(parsedAssetObject, "");
					
					assetsLoadedCallback();
				}
			});
		}
	};

	
	function LoadAssets(assetsLoadedCallback){
		//Create the local root path.
		FU.CreateDirectory(CAM.LocalRootPath, false, function(){});
		

		//Load Remote Version asset (Json file)
		FU.LoadFile({
			fileType: FU.FILE_TYPE.TXT,
			loadMechanism: FU.LOAD_MECHANISM.XHR,
			remoteURL: CAM.RemoteRootPath.concat(CAM.VersionAsset),
			loaded: function(remoteData){
				//Parse
				var parsedRemoteVersionAsset = JSON.parse(remoteData);
				
				//Check if the local file exists.
				FU.CheckFileSystemForFile(CAM.LocalRootPath.concat(CAM.VersionAsset), false, function(fileEntry){
					if(fileEntry !== undefined){
						//Load Local Version asset (json file)
						FU.LoadFile({
							fileType: FU.FILE_TYPE.TXT,
							loadMechanism: FU.LOAD_MECHANISM.FILESYSTEM,
							file: fileEntry,
							loaded: function(localData){
								//Parse
								var parsedLocalVersionAsset = JSON.parse(localData);
								
								//Compare local and remote versions
								if(parsedLocalVersionAsset.version !== parsedRemoteVersionAsset.version){
									console.log("Assets have changed ... updating assets.");
									
									//Save version file to filesystem.
									FU.SaveFile({
										remoteAsset: remoteData,
										filePath: CAM.LocalRootPath.concat(CAM.VersionAsset),
										temporary: false,
										saved: function(url){
											//TODO: add to some temp variable to track when things are complete for progress.
											console.log(url + " Saved To local Filesystem");
										}
									}); // END SAVE Asset to Local
									
									//Attempt to download all assets
									downloadAssets();
								}
								else{
									console.log("All assets are up to date!")
									
									//Load Remote Asset Configuration File (Json file)
									FU.LoadFile({
										fileType: FU.FILE_TYPE.TXT,
										loadMechanism: FU.LOAD_MECHANISM.XHR,
										remoteURL: CAM.RemoteRootPath.concat(CAM.AssetConfig),
										loaded: function remoteAssetDataLoaded(data){
											//Parse configuration file into object using json parser
											var parsedAssetObject = JSON.parse(data);
											
											//Parse asset object into directories and asset paths
											ParseDirectoriesAndAssets(parsedAssetObject, "");
											
											assetsLoadedCallback();
										}
									});
								}
							}
						});
					}else{
						//Save version file to filesystem.
						FU.SaveFile({
							remoteAsset: remoteData,
							filePath: CAM.LocalRootPath.concat(CAM.VersionAsset),
							temporary: false,
							saved: function(url){
								//TODO: add to some temp variable to track when things are complete for progress.
								console.log(url + " Saved To local Filesystem");
							}
						}); // END SAVE Asset to Local
						
						//Attempt to download all assets
						downloadAssets();
					}
				});
			}
		});
		
		function downloadAssets(){
			//Load Remote Asset Configuration File (Json file)
			FU.LoadFile({
				fileType: FU.FILE_TYPE.TXT,
				loadMechanism: FU.LOAD_MECHANISM.XHR,
				remoteURL: CAM.RemoteRootPath.concat(CAM.AssetConfig),
				loaded: function remoteAssetDataLoaded(data){
					//Parse configuration file into object using json parser
					var parsedAssetObject = JSON.parse(data);
					
					//Parse asset object into directories and asset paths
					ParseDirectoriesAndAssets(parsedAssetObject, "");
					
					//Create Directories (If they do not already exist - handled by FileSystemAPI)
					for (var i=0; i < CAM.Directories.length; i++) {
						//Get directory
						var directory = CAM.LocalRootPath.concat(CAM.Directories[i]);
						
						//Create Directory
						FU.CreateDirectory(directory, false, function(){
							//TODO: add to some temp variable to track when things are complete for progress.
						});
			        }
			        
			        //Save Assets (If they do not already exist - handled by FileSystemAPI)
					var loadedcount = 0;
					for (var i=0; i < CAM.Assets.length; i++) {
						//Get the asset path
						var asset = CAM.Assets[i];
						
						var fileType = (asset.binary) ? (FU.FILE_TYPE.BINARY) : (FU.FILE_TYPE.TXT);
						LoadAndSaveAsset(fileType, asset.Filename);
						
						function LoadAndSaveAsset(fileType, filePath){
							FU.CheckFileSystemForFile(CAM.LocalRootPath.concat(filePath), false, function(fileEntry){
								if(fileEntry !== undefined){
									loadedcount++;
								
									console.log("File: " + CAM.LocalRootPath.concat(filePath) + " is already on Local FileSystem");
									
									if(loadedcount ===  CAM.Assets.length)
										assetsLoadedCallback();
								}else{
									//Load Remote Asset File (json file)
									FU.LoadFile({
										fileType: fileType,
										loadMechanism: FU.LOAD_MECHANISM.XHR,
										remoteURL: CAM.RemoteRootPath.concat(filePath),
										loaded: function remoteAssetLoaded(remoteAsset){
											//Save File to local filesystem
											FU.SaveFile({
												remoteAsset: remoteAsset,
												filePath: CAM.LocalRootPath.concat(filePath),
												temporary: false,
												saved: function(url){
													loadedcount++;
												
													console.log(url + " Saved To local Filesystem");
													
													if(loadedcount ===  CAM.Assets.length)
														assetsLoadedCallback();
												}
											}); // END SAVE Asset to Local
										}
									}); // END LOAD Remote Asset
								}
							});
						};
			        }
				}
			}); // END Load Remote Config
		}
	}
		
	
	
	/**********************************************************************************************************************
	 * Utility Methods
	 **********************************************************************************************************************/
	
	function ParseDirectoriesAndAssets(parentAssetObject, parentPath){
		var path = parentPath;
		for(var assetProp in parentAssetObject) {
		    if(parentAssetObject.hasOwnProperty(assetProp)){
		    	var assetObj = parentAssetObject[assetProp];

		    	if(assetProp !== "Files"){
		    		//Set Path
		    		var newPath = path + assetProp + "/";
		    	
		    		//Push Path
		    		CAM.Directories.push(newPath);
		    		
		    		//Recurse
		    		ParseDirectoriesAndAssets(assetObj, newPath)
		    	}
		    	else{
		    		for (var i=0; i < assetObj.length; i++) {
		    			var fileName = assetObj[i].Filename;
		    			var tmpPath = path + fileName;
		    			assetObj[i].Filename = tmpPath;
		    			CAM.Assets.push(assetObj[i]);
					};
		    	}
		    }
		}
	};
	
	CAM.GetPathFromFilename = function(filename){
		//TODO: Currently only searches for remote paths.
		//		Implement ability to search for local path
		//		and return either a local or remote path.
		
		var filepath = undefined;
		for (var i=0; i < CAM.Assets.length; i++) {
			var index = i;
			var value = CAM.Assets[index];
			var fileNameIndex = -1
			if(value.Filename.indexOf(filename) !== -1)
				fileNameIndex = index;
				
			if(fileNameIndex >= 0){
				filepath = CAM.RemoteRootPath.concat(value.Filename);
				break;
			}
		};
		
		return filepath;
	}
	
	CAM.Load = function(params){
		var assetName, file, returnType, fileType, callback;
		assetName = params.assetName;
		returnType = params.returnType;
		fileType = params.fileType;
		sliceParams = params.sliceParams;
		file = params.file;
		callback = params.callback;
		
		if(FU.CLIENT_FEATURES.FilesystemAPI){
			if(file){
				FU.LoadFile({
			        fileType: fileType,
			        loadMechanism: FU.LOAD_MECHANISM.FILE,
			        file: file,
			        returnType: returnType,
			        temporary: false,
			        sliceParams: sliceParams,
			        loaded: callback
			    });
			}
			else{
				FU.LoadFile({
			        fileType: fileType,
			        loadMechanism: FU.LOAD_MECHANISM.FILESYSTEM,
			        fileName: assetName,
			        returnType: returnType,
			        temporary: false,
			        sliceParams: sliceParams,
			        loaded: callback
			    });
			}
		}
		else if(FU.CLIENT_FEATURES.FileAPI && file){
			FU.LoadFile({
		        fileType: fileType,
		        loadMechanism: FU.LOAD_MECHANISM.FILE,
		        file: file,
		        returnType: returnType,
		        temporary: false,
		        sliceParams: sliceParams,
		        loaded: callback
		    });
		}
		else{
			var remoteURL = CAM.GetPathFromFilename(assetName);
			
			
			if(params.returnType && returnType === "url"){
				callback(remoteURL);
			}
			else{
				FU.LoadFile({
			        fileType: fileType,
			        loadMechanism: FU.LOAD_MECHANISM.XHR,
			        remoteURL: remoteURL,
			        sliceParams: sliceParams,
			        loaded: callback
			    });
			}
		}
	}
	
}( window.CAM = window.CAM|| {} ));