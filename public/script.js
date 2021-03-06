const socket = io("/");
// const socket = io({transports: ['websocket'], upgrade: false});

const videoGrid = document.getElementById("video-grid");

const all_messages = document.getElementById("all_messages");

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};
{/* <link rel="stylesheet" href="/public/style.css" /> */ }

// new peer added
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
      setTimeout(() => {
        connectToNewUser(userId, stream);
        console.log(userId);
      }, 1000);

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
  console.log(linkLength);

  // const muted = myVideoStream.getAudioTracks()[0].enabled;

  // In case of admin linkLength is 2 and in case of user linkLength is more than 2 (3 in case)
  if (enabled && linkLength == 2) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
  if (linkLength > 2) {
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

// In case of admin linkLength is 2 and in case of user linkLength is more than 2 (3 in case)
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled && linkLength == 2) {
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
  if (linkLength > 2) {
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
  ).value = `http://localhost:3030/${ROOM_ID}?time=${queryTime}?pass=${passwordGenerator}`; //set value on myInputID
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
const linkLength = queryString.split("?").length;
console.log(linkLength);  // if admin length is 2 and if user length is more than 2
// http://localhost:3030/6JE2E414OD?time=5
// http://localhost:3030/6JE2E414OD?time=5?pass=d1%$q]Z@75C8

const splitQuery = queryString.split("?");
const splitQueryAgain = splitQuery[1].split("=");
const queryTime = splitQueryAgain[1];
console.log(queryTime);
// orginal time
const totalTime = queryTime * 60 * 1000;
console.log(totalTime);
if (queryString && linkLength > 2) {
  console.log("User Field: I am a User");
  document.getElementById("disconnectPeople").hidden = true;
  // document.getElementById("hideMute").hidden = true;
}
else {
  console.log("Admin Field: I am an Admin");
  // document.getElementById("disconnectPeople").hidden = true;
}

// problem********************************************
const meetPassword = queryString.split("=");
console.log(meetPassword[1]);
// ***********************************************************

// To detect admin or user in the UI
if (queryString && linkLength > 2) {
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

    title: check ? 'Camera Off permission restricted' : 'Microphone mute permission restricted',


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

// leave meeting
const leaveMeeting = () => {
  location.href = '/';
}

const leaveMeeting1 = () => {
  setTimeout(() => {
    // important **************
    // location.href = '/'
    // alert("Final check")

    // new code
    socket.emit('dis', '1')
    socket.on('user-dis', userId => {
      // alert("test dis")
      console.log("UID: ", userId);
      if (peers[userId]) {
        peers[userId].close()
      }
    })

  }, totalTime)
}

leaveMeeting1();

// const tc = 0;

// if(tc == 5){
//   leaveMeeting();
// }

// $(function() {
//   var e = $.Event('keypress');
//   e.which = 65; // Character 'A'
//   $('item').trigger(e);
//   console.log(e);
// });

// const log = document.getElementById('log');

// document.addEventListener('keypress', logKey);

// function logKey(e) {
//   log.textContent += ` ${e.code}`;
// }

// function myKeyPress(e){
//   var keynum;

//   if(window.event) { // IE                  
//     keynum = e.keyCode;
//   } else if(e.which){ // Netscape/Firefox/Opera                 
//     keynum = e.which;
//   }

//   console.log(String.fromCharCode(keynum));
//   if(String.fromCharCode(keynum) === 'w'){
//     leaveMeeting();
//   }
// }

// $("input").keypress(function(event){
//   alert(String.fromCharCode(event.which)); 
// });
// leaveMeeting();




// Remaining time show(important)

// function getTimeRemaining(endtime) {
//   console.log(endtime);
//   const total = Date.parse(endtime) - Date.parse(new Date());
//   console.log(total);
//   const seconds = Math.floor((total / 1000) % 60);
//   const minutes = Math.floor((total / 1000 / 60) % 60);
//   const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
//   const days = Math.floor(total / (1000 * 60 * 60 * 24));

//   return {
//     total,
//     days,
//     hours,
//     minutes,
//     seconds
//   };
// }

// function initializeClock(id, endtime) {
//   const clock = document.getElementById(id);
//   const daysSpan = clock.querySelector('.days');
//   const hoursSpan = clock.querySelector('.hours');
//   const minutesSpan = clock.querySelector('.minutes');
//   const secondsSpan = clock.querySelector('.seconds');

//   function updateClock() {
//     const t = getTimeRemaining(endtime);

//     daysSpan.innerHTML = t.days;
//     hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
//     minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
//     secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

//     if (t.total <= 0) {
//       clearInterval(timeinterval);
//     }
//   }

//   updateClock();
//   const timeinterval = setInterval(updateClock, 1000);
// }

// const deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
// initializeClock('clockdiv', deadline);


// Remaining time final code start

function getTimeRemaining(endtime) {
  console.log(endtime);
  const total = Date.parse(endtime) - Date.parse(new Date());
  console.log(total);
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

function initializeClock(id, endtime) {
  const clock = document.getElementById(id);
  // const daysSpan = clock.querySelector('.days');
  const hoursSpan = clock.querySelector('.hours');
  const minutesSpan = clock.querySelector('.minutes');
  const secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    const t = getTimeRemaining(endtime);

    // daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2) + ' h';
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2) + ' m';
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2) + ' s';

    if (t.total <= 0) {
      clearInterval(timeinterval);
      document.getElementById('clockdiv').hidden = true;
      document.getElementById('timeCount').hidden = true;
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

// Time given day, hour, minute, second * 1000(to convert total millisecond to second)
// const deadline = new Date(Date.parse(new Date()) + 1 * 1 * 60 * 60 * 1000);
const deadline = new Date(Date.parse(new Date()) + totalTime);
initializeClock('clockdiv', deadline);

// Remaining time end


// Total time count start
var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var hoursLabel = document.getElementById("hours");
var totalSeconds = 0;
setInterval(setTime, 1000);


function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60) + ' s';
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60)) + ' m';
  hoursLabel.innerHTML = pad(parseInt(totalSeconds / 60 / 60)) + ' h';
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}
// Total time count end




// new code
// function myKeyPress(e){
//   var keynum;

//   if(window.event) { // IE                  
//     keynum = e.keyCode;
//   } else if(e.which){ // Netscape/Firefox/Opera                 
//     keynum = e.which;
//   }

//   console.log(String.fromCharCode(keynum));
//   if(String.fromCharCode(keynum) === 'w'){
//     // const deadline = new Date(Date.parse(new Date()) + 1 * 1 * 1 * 20 * 1000); 
//     leaveMeeting();
//     initializeClock('clockdiv', deadline);
//   }
// }
// initializeClock('clockdiv', deadline);

// Remaining time show(important) end



// sweetalert

// let timerInterval;
// Swal.fire({
//   title: 'Auto close alert!',
//   html: 'I will close in <b></b> milliseconds.',
//   timer: 10000,
//   timerProgressBar: true,
//   allowOutsideClick: false,
//   didOpen: () => {
//     Swal.showLoading()
//     const b = Swal.getHtmlContainer().querySelector('b')
//     timerInterval = setInterval(() => {
//       // b.textContent = Swal.getTimerLeft()
//       b.textContent = Swal.getTimerLeft()
//     }, 100)
//   },
//   willClose: () => {
//     clearInterval(timerInterval)
//   }
// }).then((result) => {
//   /* Read more about handling dismissals below */
//   if (result.dismiss === Swal.DismissReason.timer) {
//     console.log('I was closed by the timer')
//   }
// })


// Sweetalert

// let timerInterval
// Swal.fire({
//   // title: 'Auto close alert!',
//   html: 'Meeting remain <strong></strong> Minutes.',
//   timer: 100000,
//   timerProgressBar: true,
//   // allowOutsideClick: false,
//   // allowEscapeKey: true,
//   stopKeydownPropagation: false,
//   toast: true,
//   position: 'top-start',
//   showConfirmButton: false,
//   width: 350,
//   heightAuto: false,
//   customClass: 'swal-height',


//   // input: 'text',
//   didOpen: () => {
//     Swal.showLoading()
//     timerInterval = setInterval(() => {
//       Swal.getHtmlContainer().querySelector('strong').textContent = Math.ceil(Swal.getTimerLeft() / 1000 / 60)
//     }, 100)
//   },
//   willClose: () => {
//     clearInterval(timerInterval)
//   }
// }).then((result) => {
//   if (
//     // Read more about handling dismissals
//     result.dismiss === Swal.DismissReason.timer
//   ) {
//     console.log('I was closed by the timer')
//   }
// })


