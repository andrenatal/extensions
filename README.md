# FakerFact Browser Extensions

The browser extensions for https://www.fakerfact.org

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/fakerfact/)
- [Chrome](https://chrome.google.com/webstore/detail/fakerfact-plugin/hmcmekfmgfmilmmnicpmkfkccgnfegef)

## Developing

1. Download the repo
1. Run `npm install`

To run in FireFox, run:

```
npm start
```

See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext for more details.

To run in Chrome, use developer mode in chrome://extensions

## Deploying

First, make sure you update the version number in the manifests.  Then run:

```
npm run build:chrome <api url> <website url>
```

For example:

```
npm run build:chrome https://example.com/api https://www.fakerfact.org
npm run build:ext https://example.com/api https://www.fakerfact.org
```

The built extensions will be in `/build`

- [Upload to FireFox](https://addons.mozilla.org/en-US/developers/addons)
- [Upload to Chrome](https://chrome.google.com/webstore/developer/dashboard)
