const _ = require("lodash");
const { OUTPUT_LABELS } = require("./constant");

/**
 * Validates a quiz response to ensure it is not null and has a non-empty _doc property.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {boolean} - True if the quiz response is valid, otherwise false.
 */
const validateQuizResponse = (quizResponse) =>
  quizResponse && !_.isEmpty(quizResponse._doc);

/**
 * Formats the quiz response containing information about implant drill kit and drill sequence.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatDrillkitAndSequence = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  // Destructure relevant information from the quizResponse
  const {
    _doc: {
      "Drill Kit Name": implantDrillKitName = "",
      "Drill Kit Item Number": drillKitItemNumber = "",
      "Drill Kit Link to Purchase": linkToDrillKit = "",
      ...restDrills
    },
  } = quizResponse;

  // Copy the remaining drill data into a new object
  const drillsData = { ...restDrills };
  
  // Initialize an array to store the converted drill information
  const convertedDrillsArray = [];

  // Iterate over the drill data
  for (let i = 1; drillsData[`Drill ${i} Name`]; i++) {
    const nameKey = `Drill ${i}`;
    const linkKey = `${nameKey} Link to Purchase`;
    const itemNumberKey = `${nameKey} Item Number`;

    // Extract individual drill details
    const itemName = _.trim(drillsData[`Drill ${i} Name`]) || "";
    const link =  _.trim(drillsData[linkKey]) || "";
    const itemNumber = drillsData[itemNumberKey] || "";
    const quantity = !!link && link !== "-" ? 1 : null;

    // Check if the name is not null and not "No Drill Sequence" before adding to the array
    if (itemName !== null && itemName !== "No Drill Sequence") {
      convertedDrillsArray.push({ itemName, link, itemNumber, quantity });
    }
  }

  // Format the final response with labeled information
  return [
    {
      label: OUTPUT_LABELS.IMPLANT_DRILL_KIT,
      info: [
        {
          itemName: implantDrillKitName,
          itemNumber: drillKitItemNumber,
          link: linkToDrillKit,
          quantity: !!linkToDrillKit && linkToDrillKit !== "-" ? 1 : null,
        },
      ],
    },
    {
      label: OUTPUT_LABELS.DRILL_SEQUENCE,
      info: convertedDrillsArray,
    },
  ];
};

/**
 * Formats the quiz response containing information about bone reduction kits.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatBoneReduction = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  // Destructure relevant information from the quizResponse
  const {
    _doc: {
      "Bur Kit Name (Bone Reduction)": burKitName = "",
      "Item Code": burKitItemNumber = "",
      "Link to Purchase": linkToBurKit = "",
      "Bur Kit (Denture Conversion) Name": surgicalBurKitName = "",
      "Bur Link to Purchase": surgicalBurKitLink = ""
    },
  } = quizResponse;

  if (!(burKitName && surgicalBurKitName)) {
    return [];
  }

  // Format and return the bone reduction information
  return [
    {
      label: OUTPUT_LABELS.BUR_KIT,
      info: [
        {
          itemName:  _.trim(burKitName),
          itemNumber: burKitItemNumber,
          link:  _.trim(linkToBurKit),
          quantity: !!linkToBurKit ? 1 : null,
        },
      ],
    },
    {
      label: OUTPUT_LABELS.SURGICAL_BUR_KIT,
      info: [
        {
          itemName:  _.trim(surgicalBurKitName),
          itemNumber: null,
          link:  _.trim(surgicalBurKitLink),
          quantity: !!surgicalBurKitLink ? 1 : null,
        },
      ],
    },
  ];
};

/**
 * Formats the quiz response containing information about the master implant driver.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatMasterImplantDriver = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  const {
    _doc: {
      "Item Name": itemName = "",
      "Item Number": itemNumber = "",
      "Link to Purchase": link = "",
    },
  } = quizResponse;

  // Format the final response with labeled information
  return [
    {
      label: OUTPUT_LABELS.IMPLANT_DRIVER,
      info: [
        {
          itemName,
          itemNumber,
          link,
          quantity: !!link ? 1 : null,
        },
      ],
    },
  ];
};

/**
 * Formats the quiz response containing information about chair-side pick-up items.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatChairSidePickUp = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  const {
    _doc: {
      "Luting Agent Name": lutingAgentName = "",
      "Luting Agent Link to Purchase": lutingAgentLink = "",
      "Teflon Tape": teflonTape = "",
      "Teflon Tape Link to Purchase": teflonTapeLink = "",
      "Material to close screw access hole Name": materialName = "",
      "Material to close screw access hole link to purchase":
        materialLink = "",
    },
  } = quizResponse;
  const result = [];
  if (!!lutingAgentName) {
    result.push({
      label: OUTPUT_LABELS.LUTING_AGENT,
      info: [
        {
          itemName: _.trim(lutingAgentName),
          itemNumber: "",
          link: _.trim(lutingAgentLink),
          quantity: !!lutingAgentLink ? 1 : null,
        },
      ],
    })
  }
  if (!!teflonTape) {
    result.push({
      label: OUTPUT_LABELS.TEFLON_TAPE,
      info: [
        {
          itemName: _.trim(teflonTape),
          itemNumber: "",
          link: _.trim(teflonTapeLink),
          quantity: !!teflonTapeLink ? 1 : null,
        },
      ],
    })
  }
  if (!!materialName) {
    result.push({
      label: OUTPUT_LABELS.MATERIAL_CLOSE_ACCESS_HOLE,
      info: [
        {
          itemName: _.trim(materialName),
          itemNumber: "",
          link: _.trim(materialLink),
          quantity: !!materialLink ? 1 : null,
        },
      ],
    })
  }
  return result;
};

/**
 * Formats the quiz response containing information about implant purchase.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatImplantPurchase = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  const {
    _doc: {
      "Item Name": implantName = "",
      "Link to Purchase": link = "",
      "Item Number": itemNumber = "",
    },
  } = quizResponse;

  if (!(implantName && link && itemNumber)) {
    return [];
  }

  // Format the final response with labeled information
  return [
    {
      label: OUTPUT_LABELS.IMPLANT,
      info: [
        {
          itemName: _.trim(implantName),
          itemNumber,
          link,
          quantity: !!link ? 1 : null,
        },
      ],
    },
  ];
};

/**
 * Formats the quiz response containing information about implant purchase.
 * @param {Object} quizResponse - The quiz response object.
 * @returns {Array} - Formatted quiz response with labeled information or [] if the input is invalid.
 */
const formatScanbodies = (quizResponse = null) => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse)) {
    return [];
  }

  const {
    _doc: {
      Manufacturer= "",
      "Link to Purchase": link = "",
      "Item Name": itemName = "",
      "Scanbody Item Number": itemNumber = "",
      "Notes": notes = "",
      "Interface/ Cross-Compatibility": interface = "",
      Rx = "" ,
      Driver = "",
      Screw = ""
    },
  } = quizResponse;

  // Format the final response with labeled information
  return [
    {
      label: OUTPUT_LABELS.SCANBODIES,
      info: [
        {
          itemName:  _.trim(itemName),
          itemNumber,
          link,
          quantity: !!link ? 1 : null,
          Manufacturer,
          "Notes": notes,
          "Interface/ Cross-Compatibility": interface,
          "RX" : Rx,
          Driver,
          Screw
        },
      ],
    },
  ];
};

const formatCommonResponse = (quizResponse = null, labelName = "") => {
  // Check if the quizResponse is valid
  if (!validateQuizResponse(quizResponse) && !labelName) {
    return [];
  }

  const {
    _doc: {
      "Item Name": itemName = "",
      "Link to Purchase": link = "",
      "Item Number": itemNumber = "",
    },
  } = quizResponse;

  if (!(itemName && link && itemNumber)) {
    return [];
  }

  // Format the final response with labeled information
  return [
    {
      label: labelName,
      info: [
        {
          itemName: _.trim(itemName),
          itemNumber,
          link: _.trim(link),
          quantity: !!link ? 1 : null,
        },
      ],
    },
  ];
};

module.exports = {
  validateQuizResponse,
  formatDrillkitAndSequence,
  formatBoneReduction,
  formatMasterImplantDriver,
  formatChairSidePickUp,
  formatImplantPurchase,
  formatScanbodies,
  formatCommonResponse
};
