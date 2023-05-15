function $_GET(param) {
  var vars = {};
  window.location.href.replace(location.hash, "").replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
    function (m, key, value) {
      // callback
      vars[key] = value !== undefined ? value : "";
    }
  );

  if (param) {
    return vars[param] ? vars[param] : null;
  }
  return vars;
}
var recettesJson;

// function chargerRecette() {
//   var xobj = new XMLHttpRequest();
//   xobj.overrideMimeType("application/json");
//   xobj.open("GET", "../assets/js/recette.json", true);
//   xobj.onreadystatechange = function () {
//     if (xobj.readyState == 4 && xobj.status == "200") {
//       recettesJson = JSON.parse(xobj.responseText);
//       return recettesJson;
//     }
//   };
//   xobj.send(null);
// }
//xhr to load json and assign to variable

let id_recette = $_GET("id");
var recettesJson = (function () {
  var json = null;
  $.ajax({
    async: false,
    global: false,
    url: "../assets/js/recette.json",
    dataType: "json",
    success: function (data) {
      json = data;
    },
  });
  return json;
})();

let recettediv = document.getElementById("step");
let etapediv = document.getElementById("titleStep");

const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.lang = "fr-FR";
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.continiuous = false;

import vision from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";
const { GestureRecognizer, FilesetResolver } = vision;
const demosSection = document.getElementById("demos");

let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let videodiv = document.getElementById("webcamviewer");
let retour = document.getElementById("retour");

const videoHeight = 500;
const videoWidth = 300;

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

recognition.onresult = function (event) {
  var sentence = event.results[0][0].transcript;
  console.log("Resultat : " + sentence + ".");
  console.log("Indice de confiance : " + event.results[0][0].confidence);
  if (sentence.indexOf("suivant") > -1) {
    y++;
    if (y > sizeOfArray(recette)) {
      y = sizeOfArray(recette);
    }
    EtapeSuivante(y);
    retour.innerHTML = sentence[0].toUpperCase() + sentence.slice(1) + ". ";
  } else if (sentence.indexOf("précédent") > -1) {
    y--;
    EtapePrecedente(y);
    retour.innerHTML = sentence[0].toUpperCase() + sentence.slice(1) + ". ";
  } else {
    retour.innerHTML = "Je n'ai pas compris :(";
  }
};

recognition.onerror = function (event) {
  console.log("Erreur : " + event.error);
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
let micon = document.getElementById("micon");
let micoff = document.getElementById("micoff");
var etat_mic = false;

camoff.style.display = "none";
camon.style.display = "block";
micoff.style.display = "none";
micon.style.display = "block";

micon.addEventListener("click", function () {
  micoff.style.display = "block";
  micon.style.display = "none";
  recognition.start();
  etat_mic = true;
  console.log("micon");
});
micoff.addEventListener("click", function () {
  micoff.style.display = "none";
  micon.style.display = "block";
  etat_mic = false;
  recognition.abort();
  console.log("micoff");
});

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("camon");
  enableWebcamButton.addEventListener("click", enableCam);
  let camoffBTN = document.getElementById("camoff");
  camoffBTN.addEventListener("click", enableCam);
} else {
  console.warn("Application non supporté par votre navigateur");
}
// Enable the live webcam view and start detection.
let iconNoCam = document.getElementById("nocam");
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
    iconNoCam.style.display = "block";
  } else {
    console.log("webcam not running");
    videodiv.style.display = "block";
    webcamRunning = true;
    camon.style.display = "none";
    camoff.style.display = "block";
    iconNoCam.style.display = "none";
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
      y++;
      if (y > sizeOfArray(recette)) {
        y = sizeOfArray(recette);
      }
      EtapeSuivante(y);
    } else if (demande == "precedent") {
      if (y > 1) {
        y--;
      } else {
        y = 1;
      }
      EtapePrecedente(y);
    }
    setTimeout(function () {
      prediction_on = true;
      predictWebcam();
    }, 1000);
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

    canvasCtx.restore();
    if (results.gestures.length > 0) {
      gestureOutput.style.display = "block";
      gestureOutput.style.width = videoWidth;
      if (trad[results.gestures[0][0].categoryName] == "Pouce en l'air") {
        prediction_on = false;
        demande = "suivant";
      } else if (trad[results.gestures[0][0].categoryName] == "Pouce en bas") {
        prediction_on = false;
        demande = "precedent";
      } else if (trad[results.gestures[0][0].categoryName] == "Poing fermé") {
        prediction_on = false;
        recognition.abort();
        etat_mic = false;
        setTimeout(function () {
          prediction_on = true;
          predictWebcam();
        }, 2000);
        micoff.style.display = "none";
        micon.style.display = "block";
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
console.log(recettesJson);
function EtapeSuivante(y) {
  console.log(y);
  let max_y = sizeOfArray(recettesJson[id_recette].etapes);

  let etape = recettesJson[id_recette].etapes[y];

  recettediv.innerText = "";
  recettediv.innerText = etape;
  etapediv.innerText = "Etape " + y + "/" + max_y;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(etape));
}
function EtapePrecedente(y) {
  console.log(y);
  let max_y = sizeOfArray(recettesJson[id_recette].etapes);
  if (y <= 1) {
    y = 1;
  }
  let etape = recettesJson[id_recette].etapes[y];
  recettediv.innerText = "";
  recettediv.innerText = etape;
  etapediv.innerText = "Etape " + y + "/" + max_y;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(etape));
}
