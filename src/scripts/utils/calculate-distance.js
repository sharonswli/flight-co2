var distanceCorrectionMap = {
  'longHaul': 125,
  'middleHaul': 100,
  'shortHaul': 50
};

function getDistanceCorrection(distance) {
  var type;

  switch(true) {
    case (distance > 2500):
      type = 'longHaul';
      break;
    case (distance < 1500):
      type = 'shortHaul';
      break;
    default: 
      type = 'middleHaul';
  };

  return distanceCorrectionMap[type];
}

function getGreaterCircleDistance(airportA, airportB) {
  console.log("airportA: ", airportA);
  console.log("airportB: ", airportB);
}

// @Input (airports: string[])
// @Output (distance: number)
function getTotalDistance(airports) {
  // airports should implement { lat: number , long: number } where number is 6 decimal places

  airports.reduce(function(sum, value, index, rawArr) {
    // Check if last item in array
    if(index === rawArr.length - 1) {
      return sum;
    }
    var gcd = getGreaterCircleDistance(value, airports[index + 1]);
    return sum + gcd;
  }, 0)
}
console.log("Route 1");
getTotalDistance([ { id: 'YVR', lat: 49.193889, long: -123.184444 }, { id: 'CDG', lat: 49.012779, long: 2.55 } ]);
console.log("Route 2");
getTotalDistance([ { id: 'YVR', lat: 49.193889, long: -123.184444 }, { id: 'YYZ', lat: 43.677223, long: -79.630556 }, { id: 'CDG', lat: 49.012779, long: 2.55 } ]);
console.log("Route 3");
getTotalDistance([ { id: 'YVR', lat: 49.193889, long: -123.184444 }, { id: 'YYZ', lat: 43.677223, long: -79.630556 }, { id: 'CDG', lat: 49.012779, long: 2.55 }, { id: 'HKG', lat: 22.308919, long: 113.914603 } ]);