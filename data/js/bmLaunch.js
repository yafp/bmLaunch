// source for Highlight lib
//
// http://bartaz.github.io/sandbox.js/jquery.highlight.html

function doSearch()
{
    console.log("doSearch");
   currentSearch = $("#searchBox").val();
   //console.log("Current search phrase: "+currentSearch);

   $("#bookmarkDiv").unhighlight();    // remove all existing highlights
   $("#bookmarkDiv").highlight(currentSearch, { caseSensitive: false });      // highlight everything in the div 'bookmarkDiv' whicbh contains this string
}
