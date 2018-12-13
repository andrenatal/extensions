chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'GET_HTML') {
    const html = document.documentElement.outerHTML;
    sendResponse(html);
  }
});
