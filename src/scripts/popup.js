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


// var co2Emissions = () => {
//   var airports = [];
//   var airportA = new Object();
//   airportA.id = 'YVR';
//   airportA.lat = 49.193901062;
//   airportA.long = -123.183998108;
//   var airportB = new Object();
//   airportB.id = 'LGW';
//   airportB.lat = 51.148101806640625;
//   airportB.long = -0.19027799367904663;
//   airports.push(airportA, airportB);

//   return(`
//   <div class="site-description">
//     <h3>CO2 emissions from ${airports[0].id} to ${airports[1].id}: ${Math.round(totalEmissions(airports, 'one-way') / 1000  * 10) / 10}t</h3>
//   </div>
//   `)
// }

var template = () => {
  return (`
  <div class="action-container">
    <ul class="dropdown list-unstyled">
      <li class="dropdown-item active"><a href="" data-label="CO2">CO2 Emissions</a></li>
      <li class="dropdown-item"><a href="" data-label="a banana">Bananas</a></li>
      <li class="dropdown-item"><a href="" data-label="a year's worth of wine">A year of wine</a></li>
      <li class="dropdown-item"><a href="" data-label="average North American">Average North American</a></li>
    </ul>
  </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}

document.addEventListener("DOMContentLoaded", function() {
  var displayContainer = document.getElementById("display-container")
  displayContainer.innerHTML = template();
});

// ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   var activeTab = tabs[0];
//   // Output # of flights
//   chrome.tabs.sendMessage(activeTab.id, { action: 'process-flights' }, renderFlights);
// });


popup.addEventListener("click", function(e) {

    e.preventDefault();
    var relateToLabel;
    var dropdownItems = document.querySelectorAll('.dropdown-item');
    if (e.target.getAttribute("data-label")) {
      relateToLabel = e.target.getAttribute("data-label");
      // Remove active class for siblings
      for (var i = 0; i < dropdownItems.length; i++) {
        if (dropdownItems[i].classList.contains('active')) {
          dropdownItems[i].classList.remove('active');
          break;
        }
      }
      // Add active class to selected dropdown item
      e.target.parentElement.classList.add('active')

      ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'set-attribute', data: relateToLabel });
      });
    }
});

// popup.addEventListener("click", function(e) {
//   if (e.target && e.target.matches("#save-btn")) {
//     e.preventDefault();
//     var data = e.target.getAttribute("data-bookmark");
//     ext.runtime.sendMessage({ action: "get-airports", data: data }, function(response) {
//       if (response && response.action === "have-airports") {
//         console.log("have-airport response:", response);
//         renderMessage("have airports");

//         ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
//           var activeTab = tabs[0];
//           // Output # of flights
//           chrome.tabs.sendMessage(activeTab.id, { action: 'insert-content', data: response.data });
//         });
//       } else {
//         renderMessage("Sorry, there was an error.");
//       }
//     })
//   }
// });

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
})
