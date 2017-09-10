var distanceCorrectionMap = {
  'longHaul': 125e3,
  'middleHaul': 100e3,
  'shortHaul': 50e3
};

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

function getDistanceCorrection(distance) {
  var type;
  switch(true) {
    case (distance > 2500e3):
      type = 'longHaul';
      break;
    case (distance < 1500e3):
      type = 'shortHaul';
      break;
    default: 
      type = 'middleHaul';
  };
  return distanceCorrectionMap[type];
}


function getGreaterCircleDistance(airportA, airportB) {
  var EARTH_RADIUS = 6371e3; // Earth's radius in meters
  
  var latA = Math.radians(airportA.lat);
  var latB = Math.radians(airportB.lat);

  var latDiff = Math.radians(airportB.lat - airportA.lat);
  var longDiff = Math.radians(airportB.long - airportA.long);

  var a = Math.sin(latDiff/2) * Math.sin(latDiff/2) + Math.cos(latA) * Math.cos(latB) * Math.sin(longDiff/2) * Math.sin(longDiff/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

// @Input (airports: { id: string, lat: number, long: number }[]) 
// @Output (distance: number)
function getTotalDistance(airports) {
  return airports.reduce(function(sum, value, index, rawArr) {
    
    // Check if last item in collection
    if(index === rawArr.length - 1) {
      return sum;
    }
    var gcdAB = getGreaterCircleDistance(value, rawArr[index + 1]);
    console.log(`gcd between ${value.id} and ${rawArr[index + 1].id} is: `, gcdAB);

    // get distance correction
    var offset = getDistanceCorrection(gcdAB);
    console.log("offset: ", offset);
    return sum + gcdAB + offset;
  }, 0);
}

export { getTotalDistance };