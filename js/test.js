// Copyright 2022 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import vision from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";
const { GestureRecognizer, FilesetResolver } = vision;
const demosSection = document.getElementById("demos");
let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = 700;
const videoWidth = 700;

const trad = {
  None: "Aucun geste reconnu",
  Thumb_Up: "Pouce en l'air",
  Thumb_Down: "Pouce en bas",
  Closed_Fist : "Poing fermé",
  Open_Palm:"Paume ouverte",
  Pointing_Up:"Pointe le ciel",
  Victory : "En V",
  ILoveYou:"ROOOOOOCK"
};

let recette = {
  1: "Ajouter eau",
  2: "Ajouter lait",
  3: "Ajouter farine",
  4: "Ajouter patate",
}

async function runDemo() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "app/shared/models/gesture_recognizer.task",
    },
    runningMode: runningMode,
  });
  demosSection.classList.remove("invisible");
}
runDemo();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");

let btn = document.getElementById('off')
var localstream;


// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("Application non supporté par votre navigateur");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!gestureRecognizer) {
    alert("Chargement du module de reconnaissance en cours...");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "Activer prédiction";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "Désactiver prédiction";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
 var nbetat = false;
 
btn.addEventListener('click',function(){
    const video = document.querySelector('video');
    const mediaStream = video.srcObject;  
    const tracks = mediaStream.getTracks();
    tracks[0].stop();
    let videodiv= document.getElementById('webcamviewer')
    videodiv.style.display = "none";
})
async function predictWebcam() {
  var y = 0;
  const webcamElement = document.getElementById("webcam");
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await gestureRecognizer.setOptions({ runningMode: runningMode });
  }
  let nowInMs = Date.now();
  const results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasElement.style.height = videoHeight;
  webcamElement.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  webcamElement.style.width = videoWidth;
  // if (results.landmarks) {
  //     for (const landmarks of results.landmarks) {
  //         drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
  //             color: "#00FF00",
  //             lineWidth: 5
  //         });
  //         drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
  //     }
  // }
  canvasCtx.restore();
  if (results.gestures.length > 0) {
    gestureOutput.style.display = "block";
    gestureOutput.style.width = videoWidth;
    // gestureOutput.innerText =
    //   "Geste en cours: " +
    //   trad[results.gestures[0][0].categoryName] +
    //   "\n Précision: " +
    //   Math.round(parseFloat(results.gestures[0][0].score) * 100) +
    //   "%";
    if(results.gestures[0][0].categoryName=="Thumb_Up"){
      setTimeout(function(){
      gestureOutput.innerText = recette[y+1]
      console.log(recette[y+1])
      y = y+1;
      },5000)
      
    }
 
  } else {
    gestureOutput.style.display = "none";
  }

 

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
