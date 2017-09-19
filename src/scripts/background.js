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

chrome.webRequest.onCompleted.addListener(function(requestInfo) {
  console.log("some request completed");
  // Tell contentScript to checkIfFlightInfos
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if(tabs && tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "query_flights" });    
    }
  })
},
{
  urls: ["https://*.google.com/flights/rpc", "https://*.google.ca/flights/rpc", "https://*.google.ca/*.js", "https://*.google.com/*.js"]
 },
 ["responseHeaders"]);


//  chrome.tabs.onUpdated.addListener(function(tabId, info) {
//   if(info.status === 'complete') {
//     console.log("info is complete");
//   } 
//   console.log("tab is updated");
// });