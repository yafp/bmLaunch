/*
   https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks

   Start new firefox - temp profile:
      jpm run -b $(which firefox)

*/
function createSingleBM()
{
   let { Bookmark, save } = require("sdk/places/bookmarks");

   // Create a new bookmark instance, unsaved
   let bookmark = Bookmark({ title: "Mozilla", url: "http://mozilla.org" });

   // Attempt to save the bookmark instance to the Bookmarks database
   // and store the emitter
   let emitter = save(bookmark);

   // Listen for events
   emitter.on("data", function (saved, inputItem) {
     // on a "data" event, an item has been updated, passing in the
     // latest snapshot from the server as `saved` (with properties
     // such as `updated` and `id`), as well as the initial input
     // item as `inputItem`
     console.log(saved.title === inputItem.title); // true
     console.log(saved !== inputItem); // true
     console.log(inputItem === bookmark); // true
   }).on("end", function (savedItems, inputItems) {
     // Similar to "data" events, except "end" is an aggregate of
     // all progress events, with ordered arrays as `savedItems`
     // and `inputItems`
   });

}



function createMultipleBM()
{
   console.log("createMultipleBM");
   alert("createMultipleBM");
}




function searchBM()
{
   console.log("searchBM");
   alert("searchBM");
}
