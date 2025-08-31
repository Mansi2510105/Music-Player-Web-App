let songs;
let currentSong = new Audio();
let currFolder;
let playBtn, prevBtn, nextBtn;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/info.json`);
    let response = await a.json();
    songs = response.songs;

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li data-filename="${song.file}">
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.title}</div>
                    <div>${song.artist || 'Mansi'}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

const playMusic = (songObject, pause = false) => {
    currentSong.src = `/${currFolder}/` + songObject.file;

    if (!pause) {
        currentSong.play();
        playBtn.src = "img/pause.svg";
    } else {
        currentSong.pause();
        playBtn.src = "img/play.svg";
    }

    document.querySelector(".songinfo").innerHTML = songObject.title;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/songs/info.json`);
    let response = await a.json();
    let cardContainer = document.querySelector(".cardContainer");

    for (const playlist of response.playlists) {
        let folder = playlist.path;
        let title = playlist.title || playlist.name;
        let description = playlist.description || "Listen to your favorite songs here.";

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                        <circle cx="24" cy="24" r="24" fill="#1DB954" />
                        <path
                            d="M18 16c0-.85.9-1.4 1.65-1l14 7.7a1.1 1.1 0 0 1 0 2L19.65 33c-.75.4-1.65-.15-1.65-1V16Z"
                            fill="black" />
                    </svg>
                </div>
                <img class="images" src="/songs/${folder}/cover.jpg" alt="">
                <h2>${title}</h2>
                <p>${description}</p>
            </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs && songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    const searchLink = document.getElementById('search-link');
    const searchBar = document.getElementById('search-bar');

    if (searchLink && searchBar) {
        searchLink.addEventListener('click', (e) => {
            e.preventDefault();
            searchBar.classList.toggle('visible');
        });
    } else {
        console.error("Could not find search-link or search-bar elements.");
    }

    playBtn = document.getElementById("playBtn");
    prevBtn = document.getElementById("prevBtn");
    nextBtn = document.getElementById("nextBtn");

    await getSongs("songs/CS");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }

    displayAlbums();

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    prevBtn.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let decodedFile = decodeURI(currentFile);
        let index = songs.findIndex(song => song.file.trim().toLowerCase() === decodedFile.trim().toLowerCase());

        console.log("PrevBtn Clicked");
        console.log("Current URL Filename:", currentFile);
        console.log("Decoded Filename:", decodedFile);
        console.log("Found Index:", index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("Already at the first song.");
        }
    });

    nextBtn.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let decodedFile = decodeURI(currentFile);
        let index = songs.findIndex(song => song.file.trim().toLowerCase() === decodedFile.trim().toLowerCase());

        console.log("NextBtn Clicked");
        console.log("Current URL Filename:", currentFile);
        console.log("Decoded Filename:", decodedFile);
        console.log("Found Index:", index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            console.log("Already at the last song.");
        }
    });
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0.1;
        }
    });
}

main()