import ext from "./utils/ext";
import {totalEmissions} from "./utils/co2-emissions-calculation";
import {data} from "../data/co2_relating";
import {convertCO2} from "./utils/convert";

ext.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var resp = sendResponse
    if (request.action === "get-airports") {
      var requestData = JSON.parse(request.data.flightsData);
      var flights = requestData.allFlights;
      var relateToLabel = request.data.relateToLabel;
      if (relateToLabel) {
        var relateTo = data.filter(function(item){
          return item.label === relateToLabel;
        })
      }
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
              if (relateToLabel) {
                flight.relatedTo = relateToLabel;
                flight.related = convertCO2(flight.emissions, relateTo[0].CO2e);
              }
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
