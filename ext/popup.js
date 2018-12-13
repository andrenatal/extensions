window.addEventListener("message", receiveMessageFromIFrame, false);

console.log("this is the popup")

function receiveMessageFromIFrame (message) {
  if (message.data.type === 'CLOSE_WINDOW') return window.close()
}

browser.runtime.sendMessage({ type: "GET_PREDICTION" }, function (message) {
  document.getElementById("iframe").setAttribute("src", message.url)
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  document.getElementById("iframe").setAttribute("src", message.url)
})
