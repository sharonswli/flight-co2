import ext from "./utils/ext";

function getDepartureArrivalAirports() {
  var urlArray = (document.location.href).split(';');
  
  var from = urlArray[1].split('=')[1].split(',');
  var to = urlArray[2].split('=')[1].split(',');

  let departingAirport;
  let arrivingAirport;

  // TODO: handle 'all airports' selection  
  from.length === 1 ? departingAirport = from[0] : departingAirport = 'undefined';
  to.length === 1 ? arrivingAirport = to[0] : arrivingAirport = 'undefined';

  return { from: departingAirport, to: arrivingAirport };
}

function checkIfResultsLoaded() {
  var flights = document.querySelectorAll('a.DQX2Q1B-d-X');
  
  // If flights results are not loaded in DOM, abort
  if(!flights.length || !flights) {
    console.log("Flights not yet loaded. Aborting...");
    return;
  }
  // If results are loaded: 
  const destination = getDepartureArrivalAirports();
  const flightResults = extractFlights(flights, destination);

  return buildResultData(destination, flights.length, flightResults);
}

function buildResultData(destination, numFlights, flightResults) {
  // console.log("build: destionation: ", destination);
  // console.log("build: numFlights: ", numFlights);
  // console.log("build :flightResults: ", flightResults);

  const flightData = {
    departingAirport: "",
    arrivingAirport: "",
    airports: [],
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

    var numStopsElem = flight.getElementsByClassName("DQX2Q1B-d-Qb")[0];
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

    // // Add Layover airports to flightroute array
    // var flightroute = [data.departingAirport];

    flightInfo.flightRoute = flightroute

    var layoversElem = flight.getElementsByClassName("DQX2Q1B-d-Z")[0];
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

    //   flightInfo.flightRoute = flightroute.concat(layoversArray);
    // }

    // flightInfo.flightRoute.push(data.arrivingAirport);

    // // Add flight info to allFlights array
    // data.allFlights.push(flightInfo); 
  }

  return flightResuts;
};

var writeToScreen = function writeToScreen(iti, emissions, distance, index){
  if (iti) {
    var parentElem = document.querySelectorAll('[iti="'+iti+'"]')[0];
  } else {
    // This covers the edge case where one (assumed) div does not have an iti
    var problemElem = document.querySelectorAll('a.DQX2Q1B-d-X')[index];
    var parentElem = problemElem.parentElement;
  }

  var childElem = parentElem.getElementsByClassName("DQX2Q1B-d-Sb")[0];
  var newDiv = document.createElement("DIV");
  newDiv.style.color = "tomato";
  var message = "co2: " + emissions;
  newDiv.appendChild(document.createTextNode(message));
  if (childElem) {
    childElem.appendChild(newDiv);
  }
}

function onRequest(request, sender, sendResponse) {
  switch(request.action) {
    case 'query_flights': 
      console.warn("querying flights...");
      // Check if flight info is already there
      sendResponse(checkIfResultsLoaded());  
      break;
    case 'process-flights': 
      console.warn("processing flights...");
      sendResponse(checkIfResultsLoaded())
      break;
    case 'insert-content':
      for (var i=0; i<request.data.length; i++) {
        writeToScreen(request.data[i].id, request.data[i].emissions, request.data[i].distance, i);
      }
    break;
    default:
      console.log("action unknown");
  }
}

ext.runtime.onMessage.addListener(onRequest);
