import ext from "./utils/ext";
import {getTotalDistance} from "./utils/calculate-distance";
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

              flight.emissions = totalEmissions(filtered, 'one-way');

              distance = getTotalDistance(filtered);
              flight.distance = distance;
            }

            resp({ action: "have-airports", data: flights });
          }
          
      };
      xhr.send();
      return true;
    }
  }
);