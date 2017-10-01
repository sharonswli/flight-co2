import ext from "./utils/ext";
import {totalEmissions} from "./utils/co2-emissions-calculation";

ext.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var resp = sendResponse
    if (request.action === "get-airports") {
      var requestData = JSON.parse(request.data);
      var flights = requestData.allFlights; 
      var distance;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', chrome.extension.getURL('data/airport-data.json'), true);
      xhr.onreadystatechange = function()
      {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
        {
          var data = JSON.parse(xhr.responseText);
          for (var i=0; i<flights.length; i++) {
            var flight = flights[i];
            var flightRoute = flight.flightRoute;
            var filtered = data.filter(function(airport) {
              return flightRoute.includes(airport.iata_faa) && airport.iata_faa !== "";
            });

            flight.emissions = totalEmissions(filtered);
          }
          resp({ action: "have-airports", data: flights });
        }
      };
      xhr.send();
      return true;
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