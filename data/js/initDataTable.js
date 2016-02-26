/*
	- Core table comes from index.html
	- Bookmarks get added via main.js
	- Finally - this script makes the table to a DataTable
*/

//var t = $('#example').DataTable();
var t = $('#example').dataTable( {
        "order": [[ 2, "asc" ]],
        "sScrollY": "400px",
        "sDom": "rtiS",
        "bDeferRender": true,
        "scrollCollapse": true,
        "scroller":       true
} );


// set focus to custom search
$("#searchBox").focus();

// enable custom search field
$('#searchBox').keyup(function(){
    t.fnFilter($(this).val());
})
