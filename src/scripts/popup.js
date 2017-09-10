import ext from "./utils/ext";
import storage from "./utils/storage";
import {totalEmissions} from "./utils/co2-emissions-calculation";

var popup = document.getElementById("app");
storage.get('color', function(resp) {
  var color = resp.color;
  if(color) {
    popup.style.backgroundColor = color
  }
});


var co2Emissions = () => {
  var airports = [];
  var airportA = new Object();
  airportA.id = 'YVR';
  airportA.lat = 49.193901062;
  airportA.long = -123.183998108;
  var airportB = new Object();
  airportB.id = 'LGW';
  airportB.lat = 51.148101806640625;
  airportB.long = -0.19027799367904663;
  airports.push(airportA, airportB);

  return(`
  <div class="site-description">
    <h3>CO2 emissions from ${airports[0].id} to ${airports[1].id}: ${Math.round(totalEmissions(airports, 'one-way') / 1000  * 10) / 10}t</h3>
  </div>
  `)
}

var template = (data) => {
  var json = JSON.stringify(data);
  return (`
  <div class="site-description">
    <h3 class="title">${data.title}</h3>
    <p class="description">${data.description}</p>
    <p>Flights evaluated: ${data.numFlights}</p>
    <a href="${data.url}" target="_blank" class="url">${data.url}</a>
  </div>
  <div class="action-container">
    <button data-bookmark='${json}' id="save-btn" class="btn btn-primary">Save</button>
  </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}

var renderFlights = function renderFlights(data) {
  var displayContainer = document.getElementById("display-container")
  if (data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl; 
  } else {
    renderMessage("Sorry, could not extract flight information")
  }
}

ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  // Output # of flights
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-flights' }, renderFlights);
});

popup.addEventListener("click", function(e) {
  if (e.target && e.target.matches("#save-btn")) {
    e.preventDefault();
    var data = e.target.getAttribute("data-bookmark"); 
    ext.runtime.sendMessage({ action: "get-airports", data: data }, function(response) {
      if (response && response.action === "have-airports") {
        renderMessage("have airports");
        
        ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          // Output # of flights
          chrome.tabs.sendMessage(activeTab.id, { action: 'insert-content', data: response.data });
        });
      } else {
        renderMessage("Sorry, there was an error.");
      }
    })
  }
});

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
})

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM is loaded");
})