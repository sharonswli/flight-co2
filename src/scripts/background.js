import ext from "./utils/ext";

ext.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.action === "perform-save") {
      console.log("Extension Type: ", "/* @echo extension */");
      console.log("PERFORM AJAX", request.data);

      sendResponse({ action: "saved" });
    }
  }
);

chrome.webRequest.onCompleted.addListener(function (tabId, changeInfo, tab) {
  console.log("some request completed");
},
{
  urls: ["https://*.google.com/*.js"]
 },
 ["responseHeaders"]);

