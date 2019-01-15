const USER_AGENT = "FakerFact/Firefox Plugin";
let ff_icon = null;
const SRC = "ffde"; // firefox desktop extension
const API_HOST = "https://api.fakerfact.org"
const WEB_HOST = "https://www.fakerfact.org"
let ifrm = null;
let last_fficon = null;

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "GET_HTML") {
    const html = document.documentElement.outerHTML;
    sendResponse(html);
  }
});

(function load_ff_embedding() {

  class FFEmbeddedIcon {
    constructor() {
      window.onscroll = this.on_scroll;
      let anchor_class_name = "ProfileTweet-action ProfileTweet-action--favorite js-toggleState";
      let tweets_class_name = "tweet";
      let tweets_a_link = "js-macaw-cards-iframe-container";
      let twitter_timeline_link = "twitter-timeline-link";
      let tweetList = document.getElementsByClassName(tweets_class_name);
      ifrm = document.createElement("iframe");
      ifrm.classList.add("iframe");
      ifrm.setAttribute("id", "ifrm");
      document.body.appendChild(ifrm);
      document.body.addEventListener("click", this.hide_iframe);
      for (let tweet of tweetList) {
        let tweet_url;
        if (tweet.getElementsByClassName(tweets_a_link).length > 0) {
          tweet_url = tweet.getElementsByClassName(tweets_a_link)[0].getAttribute("data-card-url");
        }

        let tweet_timeline_link;
        if (tweet.getElementsByClassName(twitter_timeline_link).length > 0) {
          tweet_timeline_link =tweet.getElementsByClassName(twitter_timeline_link)[0].getAttribute("href");
        }

        let final_url = tweet_timeline_link || tweet_url;

        if (typeof final_url !== "undefined") {
          let anchor = tweet.getElementsByClassName(anchor_class_name)[0];
          let icon = document.createElement("button");
          icon.classList.add("ff-icon");
          icon.id = "fficon";
          document.body.appendChild(icon);
          icon.addEventListener("click", this.on_ff_icon_click);
          icon.setAttribute("url_ff", final_url);
          anchor.style.position = "relative";
          anchor.style.overflow = "visible";
          anchor.append(icon);
        }
      }
    }

    hide_iframe(e) {
      if (e.target.id !== "fficon"){
        ifrm.style.display = "none";
      }
    }

    on_scroll() {
      ifrm.style.top = `${last_fficon.getBoundingClientRect().top}px`;
    }

    on_ff_icon_click(event) {
      last_fficon = event.target;
      ifrm.setAttribute("src", `${WEB_HOST}/ext/thinking`);
      var x = event.clientX;
      var y = event.clientY;
      let url = this.getAttribute("url_ff");
      ifrm.style.top = `${y}px`;
      ifrm.style.left = `${x}px`;
      ifrm.style.display = "block";
      ff_icon.doGetPage(url);
    }

    doGetPage(url) {
      var data = `{"url": "${url}"}`;

      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          let id = JSON.parse(this.responseText).id;
          let url = `${WEB_HOST}/ext/walt-says/${id}`;
          ifrm.setAttribute("src", url);
        }
      });

      xhr.open("POST", `${API_HOST}/api/predictions`);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("cache-control", "no-cache");

      xhr.send(data);
    }

  }
  ff_icon = new FFEmbeddedIcon();
})();