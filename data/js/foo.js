console.log("log from /data/js/foo.js");
//alert("Alert-Dialog from /data/js/foo.js");




// Handling the button-clicks
var contentScriptObject = {"greeting" : "hello from add-on"};
unsafeWindow.clonedContentScriptObject = cloneInto(contentScriptObject, unsafeWindow);
unsafeWindow.assignedContentScriptObject = contentScriptObject;
