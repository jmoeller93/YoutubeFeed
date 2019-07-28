const apiKey = 'AIzaSyArQNfmJDkjxP_ZyZIocbyuDeyTanf4Rl8';
const channelId = 'UCQepnZmhCT9Boc2jbv7ehug';
const defaultPlaylistId = 'PLQ7uuVY6M9ifxSX9_vAqIPHAhCYqi4duv';
const youTubeUserName = 'RaiffeisenKassel';

const initializeYoutube = () => {
  // Load Youtube IFrame Player API code asynchronously. This boat is going nowhere without it.
  var tag = document.createElement('script'); //Add a script tag
  tag.src = 'https://www.youtube.com/iframe_api'; //Set the SRC to get the API
  var firstScriptTag = document.getElementsByTagName('script')[0]; //Find the first script tag in the html
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); //Put this script tag before the first one
};

var ypt_player = document.getElementById('player');
var ypt_thumbs = document.getElementById('playlistContainer');

let player = null;

const cueOnPlayer = (playlistId, index) =>
  player &&
  player.cuePlaylist({
    listType: 'playlist',
    list: playlistId,
    index,
    suggestedQuality: 'hd720'
  });

const playOnPlayer = index => player && player.playVideoAt(index);

window.onYouTubeIframeAPIReady = function() {
  var nowPlaying = 'ypt-now-playing'; //For marking the current thumb
  var nowPlayingClass = '.' + nowPlaying;
  var ypt_index = 0; //Playlists begin at the first video by default

  player = new YT.Player('player', {
    height: '360',
    width: '640',
    playerVars: {
      listType: 'playlist',
      list: defaultPlaylistId,
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
    var the_thumbs = ypt_thumbs.getElementsByTagName('li');
    var currentThumb = the_thumbs[currentIndex];

    if (event.data == YT.PlayerState.PLAYING) {
      //A video is playing

      for (var i = 0; i < the_thumbs.length; i++) {
        //Loop through the thumbs
        the_thumbs[i].className = ''; //Remove nowplaying from each thumb
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
      jQuery.event.trigger('playlistEnd'); //Trigger a global event
    }
  } //function onPlayerStateChange(event)

  //When the user changes the window size...
  window.addEventListener('resize', function(event) {
    yptThumbHeight(); //change the height of the thumblist
  });

  //When the user clicks an element with a playlist index...
  jQuery(document).on(
    'click',
    '[data-ypt-index]:not(".ypt-now-playing")',
    function(e) {
      //click on a thumb that is not currently playing
      ypt_index = Number(jQuery(this).attr('data-ypt-index')); //Get the ypt_index of the clicked item
      if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        //if IOS
        player.cuePlaylist({
          //cue is required for IOS 7
          listType: 'playlist',
          list: playlistID,
          index: ypt_index,
          suggestedQuality: 'hd720' //quality is required for cue to work, for now
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

const yptThumbHeight = () => {
  ypt_thumbs.style.height =
    document.getElementById('player').clientHeight + 'px'; //change the height of the thumb list
  //breaks if ypt_player.clientHeight + 'px';
};

const onPlayerReady = event => {
  //Once the player is ready...
  yptThumbHeight(); //Set the thumb containter height
};

const renderPlaylists = playlists => {
  const playlistsTemplate = $('#playlists').html();
  const rendered = Mustache.render(playlistsTemplate, { playlists });
  $('#playlistsContainer').html(rendered);

  $('.youtube-playlist').click(e => {
    const playlistId = e.currentTarget.dataset.youtubePlaylistId;
    getPlaylistVideos(playlistId).then(renderVideoList);
    cueOnPlayer(playlistId, 0);
  });
};

const getPlaylists = channelId => {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50&channelId=${channelId}&key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(json => json.items);
};

const renderVideoList = videos => {
  const playlistTemplate = $('#playlist').html();
  const rendered = Mustache.render(playlistTemplate, { videos });
  $('#playlistContainer').html(rendered);

  $('.youtube-video').click(e => {
    const videoIndex = e.currentTarget.dataset.youtubeVideoIndex;
    playOnPlayer(videoIndex);
  });
};

const getPlaylistVideos = playlistId => {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(
      json => json.items.filter(item => item.snippet.thumbnails) // entferne alle items ohne thumbnail
    );
};

const main = () => {
  initializeYoutube();

  getPlaylists(channelId).then(playlists => {
    renderPlaylists(playlists);

    const playlistId = playlists[0].id;
    getPlaylistVideos(playlistId).then(renderVideoList);
  });
};

main();
