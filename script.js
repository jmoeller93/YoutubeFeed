// Load Youtube IFrame Player API code asynchronously. This boat is going nowhere without it.
var tag = document.createElement("script"); //Add a script tag
tag.src = "https://www.youtube.com/iframe_api"; //Set the SRC to get the API
var firstScriptTag = document.getElementsByTagName("script")[0]; //Find the first script tag in the html
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); //Put this script tag before the first one

var player; //The Youtube API player

//Teststuff
var youTubeUserName = "RaiffeisenKassel";
var localChannelId = "UCQepnZmhCT9Boc2jbv7ehug";
var showPlayListButton = document.querySelector("#showPlayList");
//Teststuff

var ypt_player = document.getElementById("player");
var playlistID = ypt_player.getAttribute("data-pl");
var ypt_thumbs = document.getElementById("ypt_thumbs");
var nowPlaying = "ypt-now-playing"; //For marking the current thumb
var nowPlayingClass = "." + nowPlaying;
var ypt_index = 0; //Playlists begin at the first video by default

//Test



  $(document).ready(function() {
    document.getElementById("div2").innerHTML = // lots of ways to make this happen
      "<h1>YouTube Channel: <a href='http://www.youtube.com/channel/" + // but for this demo, construct and
      localChannelId +
      "' target = '_newtab'>" + // load the HTML to display and
      youTubeUserName +
      "</a></h1>"; // link a header with the channel's name

    $.get(
      "https://www.googleapis.com/youtube/v3/playlists",
      {
        // API call to "playlists" resource with
        part: "snippet, id", // hard-coded channel ID in hand
        channelId: localChannelId,
        key: localStorage.getItem("storedApiKey")
      },
      function(data) {
        // callback cycles through playlist and for
        $.each(data.items, function(i, item) {
          // each playlist item, calls the getVids subroutine
          getVids(item.snippet.title, item.id); // to display the playlist name and its contents
        }); // end $.each
      } // end function(data) callback from /playlists resource API call
    ); // end API call to /playlists resource
  }); // end (document).ready / function

  function getVids(playListTitle, playListID) {
    $.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        part: "snippet",
        maxResults: 20,
        playlistId: playListID,
        key: localStorage.getItem("storedApiKey")
      },
      function(data) {
        var output;
        $("#playListContainer").append(
          "<strong>Playlist: <a href='http://www.youtube.com/playlist/?=" +
            playListID +
            "' target = '_newtab'>" +
            playListTitle +
            "</a></strong><ul>"
        ); // paint title of playlist on web page
        $("#playListContainer").append("</ul><br />"); // finish painting of HTML unstructured list
      } // end callback function from /playlistItems resource API call
    ); // end API call to /playlistItems resource
  } // end getVids function
}); // end of ge

//Test

function getPlaylistData(playlistID, video_list, page_token) {
  //Makes a single request to Youtube Data API
  var apiKey = "AIzaSyArQNfmJDkjxP_ZyZIocbyuDeyTanf4Rl8";
  var theUrl =
    "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet" +
    "&maxResults=" +
    50 + //Can be anything from 1-50
    "&playlistId=" +
    playlistID +
    "&key=" +
    apiKey;
  if (page_token) {
    theUrl += "&pageToken=" + page_token;
  } //If there is page token, start there
  var xmlHttp = null;
  xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
  xmlHttp.onload = function(e) {
    //when the request comes back
    buildJSON(xmlHttp.responseText, video_list, playlistID); //send the data to buildJSON
  };
}

function buildJSON(response, list, playlistID) {
  //Takes the text response and adds it to any existing JSON data
  var results = JSON.parse(response); //Parse it
  if (!list) {
    list = [];
  } //If there is no list to add to, make one
  list.push.apply(list, results.items); //Add JSON data to the list
  if (results.nextPageToken) {
    //If the results included a page token
    getPlaylistData(playlistID, list, results.nextPageToken); //Create another data API request including the current list and page token
  } else {
    //If there is not a next-page token
    buildHTML(list); //Send the JSON data to buildHTML
  }
}

function buildHTML(data) {
  //Turns JSON data into HTML elements
  var list_data = ""; //A string container
  for (i = 0; i < data.length; i++) {
    //Do this to each item in the JSON list
    var item = data[i].snippet; //Each Youtube playlist item snippet
    if (!item.thumbnails) {
      continue;
    } //private videos do no reveal thumbs, so skip them
    list_data +=
      '<li data-ypt-index="' +
      i +
      '"><p>' +
      item.title +
      '</p><span><img alt="' +
      item.title +
      '" src="' +
      item.thumbnails.medium.url +
      '"/></span></li>'; //create an element and add it to the list
  }
  ypt_thumbs.innerHTML = list_data; //After the for loop, insert that list of links into the html
}

function yptThumbHeight() {
  ypt_thumbs.style.height =
    document.getElementById("player").clientHeight + "px"; //change the height of the thumb list
  //breaks if ypt_player.clientHeight + 'px';
}

function onPlayerReady(event) {
  //Once the player is ready...
  yptThumbHeight(); //Set the thumb containter height
}

getPlaylistData(playlistID);

//Once the Youtube Iframe API is ready...
window.onYouTubeIframeAPIReady = function() {
  // Creates an <iframe> (and YouTube player) after the API code downloads. must be globally available
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    playerVars: {
      listType: "playlist",
      list: playlistID,
      rel: 0,
      showinfo: 0,
      ecver: 2
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });

  // When the player does something...
  function onPlayerStateChange(event) {
    //Let's check on what video is playing
    var currentIndex = player.getPlaylistIndex();
    var the_thumbs = ypt_thumbs.getElementsByTagName("li");
    var currentThumb = the_thumbs[currentIndex];

    if (event.data == YT.PlayerState.PLAYING) {
      //A video is playing

      for (var i = 0; i < the_thumbs.length; i++) {
        //Loop through the thumbs
        the_thumbs[i].className = ""; //Remove nowplaying from each thumb
      }

      currentThumb.className = nowPlaying; //this will also erase any other class belonging to the li
      //need to do a match looking for now playing
    }

    //if a video has finished, and the current index is the last video, and that thumb already has the nowplaying class
    if (
      event.data == YT.PlayerState.ENDED &&
      currentIndex == the_thumbs.length - 1 &&
      the_thumbs[currentIndex].className == nowPlaying
    ) {
      jQuery.event.trigger("playlistEnd"); //Trigger a global event
    }
  } //function onPlayerStateChange(event)

  //When the user changes the window size...
  window.addEventListener("resize", function(event) {
    yptThumbHeight(); //change the height of the thumblist
  });

  //When the user clicks an element with a playlist index...
  jQuery(document).on(
    "click",
    '[data-ypt-index]:not(".ypt-now-playing")',
    function(e) {
      //click on a thumb that is not currently playing
      ypt_index = Number(jQuery(this).attr("data-ypt-index")); //Get the ypt_index of the clicked item
      if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        //if IOS
        player.cuePlaylist({
          //cue is required for IOS 7
          listType: "playlist",
          list: playlistID,
          index: ypt_index,
          suggestedQuality: "hd720" //quality is required for cue to work, for now
          // https://code.google.com/p/gdata-issues/issues/detail?id=5411
        }); //player.cuePlaylist
      } else {
        //yay it's not IOS!
        player.playVideoAt(ypt_index); //Play the new video, does not work for IOS 7
      }
      jQuery(nowPlayingClass).removeClass(nowPlaying); //Remove "now playing" from the thumb that is no longer playing
      //When the new video starts playing, its thumb will get the now playing class
    }
  ); //jQuery(document).on('click','#ypt_thumbs...
};
