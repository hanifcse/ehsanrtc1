const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const all_messages = document.getElementById("all_messages");

const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",

  // when we run code in local server we must be port enable and when we deploy it must be disable below port
  // port: 3030,
});

let myVideoStream;
// audio and video input
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // another call to join others
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => [
        addVideoStream(video, userVideoStream),
      ]);
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

//joining room
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

// Make a call to the new user
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

// Add video streaming
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

// Take Message Input from user
let text = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});

// Display message from the server (Important)
socket.on("createMessage", (message) => {
  // console.log(message);
  $(".messages").append(`<li class='message'><b>user</b> <br/>${message}</li>`);

  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

// mute functionality added
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

// Stop video functionality added
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};


// Share Screen

const shareScreen = () => {
  const askFromBrowser = { "video": true };

  navigator.mediaDevices.getDisplayMedia(askFromBrowser)
    .then(function (FileStream) {
      let video = document.querySelector("video");
      video.srcObject = FileStream;
      video.play();



    })
    .catch(function (err) {
      alert("error");
    })
}


// Flip Screen

const flipScreen = () => {
  const video = document.querySelector('video');
  video.classList.toggle("mystyle");
}


// Chat Hidden

const chatShow = () => {
  const mainRight = document.querySelector('.main__right');
  const mainLeft = document.querySelector('.main__left');
  mainRight.classList.toggle("chatHidden");
  mainLeft.classList.toggle("flexChange");
}

// Video Recording

let constrainObj = {
  audio: true,
  video: true,
};
navigator.mediaDevices
  .getUserMedia(constrainObj)
  .then((recordStream) => {
    let mediaRecorder = new MediaRecorder(recordStream);
    let chunks = [];

    $("#record-video").on("click", (ev) => {
      // style
      $("#stop-record").toggleClass("stop-recording");
      $("#record-video").toggleClass("record-btn");

      mediaRecorder.start();
      console.log(mediaRecorder.state);
    });

    $("#stop-record").on("click", (ev) => {
      // style
      $("#stop-record").toggleClass("stop-recording");
      $("#record-video").toggleClass("record-btn");

      $("#recorded-video").toggleClass("recorded-modal");

      mediaRecorder.stop();
      console.log(mediaRecorder.state);
    });
    mediaRecorder.ondataavailable = function (ev) {
      chunks.push(ev.data);
    };

    // new code

    // download video if user closes tab or browser  
    window.addEventListener("beforeunload", function (ev) {
      mediaRecorder.stop();
      mediaRecorder.onstop = (ev) => {
        downloadRecordedVideo(ev);
      };
      // Show warning before closing the tab

      // ev.preventDefault();
      // ev.returnValue = "";
    });
    // 

    mediaRecorder.onstop = (ev) => {
      downloadRecordedVideo(ev);
    };

    const downloadRecordedVideo = (ev) => {
      let blob = new Blob(chunks, { type: "video/mp4;" });
      chunks = [];
      let videoURL = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = videoURL;
      a.download = "test.mp4";
      document.body.appendChild(a);
      a.click();
    };
  })
  .catch((error) => {
    console.log(error.name, error.message);
  });


// Participant count

socket.on("participant", (participants) => {
  console.log(participants);
  $("#participants").append(`<span>Participants : ${participants}</span>`);
})

