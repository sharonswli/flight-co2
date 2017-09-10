import ext from "./utils/ext";
import getTotalDistance from "./utils/calculate-distance";

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

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractTags())
  }
}

ext.runtime.onMessage.addListener(onRequest);

function getData(airports){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.extension.getURL('data/airport-data.json'), true);
  xhr.onreadystatechange = function()
  {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
      {
        var data = JSON.parse(xhr.responseText);
        var filtered = data.filter(function(airport) {
          // console.log(airport.iata_faa)
          return airports.includes(airport.iata_faa);
        });
        console.log(filtered);
        var distance = getTotalDistance(filtered);
        console.log(distance);
      }
  };
  xhr.send();
}
var airports = ['LAX', 'YVR'];
getData(airports);
