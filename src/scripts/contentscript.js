import ext from "./utils/ext";

function getDepartureArrivalAirports() {
  var urlArray = (document.location.href).split(';');
  
  var from = urlArray[1].split('=')[1].split(',');
  var to = urlArray[2].split('=')[1].split(',');

  var departingAirport;
  var arrivingAirport;

  // TODO: handle 'all airports' selection  
  from.length === 1 ? departingAirport = from[0] : departingAirport = 'undefined';
  to.length === 1 ? arrivingAirport = to[0] : arrivingAirport = 'undefined';

  return { from: departingAirport, to: arrivingAirport };
}

function checkIfResultsLoaded() {
  var flights = document.querySelectorAll('a.EIGTDNC-d-X');
  
  // If flights results are not loaded in DOM, abort
  if(!flights.length || !flights) {
    console.log("Flights not yet loaded. Aborting...");
    return;
  }
  // If results are loaded: 
  const destination = getDepartureArrivalAirports();
  const flightResults = extractFlights(flights, destination);

  buildResultData(destination, flights.length, flightResults);
}

function buildResultData(destination, numFlights, flightResults) {
  const flightData = {
    departingAirport: "",
    arrivingAirport: "",
    allFlights: [],
    numFlights: null
  };
  
  // Input departingAirport and arrivingAirport data
  if(destination && destination.from && destination.to) {
    flightData.departingAirport = destination.from;
    flightData.arrivingAirport = destination.to;
  }

  // Input numFlights
  if(numFlights) {
    flightData.numFlights = numFlights;
  }

  if(flightResults) {
    flightData.allFlights = flightResults;
  }
  console.log("flightData: ", flightData);
  return flightData;
}

function extractFlights(flights, destination) {  
  const flightResuts = [];
  // Get allFlights Array
  for (var i = 0; i < flights.length; i++) {
    var flight = flights[i];
    
    var flightInfo = {
      id: "",
      numLayovers: "",
      flightRoute: []
    };

    var flightId = flight.parentElement.getAttribute("iti");
    flightInfo.id = flightId;

    var numStopsElem = flight.getElementsByClassName("EIGTDNC-d-Qb")[0];
    if (numStopsElem) {
      var numStopsSplit = numStopsElem.innerHTML.split(" ");;
      if (numStopsSplit[0] == 'Nonstop') {
        flightInfo.numLayovers = 0;
      } else {
        flightInfo.numLayovers = Number(numStopsSplit[0]);
      }
    }

    // Create flightRoute Array: init with departing Airport
    var flightroute = [destination.from];

    // Add Layover airports to flightroute array
    var layoversElem = flight.getElementsByClassName("EIGTDNC-d-Z")[0];
    if (layoversElem) {
      var layoversArray;

      if (flightInfo.numLayovers == 1) { // ie. "2h 32m in YYZ"
        layoversArray = layoversElem.innerHTML.split(" ").slice(-1)
      } else { // ie. YVR, YYZ
        layoversArray = layoversElem.innerHTML.split(", ")
      }
      flightInfo.flightRoute = flightroute.concat(layoversArray);
    }

    // Add arriving Airport at the end
    flightInfo.flightRoute.push(destination.to);

    // Add flight info to allFlights array  
    flightResuts.push(flightInfo); 
  }

  return flightResuts;
};

function onRequest(request, sender, sendResponse) {
  switch(request.action) {
    case 'query_flights': 
      console.log("querying flights...");
      // Check if flight info is already there
      sendResponse(checkIfResultsLoaded());    
      break;
    case 'process-flights': 
      console.log("processing flights...");
      break;
    default:
      console.log("action unknown");
  }
}

ext.runtime.onMessage.addListener(onRequest);

