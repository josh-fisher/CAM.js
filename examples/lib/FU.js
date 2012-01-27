// FU.js r1 - FU.js
(function(b,j){function h(a){var b="";switch(a.code){case FileError.QUOTA_EXCEEDED_ERR:b="QUOTA_EXCEEDED_ERR";break;case FileError.NOT_FOUND_ERR:b="NOT_FOUND_ERR";break;case FileError.SECURITY_ERR:b="SECURITY_ERR";break;case FileError.INVALID_MODIFICATION_ERR:b="INVALID_MODIFICATION_ERR";break;case FileError.INVALID_STATE_ERR:b="INVALID_STATE_ERR";break;default:b="Unknown Error"}console.log("Error: "+b)}function u(a){console.log("File Loaded: "+a)}function n(a){console.log("File Saved To Local FileSystem: "+
a)}function v(){console.log("There was an error reading the file")}function w(){}function x(){}function o(){console.log("There was an error writing the file")}function p(){console.log("File Save Progress Update!!")}function y(){console.log("File Write Cancelled by User")}b.LOAD_MECHANISM={FILE:"file",FILESYSTEM:"filesystem",XHR:"xhr",WEBWORKER:"webworker"};b.FILE_TYPE={TXT:"txt",BINARY:"binary"};b.CLIENT_FEATURES={Workers:!1,FilesystemAPI:!1,FileAPI:!1,XHR:!1};if(window.Worker)b.CLIENT_FEATURES.Workers=
!0;if(window.File&&window.FileReader&&window.FileList&&window.Blob)b.CLIENT_FEATURES.FileAPI=!0;if((window.requestFileSystem||window.webkitRequestFileSystem)&&(window.BlobBuilder||window.WebKitBlobBuilder))window.requestFileSystem=window.requestFileSystem||window.webkitRequestFileSystem,b.CLIENT_FEATURES.FilesystemAPI=!0,window.BlobBuilder=window.WebKitBlobBuilder;if(window.XMLHttpRequest)b.CLIENT_FEATURES.XHR=!0;b.FileSystem=j;b.TempFileSystem=j;b.LocalRoot=j;b.PersistantSize=1E7;b.TemporarySize=
1E7;b.InitLocalFileSystem=function(a){function f(c){b.FileSystem=c;b.CreateDirectory("",!1,a)}function d(a){b.TempFileSystem=a;b.CreateDirectory("",!0,function(){})}window.webkitStorageInfo.requestQuota(PERSISTENT,b.PersistantSize,function(a){window.requestFileSystem(PERSISTENT,a,f,h)},function(a){console.log("Error",a)});window.webkitStorageInfo.requestQuota(window.TEMPORARY,b.TemporarySize,function(a){window.requestFileSystem(window.TEMPORARY,a,d,h)},function(a){console.log("Error",a)})};b.LoadFile=
function(a){function f(){if(!a.remoteURL)throw Error("Cannot load a remote file without a remote URL");var c=new XMLHttpRequest;c.onreadystatechange=function(){if(this.readyState==4&&this.status==200){var a;if(g===b.FILE_TYPE.BINARY){var c=this.response;c&&(a=c)}else if(this.responseText!=null)a=this.responseText;k(a)}};c.open("GET",q,!0);if(g===b.FILE_TYPE.BINARY)c.responseType="arraybuffer";c.send(null)}function d(){if(!a.file)throw Error("Cannot Load File. File parameter is not specified.");var c=
new FileReader;c.onerror=n;c.onprogress=o;c.onabort=p;c.onloadend=function(a){k(a.target.result,i.name)};a.sliceParams!==j&&(i=i.webkitSlice(a.sliceParams.startIndex,a.sliceParams.stopIndex));g===b.FILE_TYPE.TXT?c.readAsText(i):c.readAsBinaryString(i)}function c(){function c(b){a.returnType&&m==="fileEntry"?k(b):a.returnType&&m==="url"?k(b.toURL()):b.file(function(b){a.returnType&&m==="file"?k(b):(i=b,a.file=b,d(i))},h)}if(!a.file&&!a.localURL&&!a.fileName)throw Error("Cannot Load File. The correct parameters are not specified.");
var g;g=r?b.TempFileSystem:b.FileSystem;if(a.file)g.root.getFile(i.fullPath,{},function(a){c(a)},h);else if(a.localURL){var e=b.LocalRoot.concat("/"+s);g.root.getFile(e,{},function(a){c(a)},h)}else a.fileName&&b.GetFileFromFilename(t,r,function(a){c(a)})}function l(){if(!a.remoteURL)throw Error("Cannot Load File via WebWorker. Remote URL is required.");worker=new Worker(q);worker.onmessage=function(a){k(a.data)};worker.postMessage((new Date).getTime())}var g,e,q,s,t,i,r,m,k=a.loaded?a.loaded:u,n=
a.onerror?a.onerror:v,o=a.onprogress?a.onprogress:w,p=a.onabort?a.onabort:x;if(!a.fileType||!a.loadMechanism)throw Error("Cannot Load File. Filetype and loadmechanism are required parameters");else g=a.fileType,e=a.loadMechanism,r=a.temporary,q=a.remoteURL,s=a.localURL,t=a.fileName,i=a.file,m=a.returnType;switch(e){case b.LOAD_MECHANISM.FILE:d();break;case b.LOAD_MECHANISM.FILESYSTEM:c();break;case b.LOAD_MECHANISM.XHR:f();break;case b.LOAD_MECHANISM.WEBWORKER:l()}};b.SaveFile=function(a){function f(a){(l?
b.TempFileSystem:b.FileSystem).root.getFile(a,{create:!0},function(a){a.createWriter(function(b){var c=new BlobBuilder;c.append(d);b.write(c.getBlob("application/octet-stream"));b.onerror=this.onerror||o;b.onprogress=this.onprogress||p;b.onabort=this.onabort||y;b.onwriteend=function(){var b=a.toURL();g(b)}},h)},h)}var d,c,l=!1;if(a.remoteAsset===j)throw Error("Cannot Save File: "+a.filePath+" Parameters are not defined!");else d=a.remoteAsset,c=a.filePath,l=a.temporary;var g=a.saved?a.saved:n,a="/"+
b.LocalRoot+c;if(l){var e;encodeURIComponent(d).match(/%[89ABab]/g);e=UUID.generate();c=parseUri(c);c=a.concat(c.directory,"/",e,"/",c.file);f(c)}else f(a)};b.CheckFileSystemForFile=function(a,f,d){a=b.LocalRoot.concat("/"+a);(f?b.TempFileSystem:b.FileSystem).root.getFile(a,{create:!1},function(a){d(a)},function(){d(j)})};b.CreateDirectory=function(a,f,d){a="/"+b.LocalRoot.concat("/"+a);(f?b.TempFileSystem:b.FileSystem).root.getDirectory(a,{create:!0},function(){d()},h)};b.GetFileFromFilename=function(a,
f,d){var c=function(b){b.createReader().readEntries(function(b){for(var b=Array.prototype.slice.call(b||[],0),e=0;e<b.length;e++)!b[e].isDirectory&&b[e].name===a?d(b[e]):b[e].isDirectory&&c(b[e])},h)};c((f?b.TempFileSystem:b.FileSystem).root)}})(window.FU=window.FU||{});