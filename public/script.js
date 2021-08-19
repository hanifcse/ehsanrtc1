const socket = io("/");
// const socket = io({transports: ['websocket'], upgrade: false});

const videoGrid = document.getElementById("video-grid");

const all_messages = document.getElementById("all_messages");

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",

  // when we run code in local server we must be port enable and when we deploy it must be disable below port
  port: 3030,
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
    console.log("My EhsanRTC video Stream is :", myVideoStream);
    addVideoStream(myVideo, stream);

    // new code for disconnecting participant
    // peer.on('call', call => {
    //   call.answer(stream)
    //   const video = document.createElement('video')
    //   call.on('stream', userVideoStream => {
    //     addVideoStream(video, userVideoStream)
    //   })
    // })

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
      console.log(userId);
    });

  })

  .catch(error => {
    console.log("Error Occurred: ", error);
  });

socket.on('user-disconnected', userId => {
  console.log("UID: ", userId);
  if (peers[userId]) {
    peers[userId].close()
  }
})
//joining room
peer.on("open", (id) => {
  console.log("Check", id);
  socket.emit("join-room", ROOM_ID, id);
});

// Make a call to the new user
const connectToNewUser = (userId, stream) => {
  console.log(userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
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
let text = $("#chat_message");
// var person = prompt("Please enter your name:", "");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }


  console.log(person);
  socket.emit("userName", person);
});

// Test code for user start *******************

// var person = prompt("Please enter your name:", "");
// console.log(person);
// socket.emit("userID", person);


socket.on("userName", (name) => {
  console.log(name);
})

// Test code for user end ********************

// Display message from the server (Important)
// var person = prompt("Please enter your name:", "");
socket.on("createMessage", (message) => {
  // console.log(message);
  // console.log(person);
  $(".messages").append(`<li class='message'><b>User</b> <br/>${message}</li>`);
  // $(".messages").append(`<li class='message'><b>${person}</b> <br/>${message}</li>`);

  scrollToBottom();
});


// Test code for showing message in the UI

// socket.on("message", function (msg1) {
//   document.write(msg1);
// })

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

// mute functionality added
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  console.log(queryString);

  // const muted = myVideoStream.getAudioTracks()[0].enabled;

  if (enabled && !queryString) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
  if (queryString) {
    PermissionCameraMic(0);
  }
};




const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
  // document.querySelector(".main__mute_button").prop('muted','true');
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
  if (enabled && !queryString) {
    console.log("t1", enabled);
    console.log("t2", !queryString);
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    console.log(enabled);
    console.log(!queryString);
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
  if (queryString) {
    PermissionCameraMic(1);
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



// Disconnecting participant

console.log(socket);
console.log(socket.connected);
console.log(socket.disconnected);
console.log(socket?.id);
console.log("socket ID of Participant", socket.id);
function disconnectParticipant(socket) {
  console.log("I am clicked!");
  // console.log(socket);
  // console.log(io?.sockets);
  // location.href='/';

  // socket.on('kick', function (client) {
  //   if (typeof io.sockets.sockets[client] != 'undefined') {
  //     socket.emit('message', { text: nickNames[socket.id] + ' kicked: ' + nickNames[client] });
  //     io.sockets.sockets[client].disconnect();
  //   } else {
  //     socket.emit('message', { text: 'User: ' + name + ' does not exist.' });
  //   }
  // });


  // new

  // console.log(io.sockets);
  // if (io?.sockets?.sockets[socket.id]) {
  //   io.sockets.sockets[socket.id].disconnect();
  //   console.log("Disconnected successfully!")
  // }

}

//  socket.on('kick', function (client) {
//     if (typeof io.sockets.sockets[client] != 'undefined') {
//       socket.emit('message', { text: nickNames[socket.id] + ' kicked: ' + nickNames[client] });
//       io.sockets.sockets[client].disconnect();
//     } else {
//       socket.emit('message', { text: 'User: ' + name + ' does not exist.' });
//     }
//   });


// console.log(io.sockets);
// if (io.sockets.sockets[socket.id]) {
//   io.sockets.sockets[socket.id].disconnect();
//   console.log("Disconnected successfully!")
// }



// New code 26.07.2021


$("#disconnectPeople").click(function () {
  location.href = '/';
  // alert("Hello");
})


// socket.on('user-disconnected', userId => {
//   if (peers[userId]) peers[userId].close()
// })



// New code s

// When the user clicks on div, open the popup
const passwordGenerator = password_generator();
function clickToPopUp() {
  let popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
  document.getElementById(
    "myInput"
  ).value = `http://localhost:3030/${ROOM_ID}?pass=${passwordGenerator}`; //set value on myInputID
}
// click to copy Function
function clickToCopy() {
  var copyText = document.getElementById("myInput");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  // alert("Copied the text: " + copyText.value);
}

// modal
// Get the modal
const modal = document.getElementById("myModal");

// Get the button that opens the modal
const btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
$("#addRoomID").html(
  `Room ID: ${ROOM_ID} </br> Password: ${passwordGenerator} 
  </br>
  Local Link: http://localhost:3030/${ROOM_ID}?pass=${passwordGenerator}
  Live Link: https://ehsan-rtc.herokuapp.com/${ROOM_ID}?pass=${passwordGenerator}
  
  `
);

// Random Password generation
function password_generator(len) {
  var length = len ? len : 10;
  var string = "abcdefghijklmnopqrstuvwxyz";
  var numeric = "0123456789";
  var punctuation = "!@$%&*()+~}{[]:;?></";
  var password = "";
  var character = "";
  var crunch = true;
  while (password.length < length) {
    entity1 = Math.ceil(string.length * Math.random() * Math.random());
    entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    hold = string.charAt(entity1);
    hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
  return password.substr(0, len);
}


// 

console.log("Whole Link:", window.location.href);
// console.log("Search Param:", window.location.search);
console.log("Location search: ", window.location.search);
const queryString = window.location.search;
console.log(queryString);
if (queryString) {
  console.log("User Field: I am a User");
  document.getElementById("disconnectPeople").hidden = true;
  // document.getElementById("hideMute").hidden = true;
}
else {
  console.log("Admin Field: I am an Admin");
  // document.getElementById("disconnectPeople").hidden = true;
}
const meetPassword = queryString.split("=");
console.log(meetPassword[1]);

// To detect admin or user in the UI
if (queryString) {
  document.getElementById("admin-field").hidden = true;
  document.getElementById("user-field").hidden = false;
}
else {
  document.getElementById("admin-field").hidden = false;
  document.getElementById("user-field").hidden = true;
}



// New test code about participant***************************

// window.onload =  function(){
//   let text = "";

//   // let person = prompt("Please enter your name:", "Harry Potter");
//   let person = prompt("Please enter your name:", "");
//   if (person == null || person == "") {
//     // text = "User cancelled the prompt.";
//     text = "";
//   } else {
//     // text = "Hello " + person + "! How are you today?";
//     text += person;
//   }
//   document.getElementById("demo").innerHTML = text;
// }

// new 
// window.onload = function () {
//   // let participants = [];

//   // let person = prompt("Please enter your name:", "Harry Potter");
//   let person = prompt("Please enter your name:", "");
//   if (person == null || person == "") {
//     // text = "User cancelled the prompt.";
//     // participants = [];
//   } else {
//     // text = "Hello " + person + "! How are you today?";
//     // text += person;
//     console.log(person);
//     function1(person);
//     // participants.push(person);
//   }
//   // console.log("Participant List: ", participants);

//   // document.getElementById("demo").innerHTML = participants;

//   // function1(person);
// }


// function function1(pa) {
//   var ul = document.getElementById("demo");
//   var participantList = document.createElement("li");
//   participantList.appendChild(document.createTextNode(pa));
//   ul.appendChild(participantList);
// }




// window.onload = function() {
//   yourFunction(param1, param2);
// };

// End test code about participant ******************************

// This line of code may be placed inner of testMute() start
socket.on("mutetest", (msg3) => {
  console.log(msg3);
  console.log("UID is : ", msg3.uid);
  console.log("RoomID : ", msg3.rid);
})
// end

// Mute Participant

// const testMute = () => {
//   console.log(queryString);
//   if (!queryString) {
//     const enabled = myVideoStream.getAudioTracks()[0].enabled;
//     console.log("test case");

//     if (enabled) {
//       myVideoStream.getAudioTracks()[0].enabled = false;
//       setUnmuteButton();

//     } else {
//       setMuteButton();
//       myVideoStream.getAudioTracks()[0].enabled = true;
//     }

//   }
//   else{
//     console.log("You are not access this functionality!!");
//     document.getElementById('hideMute').hidden = true;
//   }

// };

const PermissionCameraMic = (check) => {
  let timerInterval
  Swal.fire({
    icon: 'error',
    
    title: check? 'Camera Off permission restricted' : 'Microphone mute permission restricted',


  // html: 'I will close in <b></b> milliseconds.',
  timer: 2000,
    timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading()
        const b = Swal.getHtmlContainer().querySelector('b')
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft()
        }, 100)
      },
        willClose: () => {
          clearInterval(timerInterval)
        }
}).then((result) => {
  /* Read more about handling dismissals below */
  if (result.dismiss === Swal.DismissReason.timer) {
    console.log('I was closed by the timer')
  }
})
}