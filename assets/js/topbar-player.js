(function () {
  const playBtn = document.getElementById("yt-play");
  const pauseBtn = document.getElementById("yt-pause");
  const nextBtn = document.getElementById("yt-next");
  const nowPlaying = document.getElementById("yt-now");

  if (!playBtn || !pauseBtn || !nextBtn || !nowPlaying) {
    return;
  }

  const VIDEO_IDS = [
    "jfKfPfyJRdk",
    "5qap5aO4i9A",
    "DWcJFNfaw9c"
  ];

  function startFrom(seconds) {
    const value = Number(seconds);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  const START_AT = {
    1: startFrom(5)
  };

  let player;
  let lastStartedVideoId = null;

  function setNowPlayingText() {
    if (!player || typeof player.getVideoData !== "function") {
      return;
    }

    const videoData = player.getVideoData();
    const title = videoData && videoData.title ? videoData.title : "loading...";
    nowPlaying.textContent = `Now playing: ${title}`;
  }

  function getCurrentVideoId() {
    if (!player || typeof player.getVideoData !== "function") {
      return null;
    }

    const data = player.getVideoData();
    return data && data.video_id ? data.video_id : null;
  }

  function applyStartOffsetForCurrentVideo() {
    if (!player) {
      return;
    }

    const playlistIndex = player.getPlaylistIndex();
    const offset = START_AT[playlistIndex] || 0;
    const currentVideoId = getCurrentVideoId();

    if (!currentVideoId || currentVideoId === lastStartedVideoId) {
      return;
    }

    lastStartedVideoId = currentVideoId;

    if (offset > 0) {
      player.seekTo(offset, true);
    }
  }

  function wireControls() {
    playBtn.addEventListener("click", function () {
      player.playVideo();
      setNowPlayingText();
    });

    pauseBtn.addEventListener("click", function () {
      player.pauseVideo();
    });

    nextBtn.addEventListener("click", function () {
      player.nextVideo();
      setTimeout(function () {
        applyStartOffsetForCurrentVideo();
        setNowPlayingText();
      }, 250);
    });
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new window.YT.Player("yt-player", {
      height: "0",
      width: "0",
      videoId: VIDEO_IDS[0],
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        loop: 1,
        playlist: VIDEO_IDS.join(",")
      },
      events: {
        onReady: function () {
          player.cuePlaylist(VIDEO_IDS);
          wireControls();
          setNowPlayingText();
        },
        onStateChange: function (event) {
          if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.CUED) {
            applyStartOffsetForCurrentVideo();
          }

          if (event.data === window.YT.PlayerState.ENDED && player.getPlaylistIndex() === VIDEO_IDS.length - 1) {
            player.playVideoAt(0);
          }

          setNowPlayingText();
        }
      }
    });
  };
})();