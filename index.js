/*
Some documentation links:

- Searching bookmarks:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks

- Panel:
   https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/panel

- Package.json:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/package_json

- Preferences:
   https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs
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



// Init the Addon
init_bmLaunch();




// --------------------------------------------------
// Init
// --------------------------------------------------
function init_bmLaunch() {
   console.log("### function: init_bmLaunch() started");

   // run the init-relevant methods
   readAllBookmarks();
   updateHTMLIndex();
   //displayNotification("Initializing bmLaunch completed");

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

   // Simple query with one object - we want all bookmarks
   search({
      query: ""
   }, {

      // https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks#search%28queries_options%29
      sort: "title"
   }).on("end", function(results) {

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
// Update the empty html index
// --------------------------------------------------
function updateHTMLIndex() {

   console.log("### function handleClick() started");

   // Open an URL (here: addon-ui -> /data/index,html)
   tabs.open({
      url: "index.html",
      onReady: runScript
   });


   function runScript(tab) {

      // init variable
      var createdGroupDivs = new Array(); // control Array which contains the names of all created group divs

      // for all bookmarks do thefollowing:
      for (i = 0; i < currentBookmarks.length; i++) {

         // fill variables
         //
         currentGroupName = currentBookmarks[i]["group"]["title"].toString();
         currentGroupNameID = "gID" + currentBookmarks[i]["group"]["id"].toString();
         currentBookmarkURL = currentBookmarks[i]["url"].toString();
         currentBookmarkTitle = currentBookmarks[i]["title"].toString();
         currentBookmarkTags = currentBookmarks[i]["tags"].toString();



         // should this bookmark be ignored - because the group should be ignored?
         //
         prefsEnableGroupBlacklisting = (require("sdk/simple-prefs").prefs.pref_enableGroupsFilter);
         if (prefsEnableGroupBlacklisting == true) {
            // read blacklisted group
            prefsIgnoredGroups = (require("sdk/simple-prefs").prefs.pref_groupsToIgnore);
            //console.log("Blacklisted group: "+prefsIgnoredGroups);

            if (currentGroupName == prefsIgnoredGroups) // ignore this bookmark
            {
               addCurrentBookmark = false;
            } else {
               addCurrentBookmark = true;
            }
         } else {
            addCurrentBookmark = true;
         }






         if (addCurrentBookmark == true) {
            // shorten URL-title
            //
            prefsEnableShortURLTitle = (require("sdk/simple-prefs").prefs.pref_enableShortURLTitles);
            if (prefsEnableShortURLTitle == true) // if shorten url-title is enabled
            {
               // get url title shorten length
               prefsLengthURLTitle = (require("sdk/simple-prefs").prefs.pref_shortenURLTitleLength);

               if (currentBookmarkTitle.length >= prefsLengthURLTitle) {
                  currentBookmarkTitle = currentBookmarkTitle.substring(0, prefsLengthURLTitle) + " ..";
               }
            }


            // shorten URL
            //
            currentBookmarkURLForDisplay = currentBookmarkURL; // fill variable which is used for display
            // simplify url
            currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("http://", ""); // remove http://
            currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("https://", ""); // remove https://
            // get related preferences
            prefsEnableShortURLs = (require("sdk/simple-prefs").prefs.pref_enableShortURLs);
            prefsLengthURLs = (require("sdk/simple-prefs").prefs.pref_shortenURLLength); // get url title shorten length
            // shorten - if needed
            if ((prefsEnableShortURLs == true) && (currentBookmarkURLForDisplay.length >= prefsLengthURLs)) // if shorten url-title is enabled
            {
               currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.substring(0, prefsLengthURLs) + " ..";
            }


            // Check if we created already a div for this group or not
            //
            if (isInArray(createdGroupDivs, currentGroupNameID)) {
               // we created already a div for this bookmark group
               // nothing to do
            } else {
               // div for this group doesnt exist yet
               // create the div & and add its name to the control script

               // add to control-Array
               createdGroupDivs.push(currentGroupNameID);

               // generate a color for this tab & group
               var new_light_color = 'rgb(' + (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
                  (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
                  (Math.floor((256 - 229) * Math.random()) + 230) + ')';

               // open a div - with a random background color
               bordertyp = "border-color:red;";

               tab.attach({
                  //3 cols
                  contentScript: "bookmarkDiv.innerHTML += '<div class=\"col-xs-6 col-lg-4\" id=" + currentGroupNameID + " style=background-color:" + new_light_color + ">'; "
                     // vs.
                     // 4 cols:
                     //contentScript: "bookmarkDiv.innerHTML += '<div class=\"col-xs-6 col-lg-3\" id=" + currentGroupNameID + " style=background-color:" + new_light_color + ">'; "
               });

               // write Name of Bookmark Group to new div
               tab.attach({
                  contentScript: currentGroupNameID + ".innerHTML  += '<h4>" + currentGroupName + "</h4>' ;"
               });

               // write Name of Bookmark Group to new div
               tab.attach({
                  contentScript: currentGroupNameID + ".innerHTML  += '</div>';"
               });
            }



            // Add the actual bookmark-link to the related div
            //
            // check if url should be displayed
            prefsEnableURL = (require("sdk/simple-prefs").prefs.pref_showURL);

            if (prefsEnableURL == true) // Add url title and url itself
            {
               tab.attach({
                  //contentScript: currentGroupNameID + ".innerHTML += '<a href=" + currentBookmarkURL + ">" + currentBookmarkTitle + "&nbsp;<span class=bookmarkURL>" + currentBookmarkURLForDisplay + "</span>&nbsp;<span class=bookmarkURL>#" + currentBookmarkTags + "__</span></a><br>';"
                  contentScript: currentGroupNameID + ".innerHTML += '<a href=" + currentBookmarkURL + ">" + currentBookmarkTitle + "&nbsp;<span class=bookmarkURL>" + currentBookmarkURLForDisplay + "</span></a><br>';"
               });
            } else // just add the title
            {
               tab.attach({
                  contentScript: currentGroupNameID + ".innerHTML += '<a href=" + currentBookmarkURL + ">" + currentBookmarkTitle + "</a><br>';"
               });
            }
         }

         // done - go to the next array-item
      } // end of loop
   }
}
// --------------------------------------------------



// --------------------------------------------------
// On clicking the Addon-Icon
// --------------------------------------------------
function handleClick(state) {
   updateHTMLIndex();
}
// --------------------------------------------------



// --------------------------------------------------
// Check if an array already contains a specified string
// --------------------------------------------------
function isInArray(array, search) {
   return array.indexOf(search) >= 0;
}
// --------------------------------------------------
