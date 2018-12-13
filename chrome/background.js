// --- BEGIN EXTENSION-SPECIFIC CONFIG ---
const SRC = "cde" // chrome desktop extension
const USER_AGENT = 'FakerFact/Chrome Plugin'
const TABS = chrome.tabs
const RUNTIME = chrome.runtime
const CONTEXT_MENUS = chrome.contextMenus
// --- END EXTENSION-SPECIFIC CONFIG ---

// This creates the "FakerFact Check Menu Item"
RUNTIME.onInstalled.addListener(function () {
  CONTEXT_MENUS.create({
    title: 'FakerFact Check',
    type: 'normal',
    id: 'FakerFactCheck',
    contexts: ['link']
  });
});

// This is the code that runs when the "FakerFact Check" menu item is clicked
// The flow is:
//  - open a new tab with /thinking
//  - get links and find the prediction link
//  - get the HTML from the page
//  - post it to the server, using the prediction link
//  - get the response
//  - open the success page /walt-says/:id in a new tab OR open the error page in a new tab /error
CONTEXT_MENUS.onClicked.addListener(function (itemData) {
  if (itemData.menuItemId === 'FakerFactCheck') {
    createTab('/thinking')
      .then(fakerFactTab => {
        return makePrediction(itemData.linkUrl)
          .then(prediction => updateTab(fakerFactTab, `/walt-says/${ prediction.id }`))
          .catch(e => openErrorPage(itemData.linkUrl, fakerFactTab, e))
      })
  }
});

// This is what runs when the popup sends a message
// The flow is:
//  - send a message to load /ext/thinking
//  - get links and find the prediction link
//  - get the HTML from the page
//  - post it to the server, using the prediction link
//  - get the response
//  - send a message with /ext/walt-says/:id  OR  /ext/error
RUNTIME.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ type: "THINKING", url: `${ WEB_HOST }/ext/thinking` })
  getCurrentTab()
    .then(currentTab => {
      return getHTML(currentTab)
        .then(html => makePrediction(currentTab.url, html))
        .then(prediction => RUNTIME.sendMessage({
          type: "PREDICTION_SUCCESS",
          url: `${ WEB_HOST }/ext/walt-says/${ prediction.id }`
        }))
        .catch(e => {
          const url = `${ WEB_HOST }/ext${ getErrorPath(currentTab.url, e) }`
          RUNTIME.sendMessage({ type: "PREDICTION_ERROR", url })
        })
    })
  return true
})

function getLinks () {
  return doGet(`${ API_HOST }/api`)
    .then(response => {
      if (!response.ok) throw new Error('Could not fetch links')
      return response.json()
    })
}

function makePrediction (url, html) {
  return getLinks()
    .then(links => doPost(links._links.predictions.href, { url, html, src: SRC }))
    .then(response => {
      return response.json()
        .then(prediction => {
          if (!response.ok) throw new Error(prediction.errors[0].message)
          return prediction
        })
    })
}

function getErrorPath (sourceUrl, e) {
  const url = encodeURIComponent(sourceUrl)
  const errorMessage = encodeURIComponent("Walt can't form an opinion right now due to an error")
  const extraMessage = encodeURIComponent(e.message)
  return `/error?em=${ errorMessage }&url=${ url }&src=${ SRC }&ed=${ extraMessage }`
}

function openErrorPage (sourceUrl, resultsTab, e) {
  const path = getErrorPath(sourceUrl, e)
  return updateTab(resultsTab, path)
}

// --- EXTENSION ABSTRACTIONS ---

function log () {
  const messages = ['FakerFact:']
  for (let i = 0; i < arguments.length; i++) {
    messages.push(arguments[i])
  }
  console.log.apply(console, messages)
}

function getCurrentTab () {
  return new Promise(resolve => {
    TABS.getSelected(null, function (currentTab) {
      resolve(currentTab)
    })
  })
}

function createTab (path) {
  return new Promise(resolve => {
    TABS.create({ url: `${ WEB_HOST }${ path }` }, tab => resolve(tab))
  })
}

function updateTab (tab, path) {
  return new Promise(resolve => {
    TABS.update(tab.id, { url: `${ WEB_HOST }${ path }` }, _ => resolve(null))
  })
}

function getHTML (tab) {
  return new Promise(resolve => {
    TABS.sendMessage(tab.id, { action: 'GET_HTML' }, {}, resolve)
  })
}

// // --- FAKERFACT API ABSTRACTIONS ---

const API_HOST = "http://localhost:5000"
const WEB_HOST = "http://localhost:3000"

function doGet (url) {
  return doFetch(url, 'GET')
}

function doPost (url, data) {
  return doFetch(url, 'POST', JSON.stringify(data))
}

function doFetch (url, method, body) {
  return fetch(url, {
    method,
    body,
    credentials: 'include',
    headers: {
      'user-agent': USER_AGENT,
      'content-type': 'application/json'
    },
    mode: 'cors'
  })
}
