import ext from "./utils/ext";

function getDepartureArrivalAirports() {
  var urlArray = (document.location.href).split(';');
  
  var from = urlArray[1].split('=')[1].split(',');
  var to = urlArray[2].split('=')[1].split(',');

  var departingAirport;
  var arrivingAirport;

  from.length === 1 ? departingAirport = from[0] : departingAirport = 'undefined';
  to.length === 1 ? arrivingAirport = to[0] : arrivingAirport = 'undefined';

  return { from: departingAirport, to: arrivingAirport };
}


function extractFlights() {
  var flightData = {
    departingAirport: "",
    arrivingAirport: "",
    allFlights: [],
    numFlights: ""
  };

  var flights = document.querySelectorAll('a.EIGTDNC-d-X');

  // Check if flight infos are completely loaded on DOM  
  if(flights.length < 1) {
    console.log("Flights not yet loaded. Aborting...");
    return;
  }

  // Load number of flights to flightData object
  flightData.numFlights = flights.length;

  // Get new destination airports: the values are reliably outputted in the URL
  var destination = getDepartureArrivalAirports();
  if(destination && destination.from && destination.to) {
    flightData.departingAirport = destination.from;
    flightData.arrivingAirport = destination.to;
  }

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
    flightData.allFlights.push(flightInfo); 
  }
  console.log("flightData: ", flightData);
  return flightData;
};

function onRequest(request, sender, sendResponse) {
  switch(request.action) {
    case 'query_flights': 
      console.log("querying flights...");
      // Check if flight info is already there
      sendResponse(extractFlights());    
      break;
    case 'process-flights': 
      console.log("processing flights...");
      break;
    default:
      console.log("action unknown");
  }
}

ext.runtime.onMessage.addListener(onRequest);

// window.addEventListener ("load", main, false);

// function main (event) {

//   // destinations: { from: string, to: string }
//   var destinations = getDepartureArrivalAirports();
//   console.log()
// }
