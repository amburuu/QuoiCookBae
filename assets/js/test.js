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
let recettediv = document.getElementById("etape-recette");

let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let videodiv = document.getElementById("webcamviewer");

const videoHeight = 700;
const videoWidth = 700;

const trad = {
  None: "Aucun geste reconnu",
  Thumb_Up: "Pouce en l'air",
  Thumb_Down: "Pouce en bas",
  Closed_Fist: "Poing fermé",
  Open_Palm: "Paume ouverte",
  Pointing_Up: "Pointe le ciel",
  Victory: "En V",
  ILoveYou: "ROOOOOOCK",
};
let sizeOfArray = function (array) {
  // A variable to store
  // the size of arrays
  let size = 0;

  // Traversing the array
  for (let key in array) {
    // Checking if key is present
    // in arrays or not
    if (array.hasOwnProperty(key)) {
      size++;
    }
  }

  // Return the size
  return size;
};

let recette = {
  1: "Ajouter 150ml d'eau dans un bol",
  2: "Ajouter 150ml de lait dans le meme bol",
  3: "Ajouter 200g de farine",
  4: "Ajouter 1 cuillère à soupe de beurre fondu",
  5: "Mélanger le tout",
  6: "Ajouter 1 cuillère à soupe de vanille liquide",
  7: "Mélanger le tout",
  8: "Votre Tacos 3 viandes est prêt !",
};

async function runDemo() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
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

let btn = document.getElementById("off");
var localstream;
let camoff = document.getElementById("camoff");
let camon = document.getElementById("camon");
camoff.style.display = "none";
camon.style.display = "block";
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
  if (webcamRunning) {
    console.log("webcam already running");
    webcamRunning = false;
    camon.style.display = "block";
    const video = document.querySelector("video");
    const mediaStream = video.srcObject;
    const tracks = mediaStream.getTracks();
    tracks[0].stop();
    videodiv.style.display = "none";

    camoff.style.display = "none";
  } else {
    console.log("webcam not running");
    videodiv.style.display = "block";
    webcamRunning = true;
    camon.style.display = "none";
    camoff.style.display = "block";
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
var prediction_on = true;
var demande = "";

var y = 0;
async function predictWebcam() {
  if (prediction_on == false) {
    if (demande == "suivant") {
      y = y + 1;
    } else if (demande == "precedent") {
      if (y != 0) {
        y = y - 1;
      }
    } else if (demande == "precedent" && y == max_y) {
      y = y - 1;
    }
    if (y > sizeOfArray(recette) && demande == "suivant") {
      recettediv.innerHTML = "Recette terminée";
    } else {
      EtapeSuivante(y);
      setTimeout(function () {
        prediction_on = true;
        predictWebcam();
      }, 2000);
    }
  } else {
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

      if (trad[results.gestures[0][0].categoryName] == "Pouce en l'air") {
        prediction_on = false;
        demande = "suivant";
        console.log("Pouce en l'air");
      } else if (trad[results.gestures[0][0].categoryName] == "Paume ouverte") {
        prediction_on = false;
        demande = "precedent";
      }
    } else {
      gestureOutput.style.display = "none";
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }
}

function EtapeSuivante(y) {
  console.log(y);
  console.log(sizeOfArray(recette));
  if (y == 0) {
    y = 1;
  }
  let max_y = sizeOfArray(recette);

  let etape = recette[y];

  recettediv.innerText = etape;
}
