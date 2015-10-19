/*
Some documentation links:

- Communicating with the content scripts:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Modifying_the_Page_Hosted_by_a_Tab

- Interacting with Page Scripts:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/Interacting_with_page_scripts
   http://louisremi.com/2011/12/07/mozilla-addons-interactions-between-content-scripts-and-pages/

- Package.json:
   https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/package_json

- Favicon Handling
   https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_favicon

- Install Manifest:
   https://developer.mozilla.org/en-US/Add-ons/Install_Manifests
*/




// --------------------------------------------------
// Bookmark Observer
//    https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Using_XPCOM_without_chrome#Bookmarks_Observer
// --------------------------------------------------
//
// This removes the need to import Ci and the XPCOMUtils
const { Class }       = require("sdk/core/heritage");
const { Unknown }     = require('sdk/platform/xpcom');
const { PlacesUtils } = require("resource://gre/modules/PlacesUtils.jsm");

let bmListener = Class({
 extends: Unknown,
 interfaces: [ "nsINavBookmarkObserver" ],
 //This event most often handles all events
 onItemChanged: function(bId, prop, an, nV, lM, type, parentId, aGUID, aParentGUID)
 {
    console.log("onItemChanged", "bId: "+bId, "property: "+prop, "isAnno: "+an, "new value: "+nV, "lastMod: "+lM, "type: "+type, "parentId:"+parentId, "aGUID:"+aGUID);0
    updateHTMLIndex();
    displayNotification("Bookmark added");
 }
});

//We just have a class, but need an object. Notice the small l
var bmlistener = bmListener();
PlacesUtils.bookmarks.addObserver(bmlistener, false);
// --------------------------------------------------





// ---------------------------------------------------------------------------------------
// HOME PAGE -> new tab
// code via: https://addons.mozilla.org/en-US/firefox/addon/new-tab-homepage/
// ---------------------------------------------------------------------------------------
const gprefs = require("sdk/preferences/service");
const newtaburl = require('resource:///modules/NewTabURL.jsm').NewTabURL;

// access global startup prefs
var { PrefsTarget } = require("sdk/preferences/event-target");
var target = PrefsTarget({ branchName: "browser.startup."});

// set the newtab url preference on startup / install / enable / upgrade
exports.main = function (options, callbacks) {
  overrideNewTabPage();
};

// if the homepage is changed, set the new override
target.on("homepage", function () {
  overrideNewTabPage();
});

// if the add-on is unloaded, revert the override
exports.onUnload = function (reason) {
  newtaburl.reset();
};

// overrides the new tab to the (first) homepage
function overrideNewTabPage() {
  // Firefox allows multiple piped homepages, take the first if necessary
  var homepage = gprefs.getLocalized("browser.startup.homepage", "about:home").split("|")[0];
  newtaburl.override(homepage);
}
// ---------------------------------------------------------------------------------------









// --------------------------------------------------
// APP-BUTTON
// --------------------------------------------------
//
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var self = require("sdk/self");

var currentBookmarks = new Array();

var button = buttons.ActionButton({
   id: "mozilla-link",
   label: "Open bmLaunch",
   icon: {
      "16": "./img/fa-external-link-square_16_0_cc6600_none.png",
      "32": "./img/fa-external-link-square_32_0_cc6600_none.png",
      "64": "./img/fa-external-link-square_64_0_cc6600_none.png"
   },
   onClick: handleClick
});


// Init the Addon
init_bmLaunch();
// --------------------------------------------------






// --------------------------------------------------
// Init - runs the init-relevant methods
// --------------------------------------------------
function init_bmLaunch() {
   updateHTMLIndex();
}
// --------------------------------------------------










// --------------------------------------------------
// Reading all bookmarks
//    https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks
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
         //console.log(results[i]);
         currentBookmarks[i] = results[i];      // save values in public array
      }

      console.log("Bookmark count: "+currentBookmarks.length);
      console.log("### function: readAllBookmarks() finished");
   });
}
// --------------------------------------------------





// --------------------------------------------------
// Update the empty html index
// --------------------------------------------------
function updateHTMLIndex() {

   console.log("### function: updateHTMLIndex() started");
   readAllBookmarks();

   // Open an URL (here: addon-ui -> /data/index,html)
   tabs.open({
      url: "index.html",
      onReady: runScript
   });


   function runScript(tab) {

      // run other js file
      tab.attach({
         contentScriptFile: self.data.url("js/foo.js")
      });

      // init variable
      var createdGroupDivs = new Array(); // control Array which contains the names of all created group divs

      // for all bookmarks do thefollowing:
      for (var i = 0; i < currentBookmarks.length; i++) {

         // fill variables
         //
         var currentGroupName = currentBookmarks[i]["group"]["title"].toString();
         var currentGroupNameID = "gID" + currentBookmarks[i]["group"]["id"].toString();
         var currentBookmarkURL = currentBookmarks[i]["url"].toString();
         var currentBookmarkTitle = currentBookmarks[i]["title"].toString();
         var currentBookmarkTags = currentBookmarks[i]["tags"].toString();


         // Reading preferences
         //    https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs
         //
         // should this bookmark be ignored - because the group should be ignored?
         //
         var prefsEnableGroupBlacklisting = (require("sdk/simple-prefs").prefs.pref_enableGroupsFilter);
         var addCurrentBookmark = false;
         if (prefsEnableGroupBlacklisting == true) {
            // read blacklisted group
            var prefsIgnoredGroups = (require("sdk/simple-prefs").prefs.pref_groupsToIgnore);
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



         // if the current bookmark is not in a blacklisted group - try to add it
         if (addCurrentBookmark == true) {
            // shorten URL-title
            //
            var currentBookmarkTitleForDisplay = currentBookmarkTitle;
            var prefsEnableShortURLTitle = (require("sdk/simple-prefs").prefs.pref_enableShortURLTitles);
            if (prefsEnableShortURLTitle == true) // if shorten url-title is enabled
            {
               // get url title shorten length
               var prefsLengthURLTitle = (require("sdk/simple-prefs").prefs.pref_shortenURLTitleLength);

               if (currentBookmarkTitleForDisplay.length >= prefsLengthURLTitle) {
                  currentBookmarkTitleForDisplay = currentBookmarkTitleForDisplay.substring(0, prefsLengthURLTitle) + " ..";
               }
            }


            // shorten URL
            //
            var currentBookmarkURLForDisplay = currentBookmarkURL; // fill variable which is used for display
            // simplify url
            currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("http://", "");       // remove http://
            currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("https://", "");      // remove https://

            // get related preferences
            var prefsEnableShortURLs = (require("sdk/simple-prefs").prefs.pref_enableShortURLs);      // Is url-shortening enabled?
            var prefsLengthURLs = (require("sdk/simple-prefs").prefs.pref_shortenURLLength);          // get defined url-length
            // shorten - if needed
            if ((prefsEnableShortURLs == true) && (currentBookmarkURLForDisplay.length >= prefsLengthURLs)) // if url-shortening is enabled
            {
               currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.substring(0, prefsLengthURLs) + " ..";
            }


            // Check if we created already a div for this group or not
            //
            if (isInArray(createdGroupDivs, currentGroupNameID))  // we created already a div for this bookmark group
            {
               // nothing to do
            }
            else  // div for this group doesnt exist yet
            {
               // create the div & and add its name to the page via content script
               createdGroupDivs.push(currentGroupNameID);         // add current div to control-Array
               var new_light_color = generateRandomRGBColor();    // generate a color for this bookmark-group-div

               tab.attach({
                  contentScript: "bookmarkDiv.innerHTML += '<div class=\"col-xs-6 col-lg-4\" id=" + currentGroupNameID + " style=background-color:" + new_light_color + ">'; "       // create new div with individual color
               });

               // write Name of Bookmark Group to new div
              tab.attach({
                 contentScript: currentGroupNameID + ".innerHTML  += '<h4>" + currentGroupName + "</h4></div>' ;"
              });
            }

            // Add the actual bookmark-link to the related div
            //
            // check if url should be displayed
            var prefsEnableURL = (require("sdk/simple-prefs").prefs.pref_showURL);
            if (prefsEnableURL == true) // Add url title and url itself
            {
               tab.attach({
                  contentScript: currentGroupNameID + ".innerHTML += '<a href=" + currentBookmarkURL + " title=\""+currentBookmarkTitle+"\">" + currentBookmarkTitleForDisplay + "&nbsp;<span class=bookmarkURL>" + currentBookmarkURLForDisplay + "</span></a><br>';"
               });
            } else // just add the title
            {
               tab.attach({
                  contentScript: currentGroupNameID + ".innerHTML += '<a href=" + currentBookmarkURL + " title=\""+currentBookmarkTitle+"\">" + currentBookmarkTitleForDisplay + "</a><br>';"
               });
            }
         }

         // done - go to the next array-item
      } // end of loop

      var addonVersion = require("./package.json").version;
      tab.attach({
         contentScript: "version.innerHTML += 'Build " + addonVersion + "'; ",      // display version number below header-icon
         contentScriptFile: self.data.url("js/stopMainIconSpin.js")                 // stop spinning the main icon via external JS
      });

   }
   console.log("### function: updateHTMLIndex() finished");
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
// HELPER: Check if an array already contains a specified string
// --------------------------------------------------
function isInArray(array, search) {
   return array.indexOf(search) >= 0;
}
// --------------------------------------------------




// --------------------------------------------------
// HELPER: generate a random rgb color
//             output example: rgb(230,242,244)
// --------------------------------------------------
function generateRandomRGBColor()
{
   var new_light_color = 'rgb(' + (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
      (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
      (Math.floor((256 - 229) * Math.random()) + 230) + ')';

   console.log("Generated the random light color: "+new_light_color);
   return new_light_color;
}
// --------------------------------------------------




// --------------------------------------------------
// HELPER: Display a notification
//    https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications
// --------------------------------------------------
function displayNotification(notificationText) {
   console.log("Displaying a notification - text:"+notificationText);

   var notifications = require("sdk/notifications");
   notifications.notify({
      title: "bmLaunch",
      text: notificationText,
      data: "foo",
      onClick: function(data) {
         console.log(data);
      }
   });
}
// --------------------------------------------------
