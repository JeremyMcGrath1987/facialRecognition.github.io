const video = document.getElementById("video");

function startCam() {
    navigator.getMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);

    navigator.getUserMedia({ video: {} }, stream => video.srcObject = stream, err => console.log(err));
}


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./face-api/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./face-api/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./face-api/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./face-api/models"),
    faceapi.nets.ageGenderNet.loadFromUri("./face-api/models")
]).then(startCam());

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    const displaySize = { width: video.width, height: video.height };

    document.body.append(canvas);

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizeDetections = faceapi.resizeResults(detections, displaySize);
        const glasses = new Image();
        let facex = 0;
        let facey = 0;
        let facewidth = 100;
        let faceheight = 100;
        let glassesProportion = 1;
        glasses.src = "/img/glasses.png";
        glasses.addEventListener("load", () => {
            glassesProportion = glasses.width / glasses.height;
        });
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);


        try {
            glasses.style.display = "block";
            const { x, y, width, height } = detections[0].detection.box;
            facex = x+50;
            facey = y;
            facewidth = width;
            faceheight = height;
            canvas.getContext("2d").drawImage(glasses, facex, facey, facewidth, facewidth/glassesProportion);
        } catch (error) {
            console.log("No reconoce cara");
        }
        faceapi.draw.drawDetections(canvas, resizeDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
    }, 100);
});
