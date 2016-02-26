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

- Local storage:
https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-storage
*/



// --------------------------------------------------
// Define essentials
// --------------------------------------------------
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
// Name:          init_bmLaunch
// Function:      runs the init-relevant methods
// --------------------------------------------------
function init_bmLaunch() {

   startBookmarkObserver();
   openAddonUI();
   reloadAddonTab(); // temp Baustelle
}
// --------------------------------------------------



// --------------------------------------------------
// Name:          startBookmarkObserver
// Function:      Starts the Bookmark Observer
//                This removes the need to import Ci and the XPCOMUtils
//                https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Using_XPCOM_without_chrome#Bookmarks_Observer
//                http://doxygen.db48x.net/mozilla/html/interfacensINavBookmarkObserver.html
// Status:        works in general - but needs some love
// --------------------------------------------------
function startBookmarkObserver() {

   const {
      Class
   } = require("sdk/core/heritage");
   const {
      Unknown
   } = require('sdk/platform/xpcom');
   const {
      PlacesUtils
   } = require("resource://gre/modules/PlacesUtils.jsm");

   let bmListener = Class({
      extends: Unknown,
      interfaces: ["nsINavBookmarkObserver"],

      // New Bookmark?
      onItemAdded: function(bId, prop, an, nV, lM, type, parentId, aGUID, aParentGUID) {
         console.log("onItemAdded", "bId: " + bId, "property: " + prop, "isAnno: " + an, "new value: " + nV, "lastMod: " + lM, "type: " + type, "parentId:" + parentId, "aGUID:" + aGUID);
      },

      //This event most often handles all events
      onItemChanged: function(bId, prop, an, nV, lM, type, parentId, aGUID, aParentGUID) {
         console.log("onItemChanged", "bId: " + bId, "property: " + prop, "isAnno: " + an, "new value: " + nV, "lastMod: " + lM, "type: " + type, "parentId:" + parentId, "aGUID:" + aGUID);
         0

         // check if addon-tab is the current tab
         // -> if so - reload it
         // -> if not - do nothing
         checkCurrentTab();

         //openAddonUI();
         //displayNotification("Bookmark added");
      }
   });

   //We just have a class, but need an object. Notice the small l
   var bmlistener = bmListener();
   PlacesUtils.bookmarks.addObserver(bmlistener, false);
}
// --------------------------------------------------





// --------------------------------------------------
// Name:          handleClick
// Function:      On clicking the Addon-Icon
// Status:        works
// --------------------------------------------------
function handleClick(state) {
   //console.log("handleclick() started");
   openAddonUI();
   //console.log("handleclick() finished\n");
}
// --------------------------------------------------





// --------------------------------------------------
// Name:       checkCurrentTab
// Function:   checks if the current/active tab is the addon UI
// Details:    - checks if the current/active tab is the addon UI
//             - if it is - it should reload it due to the changes made to the bookmarks
// Status:     partly working
// --------------------------------------------------
function checkCurrentTab() {
   //console.log("checkCurrentTab() started");

   var tabs = require('sdk/tabs');
   //console.log('active: ' + tabs.activeTab.url);
   if(tabs.activeTab.url === "resource://bmlaunch/data/index.html")
   {
      //console.log("----------- Should update addon tab view now");
      reloadAddonTab(); // not working so far
   }
   //console.log("checkCurrentTab() finished\n");
}
// --------------------------------------------------





// --------------------------------------------------
// Name:       reloadAddonTab
// Function:   Reloading the addon tab
// Status:     Dummy / No function
// --------------------------------------------------
function reloadAddonTab() {
   //console.log("reloadAddonTab() started");
   //console.log("- Should reload tab now");
   //tabs.reload();
   //console.log("- Addon-UI reloaded");
   //console.log("reloadAddonTab() finished\n");
}
// --------------------------------------------------





// --------------------------------------------------
// Name:          openAddonUI
// Function:      Is regenerating the html index (index.html)
// Details:       - checks if bmLaunch is set as homepage via: checkForDefaultHomepage()
//                - fills the bookmark array via: readAllBookmarks()
//                - starts HTML generation via: generateHTMLPage
//                - opens a new page which displays the generated html
// Status:        works
// --------------------------------------------------
function openAddonUI() {
   //console.log("openAddonUI() started");
   checkForDefaultHomepage(); // check if addon is set as homepage
   readAllBookmarks(); // fill the bookmark array

   // Open an URL (here: addon-ui -> /data/index,html)
   tabs.open({
      url: "index.html",
      onReady: generateHTMLPage
   });

   //console.log("openAddonUI() finished\n");
}
// --------------------------------------------------





// --------------------------------------------------
// Name:       generateHTMLPage
// Function:   Is regenerating the html index (index.html)
// Status:     works
// --------------------------------------------------
function generateHTMLPage(tab) {

   //console.log("generateHTMLPage() started");

   var favTableBody="" // variable which connects all table data

   // run other js file
   //tab.attach({
   //   contentScriptFile: self.data.url("js/foo.js")
   //});

   // init variable
   var createdGroupDivs = new Array(); // control Array which contains the names of all created group divs



   // for all bookmarks do the following:
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

// shorten URL-title ???
//
var currentBookmarkTitleForDisplay = currentBookmarkTitle;
var prefsLengthURLTitle = (require("sdk/simple-prefs").prefs.pref_shortenURLTitleLength);

if ((currentBookmarkTitleForDisplay.length >= prefsLengthURLTitle) && (prefsLengthURLTitle != 0))
{
   currentBookmarkTitleForDisplay = currentBookmarkTitleForDisplay.substring(0, prefsLengthURLTitle) + " ..";
}



// shorten URL ???
//
var currentBookmarkURLForDisplay = currentBookmarkURL; // fill variable which is used for display
// simplify url
currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("http://", ""); // remove http://
currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.replace("https://", ""); // remove https://

var prefsLengthURLs = (require("sdk/simple-prefs").prefs.pref_shortenURLLength); // get defined url-length
// shorten - if needed
if ((prefsLengthURLs != 0) && (currentBookmarkURLForDisplay.length >= prefsLengthURLs)) // if url-shortening is enabled
{
   currentBookmarkURLForDisplay = currentBookmarkURLForDisplay.substring(0, prefsLengthURLs) + " ..";
}



// Neu - Adding bookmark to table
// build table body into single var:
favTableBody = favTableBody+"<tr><td>"+currentBookmarkTitleForDisplay+"</td><td><a href=" + currentBookmarkURL + " title=\"" + currentBookmarkTitle + "\">" + currentBookmarkURLForDisplay + "</a></td><td>"+currentGroupName+"</td></tr>";

//tab.attach({
//contentScript: "barbar.innerHTML += '<tr><td>"+currentBookmarkTitleForDisplay+"</td><td><a href=" + currentBookmarkURL + " title=\"" + currentBookmarkTitle + "\">" + currentBookmarkURL + "</a></td><td>"+currentBookmarkTags+"</td><td>"+currentGroupName+"</td></tr>'; " // create new div with individual color
//});
}
// end of loop

//console.log("looping over all favorites finished");
//console.log(favTableBody);

tab.attach({
   contentScript: "barbar.innerHTML += '"+favTableBody+"'; " // create new div with individual color
});
//console.log("added pure HTML table to index");



// the url table is complete - make it a flexible dataTables now
//console.log("initDataTable() started");
tab.attach({
   contentScriptFile: [self.data.url("js/DataTables/jQuery-2.2.0/jquery-2.2.0.min.js"), self.data.url("js/DataTables/DataTables-1.10.11/js/jquery.dataTables.min.js"), self.data.url("js/DataTables/Scroller-1.4.1/js/dataTables.scroller.min.js"), self.data.url("js/initDataTable.js")]
});
//console.log("initDataTable() finished");


var addonVersion = require("./package.json").version;
tab.attach({
   contentScript: "version.innerHTML += 'Build " + addonVersion + "'; ", // display version number below header-icon
   contentScriptFile: self.data.url("js/stopMainIconSpin.js") // stop spinning the main icon via external JS
});

//console.log("generateHTMLPage() finished\n");
}
// --------------------------------------------------





// --------------------------------------------------
// Name:       readAllBookmarks
// Function:   Reading all bookmarks -> writing to array 'currentBookmarks'
//             https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks
// Status:     works
// --------------------------------------------------
function readAllBookmarks() {
   //console.log("readAllBookmarks() started");

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
         currentBookmarks[i] = results[i]; // save values in public array
      }

      console.log("- Bookmark count: " + currentBookmarks.length);
      //console.log("readAllBookmarks() finished\n");
   });
}
// --------------------------------------------------





// ---------------------------------------------------------------------------------------
// Name:          checkForDefaultHomepage
// Function:      HOME PAGE -> new tab
//                code via: https://addons.mozilla.org/en-US/firefox/addon/new-tab-homepage/
// Status:        Baustelle
// ---------------------------------------------------------------------------------------
function checkForDefaultHomepage() {

   console.log("checkForDefaultHomepage() started");

   var prefsEnableHomeAndNewTabs = (require("sdk/simple-prefs").prefs.pref_makeHomeAndNewTab);
   if (prefsEnableHomeAndNewTabs === true) {
      console.log("- bmLaunch is set as homepage & default-tab");

      const gprefs = require("sdk/preferences/service");
      const newtaburl = require('resource:///modules/NewTabURL.jsm').NewTabURL;

      // access global startup prefs
      var {
         PrefsTarget
      } = require("sdk/preferences/event-target");
      var target = PrefsTarget({
         branchName: "browser.startup."
      });

      // set the newtab url preference on startup / install / enable / upgrade
      exports.main = function(options, callbacks) {
         overrideNewTabPage();
      };

      // if the homepage is changed, set the new override
      target.on("homepage", function() {
         overrideNewTabPage();
      });

      // if the add-on is unloaded, revert the override
      exports.onUnload = function(reason) {
         newtaburl.reset();
      };

      // overrides the new tab to the (first) homepage
      function overrideNewTabPage() {
         // Firefox allows multiple piped homepages, take the first if necessary
         var homepage = gprefs.getLocalized("browser.startup.homepage", "about:home").split("|")[0];
         newtaburl.override(homepage);
      }

      displayNotification("bmLaunch is set to your homepage and will be used on each new tab")
   } else {
      console.log("- bmLaunch is NOT set as homepage & default-tab");
   }
   //console.log("checkForDefaultHomepage() finished\n");
}
// ---------------------------------------------------------------------------------------





// --------------------------------------------------
// Name:       isInArray (HELPER)
// Function:   Check if an array already contains a specified string
// Status:     works
// --------------------------------------------------
function isInArray(array, search) {
   return array.indexOf(search) >= 0;
}
// --------------------------------------------------





// --------------------------------------------------
// Name:       generateRandomRGBColor (HELPER)
// Function:   generate a random rgb color
//             returns the new color to calling function
//             result example: rgb(230,242,244)
// Status:     works
// --------------------------------------------------
function generateRandomRGBColor() {
   console.log("generateRandomRGBColor() started");

   var new_light_color = 'rgb(' + (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
   (Math.floor((256 - 229) * Math.random()) + 230) + ',' +
   (Math.floor((256 - 229) * Math.random()) + 230) + ')';

   //console.log("- new random color: " + new_light_color);
   //console.log("generateRandomRGBColor() finished\n");
   return new_light_color;
}
// --------------------------------------------------





// --------------------------------------------------
// Name:          displayNotification (HELPER)
// Function:      Display a notification
//                https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications
// Status:        works
// --------------------------------------------------
function displayNotification(notificationText) {
   console.log("Displaying a notification - text:" + notificationText);

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
