// ***************************************************************************************
// * Part 2 code
// * Author(s)     : Wendell Santos, David Berlind
// * Contact       : editor@programmableweb.com
// * Copyright (c) : 2018 ProgrammableWeb.com
// * License       : MIT (open source). See full license text at the bottom of this source
// * Notes         : This is sample source code that goes with a tutorial that was published
// *                 on ProgrammableWeb.com to demonstrate usage of the YouTube Data API.
// *                 The code prints out the playlists assocatied with a specific YouTube
// *                 channel.
// * Tutorial URL  : TBA
// * All Tutorials : https://www.programmableweb.com/api-university/api-developer-training
// *
// ****************************************************************************************

var youTubeUserName = "wendells78"; // room for improvement: add a button that prompts for the YouTube Channel name
var apiKey = null;
var localChannelId = "UCqAPMBrOBk9mMwuJDoK4gAg";

var showPlayListButton = document.querySelector("#showPlayList"); // button begins workflow that retrieves playlist(s) user
var getAPIKeybutton = document.querySelector("#getAPIKey"); // button gets API key from end user
var displayAPIKeyButton = document.querySelector("#showKey"); // button displays the API key if it exists in local HTML5 storage
var clearAPIKeyButton = document.querySelector("#wipeKeyDisplay"); // button clears display of API key
var clearStorageButton = document.querySelector("#clearLocalStorage"); // button is for clearing API key stored in HTML5 storage
var clearPlaylistButton = document.querySelector("#clearList"); // button to clear the page of a pre-existng list

clearStorageButton.addEventListener("click", function() {
  localStorage.removeItem("storedApiKey"); // take API key out of local HTML5 storage
  $("#playListContainer").empty(); // clear the playlist (using jquery) since you probably should do that
  document.getElementById("div1").innerHTML = ""; // clear the API key (using good 'ole JS) if it's being displayed
});

clearPlaylistButton.addEventListener("click", function() {
  $("#div2").empty();
  $("#playListContainer").empty(); // use jquery to clear the playlist divs
});

displayAPIKeyButton.addEventListener("click", function() {
  if (localStorage.getItem("storedApiKey")) {
    // content in the HTML5 storage field for API key?
    document.getElementById("div1").innerHTML = localStorage.getItem(
      "storedApiKey"
    ); // true=display what's in HTML5 storage
  } else {
    document.getElementById("div1").innerHTML = "No API Key in Storage"; // false=different message
  }
});

clearAPIKeyButton.addEventListener("click", function() {
  document.getElementById("div1").innerHTML = ""; // set div that displays API key to blank.
});

// For the purposes of sharing this code publicly, we really don't want to hard-code an API key into the code
// So, what we do is we ask the user for their api key and then pass that along as a way to not have the API key shown in code
// The inspiration for this comes from the article at:
// https://www.programmableweb.com/news/how-to-hide-api-keys-when-building-web-apps-codepen/how-to/2017/08/14

getAPIKeybutton.addEventListener("click", function() {
  apiKey = prompt("Enter API Key:"); // get YouTube API Key from user
  if (apiKey) {
    // if the user entered something.
    document.getElementById("div1").innerHTML = ""; // if an API key was already displaying, clear it
    localStorage.setItem("storedApiKey", apiKey); // store locally in HTML5 storage
  }
});

showPlayListButton.addEventListener("click", function() {
  // double check local HTML5 storage for API key stored during previous run
  if (!localStorage.getItem("storedApiKey")) {
    // if undefined, prompt user for key and store in local storage
    localStorage.setItem("storedApiKey", prompt("Enter API Key:"));
  } // endif !apikey

  // Please read the workflow description at the bottom of this Javascript source file for details of the following workflow

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
        $.each(data.items, function(i, item) {
          // cycle through playlist
          videoTitle = item.snippet.title;
          output =
            "<li><a href='https://www.youtube.com/watch?v=" +
            item.snippet.resourceId.videoId +
            "' target='_newtab'>" +
            videoTitle +
            "</a></li>"; // craft HTML
          $("#playListContainer").append(output); // append crafted HTML to results list
        }); // end $.each
        $("#playListContainer").append("</ul><br />"); // finish painting of HTML unstructured list
      } // end callback function from /playlistItems resource API call
    ); // end API call to /playlistItems resource
  } // end getVids function
}); // end of getAPIkeyButton.addEventListener

// Workflow Description
//
// The above workflow goes through the following steps:
// 1. With the channel ID in hand (set as a global variable at the top of this code) make an API call (with that ID)
//    to the API's /playlists resource in order to get a list of playlist IDs associated with that channel. The
//    /playlists resource does not accept a YouTube username as a parameter which is why we are supplying the
//    channel ID in this step.
// 2. All that's needed to display the contents of a YouTube playlist is the playlist's unique ID. You don't
//    even need the YouTube username or channel ID. We just need the the playlist ID(s) which were gathered in
//    in step 1. For each of those playlist IDs, we make a second API call, this time to the /playlistItems
//    resource to get the first twenty items in that playlist.

// One thing we learned from this exercise is that YouTube's Data API does not return the full URI's for
// things like YouTube channels, playlists, and playlist items. It only returns the IDs of those items.
// If those URI's are needed (for example, to link some text like we do), the developer must learn how
// YouTube formats its URI's (there are different base URLs for channels, playlists, and playlist iiems
// and then construct those hyperlinks based on those formats and the IDs that are returned from the API
// calls. This is not only painful, but brittle. For example, what if YouTube changes any of its URL
// structures, your app will depend on the successful redirection of the old URL to continue working.
// Such directions introduce latency. :(

/* MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
