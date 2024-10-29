<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
// script.js

// Variables for local and remote video elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Signaling server
const signalingServerUrl = 'wss://your-signaling-server-url';
const connection = new WebSocket(signalingServerUrl);

// Peer connection configuration
const peerConnectionConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add more STUN/TURN servers if needed
    ]
};

let peerConnection = new RTCPeerConnection(peerConnectionConfig);

// Get user media (camera and microphone)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        // Add local stream to peer connection
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    })
    .catch(error => console.error('Error accessing media devices.', error));

// Handle incoming ICE candidates
connection.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.offer) {
        handleOffer(data.offer);
    } else if (data.answer) {
        handleAnswer(data.answer);
    } else if (data.iceCandidate) {
        handleNewICECandidate(data.iceCandidate);
    }
};

// Create offer
function createOffer() {
    peerConnection.createOffer()
        .then(offer => {
            return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
            // Send offer to signaling server
            connection.send(JSON.stringify({ offer: peerConnection.localDescription }));
        })
        .catch(error => console.error('Error creating offer:', error));
}

// Handle offer
function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
            return peerConnection.createAnswer();
        })
        .then(answer => {
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            connection.send(JSON.stringify({ answer: peerConnection.localDescription }));
        })
        .catch(error => console.error('Error handling offer:', error));
}

// Handle answer
function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch(error => console.error('Error handling answer:', error));
}

// Handle new ICE candidate
function handleNewICECandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => console.error('Error adding ICE candidate:', error));
}

// When a new ICE candidate is generated
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        connection.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
};

// When remote stream is added
peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
};

// Call createOffer() to start the connection when ready
// Signaling server setup
const signalingServerUrl = 'wss://your-signaling-server-url';
const connection = new WebSocket(signalingServerUrl);

// Peer connection configuration with STUN server
const peerConnectionConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

let peerConnection = new RTCPeerConnection(peerConnectionConfig);

// Get user media (camera and microphone)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        document.getElementById('localVideo').srcObject = stream;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    })
    .catch(error => console.error('Error accessing media devices.', error));

// Handle incoming messages from signaling server
connection.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.offer) {
        handleOffer(data.offer);
    } else if (data.answer) {
        handleAnswer(data.answer);
    } else if (data.iceCandidate) {
        handleNewICECandidate(data.iceCandidate);
    }
};

// Create an offer
function createOffer() {
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            connection.send(JSON.stringify({ offer: peerConnection.localDescription }));
        })
        .catch(error => console.error('Error creating offer:', error));
}

// Handle received offer
function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            connection.send(JSON.stringify({ answer: peerConnection.localDescription }));
        })
        .catch(error => console.error('Error handling offer:', error));
}

// Handle received answer
function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch(error => console.error('Error handling answer:', error));
}

// Handle new ICE candidate
function handleNewICECandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => console.error('Error adding ICE candidate:', error));
}

// When a new ICE candidate is generated
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        connection.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
};

// When remote stream is added
peerConnection.ontrack = (event) => {
    document.getElementById('remoteVideo').srcObject = event.streams[0];
};

// Basic chat functions (connect/disconnect/send)
function connectUser() {
    document.getElementById("chat-box").innerHTML += "<p>Connecting to a random user...</p>";
    createOffer();
}

function disconnectUser() {
    document.getElementById("chat-box").innerHTML += "<p>You have disconnected.</p>";
    // Add code here to properly close connection if needed
}

function sendMessage() {
    let message = document.getElementById("message").value;
    if (message) {
        document.getElementById("chat-box").innerHTML += `<p>You: ${message}</p>`;
        document.getElementById("message").value = "";
        // Code to send message over WebSocket will be added later
    }
}

