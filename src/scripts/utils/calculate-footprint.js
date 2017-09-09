var dcMap = {
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

  return dcMap[type];
}

function 
