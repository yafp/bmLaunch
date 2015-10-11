/*
Searching bookmarks:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks
*/


// APP-BUTTON
//
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var currentBookmarks = new Array();

var button = buttons.ActionButton({
   id: "mozilla-link",
   label: "Open bmLaunch",
   icon: {
      "16": "./fa-external-link-square_16_0_000000_none.png",
      "32": "./fa-external-link-square_32_0_000000_none.png",
      "64": "./fa-external-link-square_64_0_000000_none.png"
   },
   onClick: handleClick
});




// APP-PANEL
// Panel: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/panel
//
var {
   ToggleButton
} = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
   id: "my-button",
   label: "my button",
   icon: {
      "16": "./fa-list_16_0_007dff_none.png",
      "32": "./fa-list_32_0_007dff_none.png",
      "64": "./fa-list_64_0_007dff_none.png"
   },
   onChange: handleChange
});

var panel = panels.Panel({
   contentURL: self.data.url("panel.html"),
   onHide: handleHide
});

function handleChange(state) {
   if (state.checked) {
      panel.show({
         position: button
      });
   }
}

function handleHide() {
   button.state('window', {
      checked: false
   });
}






// Init the Addon
init_bmLaunch();




// --------------------------------------------------
// Init
// --------------------------------------------------
function init_bmLaunch() {
   console.log("### function: init_bmLaunch() started");

   readAllBookmarks();
   displayNotification("Finished reading bookmarks");

   console.log("### function: init_bmLaunch() finished");
}



// --------------------------------------------------
// Display a notification
// https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications
// --------------------------------------------------
function displayNotification(notificationText) {
   var notifications = require("sdk/notifications");
   notifications.notify({
      title: "bmLaunch",
      text: notificationText,
      data: "did gyre and gimble in the wabe",
      onClick: function(data) {
         console.log(data);
         // console.log(this.data) would produce the same result.
      }
   });
}





// --------------------------------------------------
// Reading all bookmarks
// --------------------------------------------------
function readAllBookmarks() {
   console.log("### function: readAllBookmarks() started");

   let {
      search, UNSORTED
   } = require("sdk/places/bookmarks");

   // Simple query with one object
   search({
      query: ""
   }, {
      sort: "group"
   }).on("end", function(results) {
      // results matching any bookmark that has "firefox"
      // in its URL, title or tag, sorted by title

      for (var i = 0; i < results.length; ++i) {
         console.log("");
         console.log(results[i]);

         // save values in public array
         currentBookmarks[i] = results[i];
      }

      console.log("");
      console.log("### function: readAllBookmarks() finished");
   });
}
// --------------------------------------------------




// --------------------------------------------------
// On clicking the Addon-Icon
// --------------------------------------------------
function handleClick(state) {

   console.log("### function handleClick() started");
   //console.log(currentBookmarks);

   // Open an URL
   //tabs.open("https://www.mozilla.org/");
   //tabs.open("index.html"); // open the addon-ui
   tabs.open({
      url: "index.html",
      onReady: runScript
   });


   function runScript(tab) {

      // init variable
      lastGroup = "";
      currentGroup = "";

      // for all bookmarks do thefollowing:
      for (i = 0; i < currentBookmarks.length; i++) {
         //console.log("########################");
         //console.log("- Loop: " + i);

         // get name of current bookmark group
         currentGroup = currentBookmarks[i]["group"]["title"].toString();
         currentGroupID = "gID"+currentBookmarks[i]["group"]["id"].toString();

         // if its a new group - we need a new div for it and a heading
         if (lastGroup != currentGroup) {

            // BAUSTELLE
            //
            // generate a color for this tab & group
            var new_light_color = 'rgb(' + (Math.floor((256-229)*Math.random()) + 230) + ',' +
                                    (Math.floor((256-229)*Math.random()) + 230) + ',' +
                                    (Math.floor((256-229)*Math.random()) + 230) + ')';

            // open a div
            tab.attach({
               //contentScript: "bookmarkDiv.innerHTML += '<div class=\"col-xs-6 col-lg-4\" id=" + currentGroupID + ">'; "
               // with random background colors
               contentScript: "bookmarkDiv.innerHTML += '<div class=\"col-xs-6 col-lg-4\" id=" + currentGroupID + " style=background-color:"+new_light_color+">'; "
            });


            // write Name of Bookmark Group to new div
            //console.log("- writing headline for group-div: " + currentGroup);
            tab.attach({
                  contentScript: currentGroupID +".innerHTML  += '<h4>" + currentGroup + "</h4>' ;"
            });
         }

         // add the actual link to the html page
         //console.log("- adding link:" + currentBookmarks[i]["url"].toString());
         tab.attach({
            contentScript: currentGroupID +".innerHTML += '<a href=" + currentBookmarks[i]["url"].toString() + ">" + currentBookmarks[i]["title"].toString() + "&nbsp;<span class=bookmarkURL>" + currentBookmarks[i]["url"].toString() + "</span></a><br>';"
         });

         // check if div must be closed or not
         //
         // a) is it the last loop run?
         if (i + 1 < currentBookmarks.length) // not the last run
         {
            //check if there comes another link in this group or not
            lastGroup = currentBookmarks[i]["group"]["title"].toString();
            nextGroup = currentBookmarks[i + 1]["group"]["title"].toString();
            if (nextGroup != lastGroup) {
               //console.log("- closing div of group: " + currentGroup);
               tab.attach({
                  contentScript: "bookmarkDiv.innerHTML += '</div> '; "
               });
            }
         } else // it is the last loop
         {
            //console.log("- Last group finished - closing div of group: " + currentGroup);
            tab.attach({
               contentScript: "bookmarkDiv.innerHTML += '</div> '; "
            });
         }



      } // end of loop
      //console.log("---------END OF LOOP-------------" + i);
   }
}
