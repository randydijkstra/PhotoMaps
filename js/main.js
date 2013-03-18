/* * * * * * * * * * *
 *      Code by: Randy Dijkstra
 *      Version 1.0
 *      File: main.js
 * * * * * * * * * * */

//Instagram vars
var clientId = '963cafce88ff46b2931967df9fe5e322';
var instaAPIuri = "https://api.instagram.com/v1/";

//Google Maps vars
var map;
var markersArray = [];
var defaultLatLong = new google.maps.LatLng(10.1374, 5.3284);
var defaultZoom = 2;

var mapOptions = {
    zoom:defaultZoom,
    minZoom:2,
    center:defaultLatLong,
    mapTypeId:google.maps.MapTypeId.TERRAIN
};


//Better alternative for document.ready
$(window).load(function(){ 
    init(); 
});


function init(){

    //Hide element for smoother experience after loading the images
    $('#images').hide();

    //Initialize clickhandlers
    $('#search').on('click', function(){ startTagSearch(); });
    $('#reset').on('click', function(){ resetAll(); });

    //Initialize keydown handler
    //Keycode == 13 (enter) to start tag search
    $('html').on('keydown', function(event){ 
        if (event.which == 13) {
            event.preventDefault();
            startTagSearch();
        }
    });
    
    //creates new Google Map
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}


function startTagSearch(){
    
    //Tagfield is empty, nothing will happen
    if ($("#tagfield").val() != "") {
        //Get tag from input field
        var tag = $("#tagfield").val();

        //Show the loader, hide the tag inputfield in right collumn
        $('#loader').fadeIn(300);
        $('#tag-input').fadeOut(300);
        $("#top-bar h2").text("Searched tag: "+tag).fadeIn();
        $('#reset').fadeIn();


        //get instagram JSON data, use given tags 
        $.getJSON(instaAPIuri+"tags/"+tag+"/media/recent?client_id=" + clientId + "&callback=?", instagramCallback);

    }else{
        console.log("Field is empty!");
    }
}


function createMarker(latitude, longitude, imgurl, user) {
    var latLngPosition = new google.maps.LatLng(latitude, longitude);

    //Create marker with custom assets
    marker = new google.maps.Marker({
        position:latLngPosition,
        icon:   new google.maps.MarkerImage(imgurl,
                new google.maps.Size(110, 110),
                new google.maps.Point(0,0),
                new google.maps.Point(32, 32)),
        title: user,
        map:map
    });

    //Push in array to delete later
    markersArray.push(marker);
}


function instagramCallback(response) {
    
    //Gives error message when errorcode = 400
    if (response.meta.code == 400) {
        alert(response.meta.error_message);
    }

    //Create picture elements with basic information and image
    $.each(response.data, function (i, item) {
        $("<div>").attr("id", i).attr("class", "picture").appendTo("#images");
        $("<img/>").attr("src", item.images.thumbnail.url).appendTo("#"+i);
        $("<p>").text("Username: " + item.user.username).appendTo("#"+i).css("font-weight", "bold");
        
        //If item.location == null, while trying to get geolocation = error
        if (item.location != null) {
            $("<p>").text("Latitude: ").appendTo("#"+i); 
            $("<p>").text(item.location.latitude).addClass('lat').appendTo("#"+i); 
            $("<p>").text("Longitude: ").appendTo("#"+i);
            $("<p>").text(item.location.longitude).addClass('long').appendTo("#"+i);
            createMarker( //lat, long, icon, title
                item.location.latitude, 
                item.location.longitude, 
                item.images.thumbnail.url, 
                item.user.username);
            $("<button>").text("Show on map").addClass('gotolocation').appendTo("#"+i).css('float', 'right');
        }else{
            $("<p>").text("No location available").appendTo("#"+i).css('font-style', 'italic'); 
        }
    });

    //Fade in imagecontainer and fade out loader after response    
    $('#images').fadeIn(700);
    $('#loader').fadeOut(400);

    /*Add clickhandler for focus on marker, 
    use event as functionparameter for FireFox compatibility issues */
    $('.gotolocation').on('click', function(event){
        console.log("Click!");
        focusToExcistingMarker(event);
    });
}


//Zoom / focus on a certain point on map
function focusToMarker(latLngPosition, zoom){
    map.setCenter(latLngPosition);
    map.setZoom(zoom);
}


function focusToExcistingMarker(event){
    
    //Set target
    var $target = $(event.target);
    
    //target the clicked element
    if ($target.is('.gotolocation')) {
        
        //cache the target values
        var $targetParent = $($target).parent();
        var latcontent = $targetParent.children(".lat").html();
        var longcontent = $targetParent.children(".long").html()

        latLngPosition = new google.maps.LatLng(latcontent, longcontent);

        //pass the long + lat values to focusToMarker function
        focusToMarker(latLngPosition, 13);
    }   
}


function resetAll(){
    //Empty / fade out elements
    $('#images').fadeOut(500).empty();
    $('#top-bar h2').fadeOut(300).empty();
    $('#reset').fadeOut(300);
    $('#tagfield').val("");

    //Fade in elements
    $('#tag-input').fadeIn(600);

    //Reset Google Maps to starting point
    deleteMarkers();
    focusToMarker(defaultLatLong, defaultZoom);
}


// Deletes all markers in the array by removing references to them
function deleteMarkers() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  }
}