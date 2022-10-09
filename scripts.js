const island = document.querySelector('.island');
const albumCover = document.querySelector('.album-cover');
const phone = document.querySelector('.phone');
const songInfo = document.querySelector('.song-info');
const islandBottom = document.querySelector('.island-bottom');

const songName = document.querySelector('.name');
const singerName = document.querySelector('.singer');
const songDuration = document.querySelector('.duration');
const songRemaining = document.querySelector('.remaining');

const albumCoverImg = document.querySelector('[data-cover]');
const progressBarCurrent = document.querySelector('.progress-bar-current');

albumCover.addEventListener('click', (e) => {
  if (island.classList.contains('island-closed')) {
    island.classList.replace('island-closed', 'island-open');
    albumCover.classList.replace('album-closed', 'album-open');
    songInfo.classList.replace('hide', 'show');
    islandBottom.classList.replace('hide', 'show');
  } else {
    island.classList.replace('island-open', 'island-closed');
    albumCover.classList.replace('album-open', 'album-closed');
    songInfo.classList.replace('show', 'hide');
    islandBottom.classList.replace('show', 'hide');
  }
});

phone.addEventListener('click', (e) => {
  if (e.target.classList[0] === 'phone') {
    island.classList.replace('island-open', 'island-closed');
    albumCover.classList.replace('album-open', 'album-closed');
    songInfo.classList.replace('show', 'hide');
    islandBottom.classList.replace('show', 'hide');
  }
});

// websockets and spotify connect
let durationTimer, remainingTimer, currentProgress, progressBarProgress;

const ws = new WebSocket('ws://localhost:4000');
ws.onmessage = (message) => {
  const data = JSON.parse(message.data);

  // clear intervals to start new ones
  clearInterval(durationTimer);
  clearInterval(remainingTimer);
  clearInterval(progressBarProgress);

  if (data.payloads) {
    if (data.payloads[0].events[0].event.state && data.payloads[0].events[0].event.state.is_playing) {
      calculateProgressBar(data.payloads[0].events[0].event.state.item.duration_ms);
      currentProgress = data.payloads[0].events[0].event.state.progress_ms;
      durationTimer = setInterval(() => {
        currentProgress += 1000;
        songDuration.textContent = millisToMinutesAndSeconds(currentProgress);
      }, 1000);
      remainingTimer = setInterval(() => {
        songRemaining.textContent = millisToMinutesAndSeconds(data.payloads[0].events[0].event.state.item.duration_ms - currentProgress);
      }, 1000);
    }
    console.log(data);
    songName.textContent = data.payloads[0].events[0].event.state.item.name;
    singerName.textContent = data.payloads[0].events[0].event.state.item.artists[0].name;
    albumCoverImg.src = data.payloads[0].events[0].event.state.item.album.images[0].url;
  }
};
ws.onclose = () => {
  console.log('closed a connection...');
}

fetch('http://localhost:4000/v1/spotify');

function calculateProgressBar(duration) {
  progressBarProgress = setInterval(() => {
    progressBarCurrent.style.width = `${((currentProgress * 100) / duration)}%`;
  }, 1000);
}

function millisToMinutesAndSeconds(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
