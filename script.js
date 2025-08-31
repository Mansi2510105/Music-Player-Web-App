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

    // Pad with leading zeros if needed
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
         
                            <img class="invert" src="music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Mansi</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="play.svg" alt="" srcset="">
                            </div>        
         </li>`

    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    })
    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        playBtn.src = "pause.svg";
    } else {
        playBtn.src = "play.svg"; // Ensure it's play icon on pause
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e.href)
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                                <circle cx="24" cy="24" r="24" fill="#1DB954" />
                                <path
                                    d="M18 16c0-.85.9-1.4 1.65-1l14 7.7a1.1 1.1 0 0 1 0 2L19.65 33c-.75.4-1.65-.15-1.65-1V16Z"
                                    fill="black" />
                            </svg>
                        </div>
                        <img class="images" src="/songs/${folder}/cover.jpg"
                            alt="" srcset="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the Playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
    console.log(anchors)
}

async function main() {

       const searchLink = document.getElementById('search-link');
    const searchBar = document.getElementById('search-bar');
    
    // Add a check to make sure the elements were found
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

    await getSongs("songs/cs")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            console.log("play")
            playBtn.src = "pause.svg"
        }
        else {
            currentSong.pause()
            playBtn.src = "play.svg"
        }
    })

    console.log("PrevBtn:", prevBtn);
    console.log("PlayBtn:", playBtn);
    console.log("NextBtn:", nextBtn);


    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an even listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //Add an event listener to previous and next
    prevBtn.addEventListener("click", () => {
        console.log("Previous clicked")
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0)
            playMusic(songs[index - 1])
    })

    nextBtn.addEventListener("click", () => {
        console.log("Next clicked")
        console.log(currentSong)

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length)
            playMusic(songs[index + 1])
    })
    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Load the Playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });


    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0.1;
        }
    })

}

main()
