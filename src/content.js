const isChrome = typeof browser === 'undefined'

const USER_AGENT = "FakerFact/Firefox Plugin";
let ff_icon = null;
const SRC = isChrome ? "cde" : "ffde"
const API_HOST = "https://api.fakerfact.org"
const WEB_HOST = "https://www.fakerfact.org"
let ifrm = null;
let last_fficon = null;
const runtime = isChrome ? chrome.runtime : browser.runtime

runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "GET_HTML") {
    const html = document.documentElement.outerHTML;
    sendResponse(html);
  }
});

if (!isChrome) {
  (function load_ff_embedding () {

    // https://developer.chrome.com/apps/app_external#webview

    class FFEmbeddedIcon {
      constructor () {
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
            tweet_timeline_link = tweet.getElementsByClassName(twitter_timeline_link)[0].getAttribute("href");
          }

          let final_url = tweet_timeline_link || tweet_url;

          if (typeof final_url !== "undefined") {
            let anchor = tweet.getElementsByClassName(anchor_class_name)[0];
            let icon = document.createElement("button");
            icon.classList.add("ff-icon");
            let iconURL = "images/fakerfact-96.png"
            if (isChrome) {
              iconURL = chrome.extension.getURL(iconURL)
            } else {
              iconURL = browser.extension.getURL(iconURL)
            }
            let img = document.createElement('img')
            img.src = iconURL
            icon.appendChild(img)
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

      hide_iframe (e) {
        if (e.target.id !== "fficon") {
          ifrm.style.display = "none";
        }
      }

      on_scroll () {
        if (last_fficon) {
          ifrm.style.top = `${ last_fficon.getBoundingClientRect().top }px`;
        }
      }

      on_ff_icon_click (event) {
        last_fficon = event.target;
        ifrm.setAttribute("src", `${ WEB_HOST }/ext/thinking`);
        var x = event.clientX;
        var y = event.clientY;
        let url = this.getAttribute("url_ff");
        ifrm.style.top = `${ y }px`;
        ifrm.style.left = `${ x }px`;
        ifrm.style.display = "block";
        ff_icon.doGetPage(url);
      }

      doPost (url, data) {
        return this.doFetch(url, "POST", JSON.stringify(data));
      }

      doGet (url) {
        return this.doFetch(url, "GET");
      }

      doGetPage (url) {
        fetch(url, {
          mode: "cors",
          redirect: "follow",
        }).then(response => {
          return response.text();
        })
          .then(data => {
            var regex = /<META http-equiv="refresh" content="0;URL=([^"]+)[^>]+>/;
            var match = regex.exec(data);

            if (match !== null) {
              this.doGetPage(match[1]);
            } else {
              this.makePrediction(url, data).then(prediction => {
                let url = `${ WEB_HOST }/ext/walt-says/${ prediction.id }`;
                ifrm.setAttribute("src", url);
              });
            }
          })
          .catch(error => {
            console.log(error); // display this error in the iframe
          });
      }

      doFetch (url, method, body) {
        return fetch(url, {
          method,
          body,
          credentials: "include",
          headers: {
            "user-agent": USER_AGENT,
            "content-type": "application/json"
          },
          mode: "cors"
        });
      }

      getLinks () {
        return this.doGet(`${ API_HOST }/api`)
          .then(response => {
            if (!response.ok) throw new Error("Could not fetch links")
            return response.json()
          });
      }

      makePrediction (url, html) {
        return this.getLinks()
          .then(links => this.doPost(links._links.predictions.href, { url, html, src: SRC }))
          .then(response => {
            return response.json()
              .then(prediction => {
                if (!response.ok) throw new Error(prediction.errors[0].message)
                return prediction;
              });
          });
      }

    }

    ff_icon = new FFEmbeddedIcon();
  })();
}
