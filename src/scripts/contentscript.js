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
  return flights;
  // // If results are loaded: 
  // const destination = getDepartureArrivalAirports();
  // const flightResults = extractFlights(flights, destination);

  // return buildResultData(destination, flights.length, flightResults);
}


function buildResultData(flights) {
  // Final flightData response
  const flightData = {
    departingAirport: "",
    arrivingAirport: "",
    airports: [],
    allFlights: [],
    numFlights: null
  };
  
  const destination = getDepartureArrivalAirports();
  const flightResults = extractFlights(flights, destination);
    
  // Input departingAirport and arrivingAirport data
  if(destination && destination.from && destination.to) {
    flightData.departingAirport = destination.from;
    flightData.arrivingAirport = destination.to;
  }

  // Input numFlights
  if(flights && flights.length) {
    flightData.numFlights = flights.length;
  }

  if(flightResults) {
    flightData.allFlights = flightResults;
  }
  return flightData;
}

function processResultData(flightData) {
  const data = JSON.stringify(flightData);
  // Call get-airports in background.js
  ext.runtime.sendMessage({ action: "get-airports", data: data }, function(response) {
    if (response && response.action === "have-airports") {
      console.log("have-airport response:", response);
      
      // ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      //   var activeTab = tabs[0];
      //   // Output # of flights
      //   chrome.tabs.sendMessage(activeTab.id, { action: 'insert-content', data: response.data });
      // });
      for (var i=0; i < response.data.length; i++) {
        writeToScreen(response.data[i].id, response.data[i].emissions, response.data[i].distance);
      }
    } else {
      // renderMessage("Sorry, there was an error.");
      console.error("Sorry, there was an error.")
    }
  })
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
  }

  return flightResuts;
};

var writeToScreen = function writeToScreen(iti, emissions, distance, index){
  let flightEntry;

  if (iti) {
    console.log("case iti is defined: ", iti);
    flightEntry = document.querySelectorAll('[iti="'+iti+'"]')[0];
  } else {
    // This covers the edge case where one (assumed) div does not have an iti
    console.log("index:", index);
    console.log('query: ', document.querySelectorAll('a.DQX2Q1B-d-X'));
    var problemElem = document.querySelectorAll('a.DQX2Q1B-d-X')[index];
    console.log("problemElem: ", problemElem);
    if(problemElem) {
      flightEntry = problemElem.parentElement;    
    }
  }

  var stopsColumn = flightEntry.getElementsByClassName("DQX2Q1B-d-Sb")[0];

  if(stopsColumn) {
    let existingEmissionData = stopsColumn.getElementsByClassName("co2-emission");
    
    if (existingEmissionData && existingEmissionData.length > 0) {
      // stopsColumn.removeChild(existingEmissionData);
      for (let i = 0, n = existingEmissionData.length; i < n; i++) {
        existingEmissionData[i].remove();
      }
    }
  }

  // Create new text node: Assing className 'co2-emission' and style
  var newDiv = document.createElement("DIV");
  newDiv.className = "co2-emission";
  newDiv.style.color = "rgb(18, 177, 74)";
  newDiv.appendChild(document.createTextNode(`co2e(kg): ${emissions}`));
  stopsColumn.appendChild(newDiv);
  
}

function onRequest(request, sender, sendResponse) {
  
  let flights;

  switch(request.action) {
    case 'query_flights': 
      console.warn("querying flights...");
      // Check if flight info is already there
      flights = checkIfResultsLoaded();
      if(flights && flights.length > 0) {
        processResultData(buildResultData(flights));
        // sendResponse(buildResultData(flights));
      } 
      break;
    case 'process-flights': 
      console.warn("processing flights...");
      flights = checkIfResultsLoaded();
      if(flights && flights.length > 0) {
        sendResponse(buildResultData(flights));
      } 
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
