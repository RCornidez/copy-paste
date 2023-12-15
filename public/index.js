//index.js
import { appendTextToContainer, appendDownloadLink, copyTextToClipboard } from './container.js'



// DOM elements
const callInput = document.getElementById('callInput');
const createSessionButton = document.getElementById("createSession");
const joinSessionButton = document.getElementById("joinSession");
const sendTextButton = document.getElementById("sendText");
const sendFileButton = document.getElementById("sendFile");
const closeModalButton = document.getElementsByClassName("close")[0];


//Event Listeners
callInput.addEventListener("click", () => {copyTextToClipboard(sessionId.innerText)})
createSessionButton.addEventListener("click", () => {createSession(url, dataChannel)});
joinSessionButton.addEventListener("click", () => openForm("Join a Session", url, dataChannel));
sendTextButton.addEventListener("click", () => openForm("Send Text", url, dataChannel));
sendFileButton.addEventListener("click", () => openForm("Send a File", url, dataChannel));
closeModalButton.addEventListener("click", closeModal);

// WebRTC configuration
const servers = {
    iceServers: [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    ],
    iceCandidatePoolSize: 10,
  };
  
const pc = new RTCPeerConnection(servers);
let dataChannel;
let expectedFileSize = 0;
let receivedFileName = '';
let receiveBuffer = [];
let receivedSize = 0;

let url = `http://127.0.0.1:4000/` // This will be set to the Public IP or domain name + port where your application is hosted



// Create a session
async function createSession(url) {
sessionStorage.clear()
//Create new session doc (via API) then set the sessionId in sessionStorage from the response object
try {
    const response = await fetch(`${url}create-session/`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    console.log("Session Id: ", data.sessionId)
    sessionStorage.setItem("sessionId", data.sessionId)
} catch (error) {
    console.error('Error creating new session:', error);
}

// Create data channel
dataChannel = pc.createDataChannel('main');
const sessionId = sessionStorage.getItem('sessionId')

// Show session id on creators view
setCallInput()

// Setup data channel listener
if (dataChannel && sessionId) {
    dataChannelListener(url, sessionId);
}

// Get session creator's ICE candidates and save them to the document under offerCandidates
pc.onicecandidate = event => {
    event.candidate && fetch(`${url}offerCandidates/`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
        },
        body: JSON.stringify(event.candidate),
    })
    .then(data => console.log('Successfully Set Offer Candidates'))
    .catch(error => console.error('Error:', error));
};

// Create session offer and set as local description
const offerDescription = await pc.createOffer();
await pc.setLocalDescription(offerDescription);

const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    };

// set offer in document
if (offer && sessionId) {
    try {
        const response = await fetch(`${url}offer/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
            },
            body: JSON.stringify({ offer }),
        })

        if (response.ok) {
            console.log("added offer")
        }
    } catch (error) {
        console.error('Error setting offer', error);
    }
}

if (sessionId) {
    await pollAnswerAndCandidates(url, 5000, 60);
}
}

// Join a session
async function joinSession(url) {
    // Grab sessionId from sessionStorage
    const sessionId = sessionStorage.getItem("sessionId");

    // Set up data channel listener
    pc.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannelListener(url, sessionId);
    }

    // Set answer candidates
    pc.onicecandidate = event => {
        event.candidate && fetch(`${url}answerCandidates/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
            },
            body: JSON.stringify(event.candidate),
        })
        .then(data => console.log('Successfully Set Answer Candidates'))
        .catch(error => console.error('Error:', error));
    };

    // Get session document
    const docData = await fetch(`${url}session-document/`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
        }
    })

    const document = await docData.json()

    // If document is true, set remote and local descriptions
    if (document.offer) {

        // Set remote description
        const offerDescription = document.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        // Create and set local description
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        // set answer in document
        if (answer && sessionId) {
            try {
                const response = await fetch(`${url}answer/`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                    },
                    body: JSON.stringify({ answer }),
                })

                if (response.ok) {
                    console.log("added answer")
                }
            } catch (error) {
                console.error('Error setting answer', error);
            }
        }
    };

    // Get offerer's ICE candidates
    const offerCandidates = await fetch(`${url}offerCandidates/`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
        }
    })

    const candidates = await offerCandidates.json()

    candidates.forEach((data) => {pc.addIceCandidate(new RTCIceCandidate(data));})

    }
  
    // Session creator's poll function - checks for session answer and answer candidates
async function pollAnswerAndCandidates(url, interval, maxAttempts) {
    console.log("Starting pollAnswerAndCandidates");
    let counter = 0;
    const sessionId = sessionStorage.getItem("sessionId");
    console.log("Session ID:", sessionId);

    const intervalId = setInterval(async () => {
        console.log("Polling attempt:", counter + 1, "/", maxAttempts);
        
        if (counter < maxAttempts) {
            try {
                let answerStatus = sessionStorage.getItem("answerSet");
                let answerCandidatesStatus = sessionStorage.getItem("answerCandidatesSet");
                console.log("Current Status - answerSet:", answerStatus, ", answerCandidatesSet:", answerCandidatesStatus);

                if (!answerStatus) {
                    console.log("Fetching session document for answer");
                    const docData = await fetch(`${url}session-document/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-id': sessionId
                        }
                    });

                    const document = await docData.json();
                    console.log("Received Document:", document);

                    if (document.answer) {
                        console.log("Answer found in document");
                        const answerDescription = document.answer;
                        await pc.setRemoteDescription(new RTCSessionDescription(answerDescription));
                        sessionStorage.setItem("answerSet", "true");
                    } else {
                        console.log("No answer found in document");
                    }
                }

                if (!answerCandidatesStatus) {
                    console.log("Fetching answer candidates");
                    const answerCandidates = await fetch(`${url}answerCandidates/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-id': sessionId
                        }
                    });
                    const candidates = await answerCandidates.json();
                    console.log("Received Answer Candidates:", candidates);

                    if (candidates.length > 0) {  // Check if the candidates array is not empty
                        candidates.forEach(data => pc.addIceCandidate(new RTCIceCandidate(data)));
                        sessionStorage.setItem("answerCandidatesSet", "true");
                    } else {
                        console.log("No answer candidates received");
                    }
                }

                if (answerStatus && answerCandidatesStatus) {
                    console.log("Both answer and candidates set, clearing interval");
                    clearInterval(intervalId);
                }

            } catch (error) {
                console.error("Error during polling:", error);
            }
            counter++;
        } else {
            console.log("Maximum attempts reached, stopping polling");
            clearInterval(intervalId);
        }
    }, interval);
    }

    // Data channel helper functions
function dataChannelListener(url, sessionId) {
    console.log("Data channel listener enabled")
    dataChannel.binaryType = 'arraybuffer';

    dataChannel.onmessage = handleDataChannelMessage;
    dataChannel.onopen = () => {
        console.log("Data Channel opened")
        sendTextButton.style.display = "flex";
        sendFileButton.style.display = "flex";

    };
    dataChannel.onclose = () => {
        sessionStorage.removeItem("dataChannel")
        handleCloseDataChannel(url, sessionId)};
    }

function handleDataChannelMessage(event) {
    console.log('Received:', event.data);

    if (typeof event.data === 'string') {
        handleStringMessage(event.data);
    } else {
        handleBinaryData(event.data);
    }
    }

function handleStringMessage(data) {
    try {
        const message = JSON.parse(data);
        if (message.type === 'file-metadata') {
            expectedFileSize = message.size;
            receivedFileName = message.name;
        }
    } catch (e) {
        appendTextToContainer(data);
    }
    }

function handleBinaryData(data) {
    receiveBuffer.push(data);
    receivedSize += data.byteLength;

    if (receivedSize === expectedFileSize) {
        createAndAppendDownloadLink();
    }
    }

function createAndAppendDownloadLink() {
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];
    receivedSize = 0;
    appendDownloadLink(received, receivedFileName);
    }

async function handleCloseDataChannel(url, sessionId) {
    console.log("Data Channel closed");
    if (sessionId) {
        try {
            const response = await fetch(`${url}delete-document/`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
                }
            });
        
            if (response.ok) {
                console.log("Document deleted successfully");
                
            } else {
                console.error("Failed to delete document");
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    } else {
        console.error("Call document reference is undefined, cannot delete.");
    }
    sessionStorage.clear()
    }

function sendText() {
    const textToSend = document.getElementById("textToSend").value;
    try {
        dataChannel.send(textToSend)
        appendTextToContainer(textToSend);
    } catch (err) {
        console.error('err');
    }
}

function sendFile() {
    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0]; // get the file from the input
  
    if (file) {
      sendData(file, dataChannel); // Call the function to start sending the file
    }
}

function sendFileMetadata(file) {
    const metadata = {
        name: file.name,
        size: file.size,
        type: 'file-metadata'
    };
    dataChannel.send(JSON.stringify(metadata));
}


function sendData(file) {
    sendFileMetadata(file); // Send metadata first

    const chunkSize = 16384; // Size of each chunk
    let offset = 0; // Start at the beginning of the file
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
        dataChannel.send(event.target.result);
        offset += event.target.result.byteLength;

        // Check if the entire file has been read and sent
        if (offset >= file.size) {
            // All data has been sent, append download link for the sender
            appendDownloadLink(new Blob([file]), file.name);
        }

        if (offset < file.size) {
            readSlice(offset);
        }
    };

    fileReader.onerror = (error) => {
        console.error('Error reading file:', error);
    };

    const readSlice = (o) => {
        const slice = file.slice(o, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };

    readSlice(0); // Start reading the file
}

function openForm(formType, url) {
    // Display the form modal
    document.getElementById("formModal").style.display = "block";
  
    // Get the form body container and clear any existing content
    let formBody = document.getElementById("formBody");
    formBody.innerHTML = '';
  
    // Update the form title based on the form type
    document.getElementById("formTitle").innerText = formType;

    // button container
    let buttons = document.createElement("div")
    buttons.setAttribute("id","form-buttons");
  
    // Reusable Cancel Button
    let cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = closeModal; // Attach event handler to close the modal
  
    // Depending on the form type, create and append the necessary elements
    switch(formType) {
      case "Join a Session":
        let sessionIdInput = document.createElement("input");
        sessionIdInput.id = "sessionId";
        sessionIdInput.type = "text";
        sessionIdInput.placeholder = "Session ID";
  
        let joinButton = document.createElement("button");
        joinButton.textContent = "Join";
        joinButton.onclick = () => {
          sessionStorage.setItem("sessionId", sessionIdInput.value)
          joinSession(url);
          closeModal();
          setCallInput()
        };
  
        formBody.appendChild(sessionIdInput);
        buttons.appendChild(joinButton);
        break;
  
      case "Send Text":
        console.log("created text form")
        let textInput = document.createElement("textarea");
        textInput.id = "textToSend";
        textInput.placeholder = "Enter text";
  
        let sendTextButton = document.createElement("button");
        sendTextButton.textContent = "Send";
        sendTextButton.onclick = () => {
          sendText()
          closeModal()
        };
  
        formBody.appendChild(textInput);
        buttons.appendChild(sendTextButton);
        break;
  
      case "Send a File":
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "fileInput";
  
        let sendFileButton = document.createElement("button");
        sendFileButton.textContent = "Send";
        sendFileButton.onclick = () => {
          sendFile()
          closeModal()
        };
  
        formBody.appendChild(fileInput);
        buttons.appendChild(sendFileButton);
        break;
    }
  
    // Append the buttons to formBody
    buttons.appendChild(cancelButton);
    formBody.appendChild(buttons);
}

function closeModal () {
    document.getElementById("formModal").style.display = "none";
}

// Shows SessionId for user
function setCallInput() {
    let sessionId = sessionStorage.getItem("sessionId")
    if (sessionId) {
        callInput.innerHTML = "";
        let sessionTitle = document.createElement("p");
        sessionTitle.innerHTML= "Click to copy:";
        sessionTitle.setAttribute("id","sessionTitle")
        let sessionIdElement = document.createElement("p");
        sessionIdElement.setAttribute("id","sessionId")
        sessionIdElement.textContent = sessionId;
        callInput.appendChild(sessionTitle);
        callInput.appendChild(sessionIdElement);
    }
}






