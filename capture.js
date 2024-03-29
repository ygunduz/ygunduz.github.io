(function () {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 720;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  var videoWidth = 0;
  var videoHeight = 0;

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('capturedPhoto');
    photoPreview = document.getElementById('photo');
    startbutton = document.getElementById('takeButton');
    discardbutton = document.getElementById('discardButton');

    navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
        // facingMode: { exact: "environment" },
      }, audio: false
    })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });

    video.addEventListener("loadedmetadata", function (e) {
      videoWidth = this.videoWidth;
      videoHeight = this.videoHeight;
    }, false);

    video.addEventListener('canplay', function (ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function (ev) {
      takepicture();
      ev.preventDefault();
    }, false);

    discardbutton.addEventListener('click', function (ev) {
      setState(true);
      ev.preventDefault();
    }, false);

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('value', '');
    photoPreview.setAttribute('src', '');
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      // const { canvasWidth, canvasHeight } = setCanvasDimensions();
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      var data = canvas.toDataURL('image/png');
      photo.setAttribute('value', data);
      photoPreview.setAttribute('src', data);

      setState(false);
    } else {
      clearphoto();
    }
  }

  function setState(isPlaying) {
    if (isPlaying) {
      photoPreview.style.display = "none";
      discardbutton.style.display = "none";
      video.style.display = "block";
      startbutton.style.display = "block";
      clearphoto();
      video.play();
    } else {
      photoPreview.style.display = "block";
      discardbutton.style.display = "block";
      video.style.display = "none";
      startbutton.style.display = "none";
      video.pause();
    }
  }

  function setCanvasDimensions() {
    const aspectRatio = videoWidth / videoHeight;
    let canvasWidth = 0;
    let canvasHeight = 0;
    if (aspectRatio > 0) {
      canvasWidth = document.getElementsByClassName('camera')[0].offsetWidth;
      canvasHeight = canvasWidth / aspectRatio;
    } else {
      canvasHeight = document.getElementsByClassName('camera')[0].offsetHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    canvas.style.width = canvasWidth;
    canvas.style.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    return {
      canvasWidth, canvasHeight
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  document.getElementById('modalPhoto').addEventListener('shown.bs.modal', startup, false);
  document.getElementById('modalPhoto').addEventListener('hide.bs.modal', function () {
    video.pause();
    // canvas.style.display = "none";
    discardbutton.style.display = "none";
    video.style.display = "block";
    startbutton.style.display = "block";
    video.srcObject = null;
    clearphoto();
  }, false);
  // window.addEventListener('load', startup, false);
})();