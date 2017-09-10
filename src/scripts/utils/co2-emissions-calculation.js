import {getTotalDistance} from './calculate-distance';

const SHORT_HAUL_MAX_DISTANCE = 1500
const LONG_HAUL_MIN_DISTANCE = 2500
const PLF = 0.77 // passenger load factor
const CF = 0.049 // emissions due to cargo (cargo factor)
const EF = 3.150 // emmissions due to combustion (emissions factor)
const PPF = 0.51 // emmissions due to production (pre-production factor)
const MULTIPLIER = 2 // accounts for non-CO2 greenhouse warming affects caused by flying

var fuel_consumption = function(distance) {
  if (distance <= SHORT_HAUL_MAX_DISTANCE) {
    var a, b, c;
    [a,b,c] = [0.0000387871, 2.9866, 1263.42]
  } else if (distance >= LONG_HAUL_MIN_DISTANCE) {
    var a, b, c;
    [a,b,c] = [0.000134576, 6.1798, 3446.20]
  } else {
    return linearApproximation(distance, fuel_consumption)
  }
  return a * Math.pow(distance, 2) + b * distance + c;
}

// we cannot simply double distance for round trip because the relationship between distance and emissions is not linear and because the distance for one way is not necessarily equal to the return distance. Instead, calculate for each way and add the results to get total emissions for return flight
// @Input = (airports: { id: string, lat: number, long: number }[], tripType: string)
// @Output = (co2Emissions: number)
var totalEmissions = function(airports, tripType) {
  let outboundDistance = getTotalDistance(airports) / 1000;
  let returnDistance = getTotalDistance(airports.reverse()) / 1000;

  switch(tripType) {
    case 'one-way':
      return co2Emissions(outboundDistance);
    case 'return':
      return co2Emissions(outboundDistance) + co2Emissions(returnDistance);
  }
}

// returns emissions for ONE WAY
var co2Emissions = function(distance) {
  return (fuel_consumption(distance) / (avgNumSeats(distance) * PLF)) * (1 - CF) * weightingFactor(distance) * (EF * MULTIPLIER + PPF)
}

var avgNumSeats = function(distance) {
  if (distance <= SHORT_HAUL_MAX_DISTANCE) {
    return 158.44;
  } else if (distance >= LONG_HAUL_MIN_DISTANCE) {
    return 280.39;
  } else {
    return linearApproximation(distance, avgNumSeats)
  }
}

var weightingFactor = function(distance) {
  if (distance <= SHORT_HAUL_MAX_DISTANCE) {
    return 0.960;
  } else if (distance >= LONG_HAUL_MIN_DISTANCE) {
    return 0.800;
  } else {
    return linearApproximation(distance, weightingFactor)
  }
}

var linearApproximation = function(distance, original_function) {
  if (distance < SHORT_HAUL_MAX_DISTANCE || distance > LONG_HAUL_MIN_DISTANCE) {
    return original_function(distance);
  }

  var slope = (original_function(LONG_HAUL_MIN_DISTANCE) - original_function(SHORT_HAUL_MAX_DISTANCE)) / (LONG_HAUL_MIN_DISTANCE - SHORT_HAUL_MAX_DISTANCE)
  var y_intercept = original_function(SHORT_HAUL_MAX_DISTANCE) - slope * SHORT_HAUL_MAX_DISTANCE
  return slope * distance + y_intercept;
}

export { totalEmissions };
