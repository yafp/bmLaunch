// Handling the button-clicks
var contentScriptObject = {"greeting" : "hello from add-on - foo.js"};
unsafeWindow.clonedContentScriptObject = cloneInto(contentScriptObject, unsafeWindow);


var contentScriptObject2 = {"greeting" : "hello from add-on2 - foo.js"};
unsafeWindow.assignedContentScriptObject = cloneInto(contentScriptObject2, unsafeWindow);
