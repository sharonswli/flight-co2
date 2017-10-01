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

  var latA = Math.radians(airportA.latitude);
  var latB = Math.radians(airportB.latitude);

  var latDiff = Math.radians(airportB.latitude - airportA.latitude);
  var longDiff = Math.radians(airportB.longitude - airportA.longitude);

  var a = Math.sin(latDiff/2) * Math.sin(latDiff/2) + Math.cos(latA) * Math.cos(latB) * Math.sin(longDiff/2) * Math.sin(longDiff/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

export { getGreaterCircleDistance, getDistanceCorrection };