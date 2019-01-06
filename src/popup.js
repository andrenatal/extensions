const isChrome = typeof browser === 'undefined'
const runtime = isChrome ? chrome.runtime : browser.runtime

window.addEventListener("message", receiveMessageFromIFrame, false);

function receiveMessageFromIFrame (message) {
  if (message.data.type === 'CLOSE_WINDOW') return window.close()
}

runtime.sendMessage({ type: "GET_PREDICTION" }, function (message) {
  document.getElementById("iframe").setAttribute("src", message.url)
});

runtime.onMessage.addListener((message, sender, sendResponse) => {
  document.getElementById("iframe").setAttribute("src", message.url)
})
