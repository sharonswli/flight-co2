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


var template = () => {
  return (`
  <div class="action-container">
    <ul class="dropdown list-unstyled">
      <li class="dropdown-item active"><a href="" data-label="CO2">CO2 Emissions</a></li>
      <li class="dropdown-item"><a href="" data-label="a banana">Bananas</a></li>
      <li class="dropdown-item"><a href="" data-label="a burger">Burgers</a></li>
      <li class="dropdown-item"><a href="" data-label="1kg of household waste">1kg Household waste</a></li>
      <li class="dropdown-item"><a href="" data-label="a 2 mile car journey">A 2 mile car journey</a></li>
      <li class="dropdown-item"><a href="" data-label="a year's worth of wine">A year of wine</a></li>
      <li class="dropdown-item"><a href="" data-label="a large wedding (300 guests)">a large wedding (300 guests)</a></li>
      <li class="dropdown-item"><a href="" data-label="average North American">Average North American</a></li>
      <li class="dropdown-item"><a href="" data-label="average Canadian">Average Canadian</a></li>
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


var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
})
