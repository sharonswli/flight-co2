import ext from "./utils/ext";


var extractTags = () => {
  var url = document.location.href;
  if(!url || !url.match(/^http/)) return;

  var data = {
    title: "",
    description: "",
    url: document.location.href
  }

  var ogTitle = document.querySelector("meta[property='og:title']");
  if(ogTitle) {
    data.title = ogTitle.getAttribute("content")
  } else {
    data.title = document.title
  }

  var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
  if(descriptionTag) {
    data.description = descriptionTag.getAttribute("content")
  }

  return data;
}

var extractFlights = function extractFlights() {
  var data = {
    departingAirport: "",
    arrivingAirport: "",
    airports: [],
    allFlights: [],
    numFlights: ""
  };

  // When the user chooses a specific airport for both the departing and arriving airports, the values are reliably outputted in the URL
  var urlArray = (document.location.href).split(';');
  var from = urlArray[1].split('=')[1].split(',');
  var to = urlArray[2].split('=')[1].split(',');

  if (from.length == 1) {
    data.departingAirport = from[0];
    data.airports.push(from[0]);
  }

  if (to.length == 1) {
    data.arrivingAirport = to[0];
    data.airports.push(to[0]);
  }

  var flights = document.querySelectorAll('a.EIGTDNC-d-X');
  data.numFlights = flights.length;

  for (var i = 0; i < flights.length; i++) {
    var flightInfo = {
      iti: "",
      numLayovers: "",
      layoverAirports: []
    };

    var flight = flights[i];

    var flightId = flight.parentElement.getAttribute("iti");
    flightInfo.iti = flightId;

    var numStopsElem = flight.getElementsByClassName("EIGTDNC-d-Qb")[0];
    if (numStopsElem) {
      var numStopsSplit = numStopsElem.innerHTML.split(" ");;
      if (numStopsSplit[0] == 'Nonstop') {
        flightInfo.numLayovers = 0;
      } else {
        flightInfo.numLayovers = Number(numStopsSplit[0]);
      }
    }

    var layoversElem = flight.getElementsByClassName("EIGTDNC-d-Z")[0];
    if (layoversElem) {
      var layoversArray;

      if (flightInfo.numLayovers == 1) { // ie. "2h 32m in YYZ"
        layoversArray = layoversElem.innerHTML.split(" ").slice(-1)
      } else { // ie. 
        layoversArray = layoversElem.innerHTML.split(", ")
      }

      flightInfo.layoverAirports = layoversArray;
    }

    // Add flight info to allFlights array
    data.allFlights.push(flightInfo); 
  }

  return data;
};

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractTags())
  } else if (request.action === 'process-flights') {
    sendResponse(extractFlights());
  }
}

ext.runtime.onMessage.addListener(onRequest);
