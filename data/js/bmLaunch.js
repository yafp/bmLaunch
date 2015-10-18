// source for Highlight lib
//
// http://bartaz.github.io/sandbox.js/jquery.highlight.html

function doSearch()
{
   currentSearch = $("#searchBox").val();
   //console.log("Current search phrase: "+currentSearch);

   // remove all existing highlights
   $("#bookmarkDiv").unhighlight();

   // highlight everything in the div 'bookmarkDiv' whicbh contains this string
   $("#bookmarkDiv").highlight(currentSearch, { caseSensitive: false });
}
