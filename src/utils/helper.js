const _ = require("lodash");
const { createModel } = require("../models/schema");
const mongoose = require("mongoose");

/**
 * function to get the appropriate model based on the calculator type.
 * @param {string} key - The calculator type.
 * @returns {Object|null} - The model corresponding to the calculator type, or null if not found.
 */
const getModelByCalculatorType = (key = "") => {
  try {
    return mongoose.model(key);
  } catch {
    return createModel(key, key);
  }
};

const sortCalculatorOptions = (fields) => (a, b) => {
  const priotizedBrands = [
    // Brand sorting
    "straumann",
    "neodent",
    "zimvie",
    "nobel biocare",
    "dentsply sirona",
    "biohorizons",
    // Shade Guide Conversation Sorting
    "IPS E-max Press Ingot Selection".toLowerCase(),
    "Dentsply Portrait IPN".toLowerCase(),
    "Ivoclar BlueLine".toLowerCase(),
    "Vita MFT".toLowerCase(),
    "Vita Classic with Bleached Shades".toLowerCase(),
    "Vita 3D Master with Bleached Shades".toLowerCase(),
    //Cementing / Bonding Sorting
    "Full Metal".toLowerCase(),
    "Resin".toLowerCase(),
    "PFM".toLowerCase(),
    "Porcelain".toLowerCase(),
    "Lithium Disilicate".toLowerCase(),
    "Zirconia".toLowerCase(),
  ];
  for (let field of fields) {
    let valA = (a[field] || "").toLowerCase();
    let valB = (b[field] || "").toLowerCase();
    
    let indexA = priotizedBrands.findIndex(brand => valA.startsWith(brand));
    let indexB = priotizedBrands.findIndex(brand => valB.startsWith(brand));
    if ((indexA >= 0 || indexB >= 0) && indexA !== indexB)
      return -(indexA - indexB);
    else if (indexA < 0 && indexB < 0 && valA !== valB)
      return valA.localeCompare(valB);
  }
  return 0;
};

// Function to convert image data to Data URI
const imageToDataURI = (bitmap, fileName) => {
  // Convert binary data to base64 encoded string
  const base64Image = Buffer.from(bitmap).toString("base64");

  // Get image file extension
  const ext = fileName.split(".").pop();

  // Construct Data URI
  const uri = `data:image/${ext};base64,${base64Image}`;

  return uri;
};

module.exports = {
  getModelByCalculatorType,
  sortCalculatorOptions,
  imageToDataURI,
};
