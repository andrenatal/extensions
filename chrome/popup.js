window.addEventListener("message", receiveMessageFromIFrame, false);

function receiveMessageFromIFrame (message) {
  if (message.data.type === 'CLOSE_WINDOW') return window.close()
}

chrome.runtime.sendMessage({ type: "GET_PREDICTION" }, function (message) {
  document.getElementById("iframe").setAttribute("src", message.url)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  document.getElementById("iframe").setAttribute("src", message.url)
})
