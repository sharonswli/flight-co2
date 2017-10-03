function convertCO2(original, convertTo){
  return Math.round((original / convertTo)*100)/100;
}

export {convertCO2};
