import ext from "./utils/ext";
import getTotalDistance from "./utils/calculate-distance";

ext.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var resp = sendResponse
    if (request.action === "get-airports") {
      var requestData = JSON.parse(request.data);
      var airports = requestData.airports;
      var distance;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', chrome.extension.getURL('data/airport-data.json'), true);
      xhr.onreadystatechange = function()
      {
          if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
          {
            var data = JSON.parse(xhr.responseText);
            var filtered = data.filter(function(airport) {
              return airports.includes(airport.iata_faa) && airport.iata_faa !== "";
            });
            distance = getTotalDistance(filtered);
            resp({ action: "have-airports", data: distance });
          }
          
      };
      xhr.send();
      return true;
    }
  }
);