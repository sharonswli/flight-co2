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

var renderBookmark = (data) => {
  var displayContainer = document.getElementById("display-container")
  // var emissions = co2Emissions();
  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = template(data);
    // displayContainer.innerHTML = emmisions;  
  } else {
    // displayContainer.innerHTML = emissions; 
    renderMessage("Sorry, could not extract this page's title and URL")
  }
}

ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderBookmark);
});

popup.addEventListener("click", function(e) {
  if(e.target && e.target.matches("#save-btn")) {
    e.preventDefault();
    var data = e.target.getAttribute("data-bookmark");
    ext.runtime.sendMessage({ action: "perform-save", data: data }, function(response) {
      if(response && response.action === "saved") {
        renderMessage("Your bookmark was saved successfully!");
      } else {
        renderMessage("Sorry, there was an error while saving your bookmark.");
      }
    })
  }
});

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
})
