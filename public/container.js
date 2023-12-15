function appendTextToContainer(text) {
    let container = document.getElementById("chat-content");
    let newDiv = document.createElement("div");
    let newParagraph = document.createElement("p");
    let copyIcon = document.createElement("button");
    
  
    newParagraph.textContent = text;
    copyIcon.className = 'copy-btn';
    copyIcon.textContent = '📋';
    copyIcon.onclick = () => {
        copyTextToClipboard(text);
    };
  
    newDiv.appendChild(copyIcon);
    newDiv.appendChild(newParagraph);
    container.appendChild(newDiv);
}

function appendDownloadLink(blob, fileName) {
    const container = document.getElementById("chat-content");
    const newDiv = document.createElement("div");
    const downloadButton = document.createElement("a");
    const downloadIcon = document.createTextNode('⬇️');
    const downloadTitle = document.createElement("p");

    downloadButton.appendChild(downloadIcon);
    downloadButton.href = URL.createObjectURL(blob); // Create a Blob URL
    downloadButton.download = fileName;
    downloadButton.className = 'download-btn';
    downloadButton.title = "Download " + fileName;

    downloadTitle.textContent = fileName;

    newDiv.appendChild(downloadButton);
    newDiv.appendChild(downloadTitle);
    container.appendChild(newDiv);
}

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Error in copying text: ', err);
    });
}

export { appendTextToContainer, appendDownloadLink, copyTextToClipboard }