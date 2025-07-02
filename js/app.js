// JavaScript functionality for the music player

document.addEventListener('DOMContentLoaded', function() {
  // Select DOM elements
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const volumeControl = document.getElementById('volume-control');
  const progressBar = document.getElementById('progress-bar');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const repeatBtn = document.getElementById('repeat-btn');
  const themeBtn = document.getElementById('theme-btn');
  const canvas = document.getElementById('visualizer');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const downloadBtn = document.getElementById('download-btn');
  const speedControl = document.getElementById('speed-control');
  const miniPlayerBtn = document.getElementById('mini-player-btn');
  const shareBtn = document.getElementById('share-btn');
  const notifyBtn = document.getElementById('notify-btn');
  const playlistEl = document.getElementById('playlist');
  const showFavoritesBtn = document.getElementById('show-favorites-btn');

  let isShuffle = false;
  let isRepeat = false;
  let audioCtx, analyser, source, dataArray, animationId;
  let songs = [];
  let currentSongIndex = 0;
  const queue = [];

  // Shuffle button toggle
  shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtn.style.background = isShuffle ? '#1ed760' : '#1db954';
  });

  // Repeat button toggle
  repeatBtn.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtn.style.background = isRepeat ? '#1ed760' : '#1db954';
  });

  // Add to queue function
  function addToQueue(index) {
      queue.push(index);
      alert('Song added to queue!');
  }

  // Play next song logic
  audio.addEventListener('ended', () => {
      if (isRepeat) {
          audio.currentTime = 0;
          audio.play();
      } else if (queue.length > 0) {
          const nextIndex = queue.shift();
          loadSong(nextIndex);
          audio.play();
      } else if (isShuffle) {
          let nextIndex;
          do {
              nextIndex = Math.floor(Math.random() * songs.length);
          } while (nextIndex === currentSongIndex && songs.length > 1);
          loadSong(nextIndex);
          audio.play();
      } else {
          let nextIndex = (currentSongIndex + 1) % songs.length;
          loadSong(nextIndex);
          audio.play();
      }
  });

  // Sample playlist
  const savedSongs = localStorage.getItem('musicPlayerSongs');
  if (savedSongs) {
      songs = JSON.parse(savedSongs);
  } else {
      songs = [
          {
              title: "Kina Chir",
              artist: "The PropheC",
              album: "Single",
              src: "audio/kinachir.mp3", // Make sure you have this audio file
              art: "img/kinachir.jpg"
          }
      ];
  }

  // Populate playlist UI
  let showFavoritesOnly = false;

  showFavoritesBtn.addEventListener('click', () => {
      showFavoritesOnly = !showFavoritesOnly;
      showFavoritesBtn.textContent = showFavoritesOnly ? 'Show All' : 'Show Favorites';
      renderPlaylist();
  });

  // Render playlist function
  function renderPlaylist() {
      playlistEl.innerHTML = '';
      songs.forEach((song, idx) => {
          const li = document.createElement('li');
          li.textContent = `${song.title} - ${song.artist}`;
          li.classList.toggle('active', idx === currentSongIndex);
          li.addEventListener('click', () => {
              loadSong(idx);
              audio.play().catch(err => {
                  alert('Audio cannot be played. Please check the file or browser settings.');
                  console.error('Play failed:', err);
              });
          });
          playlistEl.appendChild(li);
      });
  }

  // Update playlist UI to highlight current song
  function updatePlaylistUI() {
      const items = playlistEl.querySelectorAll('li');
      items.forEach((li, idx) => {
          li.classList.toggle('active', idx === currentSongIndex);
      });
  }

  // Only ONE loadSong function
  function loadSong(index) {
      currentSongIndex = index;
      const song = songs[index];
      document.getElementById('song-title').textContent = `Title: ${song.title}`;
      document.getElementById('song-artist').textContent = `Artist: ${song.artist}`;
      document.getElementById('song-album').textContent = `Album: ${song.album}`;
      audio.src = song.src;
      audio.load();
  }

  // Show notification for the currently playing song
  function showNotification(song) {
      if (Notification.permission === "granted") {
          new Notification(`Now Playing: ${song.title}`, {
              body: `${song.artist} - ${song.album}`,
              icon: song.art || ''
          });
      }
  }
  if (Notification.permission !== "granted") {
      Notification.requestPermission();
  }

  // Play song function
  playBtn.addEventListener('click', () => {
      if (audio.src) {
          audio.play().catch(err => {
              alert('Audio cannot be played. Please check the file or browser settings.');
              console.error('Play failed:', err);
          });
      } else {
          alert('No audio file loaded.');
      }
  });

  // Pause song function
  pauseBtn.addEventListener('click', () => {
      audio.pause();
  });

  // Volume control function
  volumeControl.addEventListener('input', () => {
      audio.volume = volumeControl.value;
  });

  // Update progress bar as audio plays
  audio.addEventListener('timeupdate', () => {
      progressBar.max = Math.floor(audio.duration);
      progressBar.value = Math.floor(audio.currentTime);
  });

  // Seek audio when progress bar is changed
  progressBar.addEventListener('input', () => {
      audio.currentTime = progressBar.value;
  });

  // Next song
  nextBtn.addEventListener('click', () => {
      let nextIndex = (currentSongIndex + 1) % songs.length;
      loadSong(nextIndex);
  });

  // Previous song
  prevBtn.addEventListener('click', () => {
      let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      loadSong(prevIndex);
  });

  // Add Song functionality
  document.getElementById('add-song-btn').addEventListener('click', () => {
      const title = document.getElementById('new-title').value.trim();
      const artist = document.getElementById('new-artist').value.trim();
      const album = document.getElementById('new-album').value.trim();
      const fileInput = document.getElementById('new-file');
      const file = fileInput.files[0];

      if (title && artist && album && file) {
          const src = URL.createObjectURL(file);
          const newSong = { title, artist, album, src };
          songs.push(newSong);
          renderPlaylist();
          loadSong(songs.length - 1); 
          document.getElementById('new-title').value = '';
          document.getElementById('new-artist').value = '';
          document.getElementById('new-album').value = '';
          fileInput.value = '';
      } else {
          alert('Please fill all fields and select an audio file!');
      }
  });

  // Theme toggle button
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      themeBtn.textContent = document.body.classList.contains('light-theme')
        ? 'Switch to Dark Theme'
        : 'Switch to Light Theme';
    });
  }

  // Mini player toggle button
  miniPlayerBtn.addEventListener('click', () => {
      document.body.classList.toggle('mini-player');
      miniPlayerBtn.textContent = document.body.classList.contains('mini-player')
          ? 'Full Player'
          : 'Mini Player';
  });

  // Save playlist to local storage
  function savePlaylist() {
      localStorage.setItem('musicPlayerSongs', JSON.stringify(songs));
  }

  // Initial load
  renderPlaylist();
  if (songs.length > 0) loadSong(currentSongIndex);

  // Play song when user clicks on playlist item
  playlistEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
          const idx = Array.from(playlistEl.children).indexOf(e.target);
          loadSong(idx);
          audio.play(); // This is allowed because it's a user action
      }
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
      // Ignore if typing in an input, textarea, or select
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      switch (e.code) {
          case 'Space':
              e.preventDefault();
              if (audio.paused) {
                  audio.play();
              } else {
                  audio.pause();
              }
              break;
          case 'ArrowRight':
              // Next song
              let nextIndex = (currentSongIndex + 1) % songs.length;
              loadSong(nextIndex);
              audio.play();
              break;
          case 'ArrowLeft':
              // Previous song
              let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
              loadSong(prevIndex);
              audio.play();
              break;
          case 'ArrowUp':
              // Volume up
              audio.volume = Math.min(audio.volume + 0.1, 1);
              volumeControl.value = audio.volume;
              break;
          case 'ArrowDown':
              // Volume down
              audio.volume = Math.max(audio.volume - 0.1, 0);
              volumeControl.value = audio.volume;
              break;
      }
  });

  // Visualizer setup
  function setupVisualizer() {
      if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          source = audioCtx.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          analyser.fftSize = 256;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
  }

  function drawVisualizer() {
      if (!analyser) return;
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1db954';
      ctx.beginPath();
      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      animationId = requestAnimationFrame(drawVisualizer);
  }

  audio.addEventListener('play', () => {
      setupVisualizer();
      audioCtx.resume();
      drawVisualizer();
  });

  audio.addEventListener('pause', () => {
      cancelAnimationFrame(animationId);
  });

  audio.addEventListener('ended', () => {
      cancelAnimationFrame(animationId);
  });

  downloadBtn.addEventListener('click', () => {
      if (songs.length === 0) return;
      const song = songs[currentSongIndex];
      const link = document.createElement('a');
      link.href = song.src;
      link.download = `${song.title} - ${song.artist}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  });

  // Playback speed control
  speedControl.addEventListener('change', () => {
      audio.playbackRate = parseFloat(speedControl.value);
  });

  // Share button functionality
  shareBtn.addEventListener('click', () => {
      if (songs.length === 0) return;
      const song = songs[currentSongIndex];
      const shareText = `Check out this song: ${song.title} by ${song.artist}`;
      if (navigator.clipboard) {
          navigator.clipboard.writeText(shareText);
          alert('Song info copied to clipboard!');
      } else {
          alert(shareText);
      }
  });

  // Notification button
  notifyBtn.addEventListener('click', () => {
      Notification.requestPermission();
  });

  const addSongBtn = document.getElementById('add-song-btn');
  if (addSongBtn) {
    addSongBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Your add song logic here
      alert('Add Song button clicked!');
    });
  }

  const form = document.getElementById('add-song-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Add song logic here
    });
  }

  const deleteSongBtn = document.getElementById('delete-song-btn');
  if (deleteSongBtn) {
    deleteSongBtn.addEventListener('click', () => {
      // Remove the current song from the songs array
      if (songs.length > 0) {
        songs.splice(currentSongIndex, 1);
        // If there are still songs left, play the next one
        if (songs.length > 0) {
          currentSongIndex = currentSongIndex % songs.length;
          loadSong(currentSongIndex);
          audio.pause();
        } else {
          // If no songs left, clear the player
          audio.pause();
          document.getElementById('song-title').textContent = 'Title';
          document.getElementById('song-artist').textContent = 'Artist';
          document.getElementById('song-album').textContent = 'Album';
          audio.src = '';
        }
        // Optionally update the playlist UI here
      }
    });
  }
});