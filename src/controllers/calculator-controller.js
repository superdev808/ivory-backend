const BoneReductionModel = require("../models/bone-reduction-model");
const ChairSidePickUpModel = require("../models/chair-side-pickup-model");
const CrownMaterialModel = require("../models/crown-material-model");
const DrillKitAndSequenceModel = require("../models/drillkit_and_sequence_model");
const HealingAbutmentsModel = require("../models/healing-abutments-model");
const ImplantAnalogsModel = require("../models/implant-analog-model");
const ImplantsModel = require("../models/implant-model");
const ImplantScrewsModel = require("../models/implant-screw-model");
const ImplantPurchaseModel = require("../models/implant_purchase_model");
const MasterImplantDriverModel = require("../models/master_implant_driver_model");
const RestorativeMultiUnitAbutmentsModel = require("../models/restorative-multi-unit-abutments-model");
const RestroativeDirectToImplantModel = require("../models/restroative-direct-to-implant-model");
const ScanbodyModel = require("../models/scanbody-model");
const { OUTPUT_TYPES } = require("../utils/constant");
const { getQuizData, getUniqueResult, getQuizQuery, getModelByCalculatorType } = require("../utils/helper");
const { formatDrillkitAndSequence, formatBoneReduction, formatMasterImplantDriver, formatChairSidePickUp, formatImplantPurchase } = require("../utils/outputFormatter");
const response = require("../utils/response");
const _ = require("lodash");

const fieldsToSearch = {
    'Scanbodies': ["Implant Brand", "Implant System", "Scanbody Item Number", "Manufacturer"],
    'Crown Materials': []
}

const modelMap = {
  BoneReduction: BoneReductionModel,
  ChairSidePickUp: ChairSidePickUpModel,
  DrillKitAndSequence: DrillKitAndSequenceModel,
  ImplantPurchase: ImplantPurchaseModel,
  MasterImplantDriver: MasterImplantDriverModel,
  Scanbodies: ScanbodyModel,
  "Crown Materials": CrownMaterialModel,
  RestroativeDirectToImplant: RestroativeDirectToImplantModel,
  RestorativeMultiUnitAbutments: RestorativeMultiUnitAbutmentsModel,
  HealingAbutments: HealingAbutmentsModel,
  ImplantAnalogs: ImplantAnalogsModel,
  ImplantScrews: ImplantScrewsModel,
  Implants: ImplantsModel
};

exports.getCalculatorOptions = async (req, res, next) => {
    const { type, quiz, fields } = req.body;

    const calculatorType = decodeURIComponent(type);

    let Model = getModelByCalculatorType(modelMap, calculatorType);

    if (!Model) {
        response.notFoundError(res, `${type} data is not existing`);
        return;
    }

    try {
        const query = quiz;
        const data = await Model.find(query);
        let result = [];
        if (fields.length > 1) {
            result = _.uniq(data.map((item) => {
                const res = {};
                fields.forEach(field => {
                    res[field] = item[field];
                });

                return res;
            }));
        } else {
            result = _.uniq(data.map((item) => item[fields[0]]));
        }

        response.success(res, result);
    } catch (ex) {
        response.serverError(res, { message: ex.message });
    }
}

exports.searchCalculator = async (req, res, next) => {
    const { text } = req.query;
    const modelNameMap = {'Scanbodies': ScanbodyModel, 'Crown Materials': CrownMaterialModel};

    try {
        const modelNames = [];
        for (const modelName of Object.keys(modelNameMap)) {
            const orFields = fieldsToSearch[modelName].map((field) => ({
                [field]: { $regex: new RegExp(text, 'i') }
            }));

            if (orFields.length) {
                const results = await modelNameMap[modelName].find({
                    $or: orFields
                });

                if (results.length) {
                    modelNames.push(modelName)
                }
            }
        }
        return response.success(res, modelNames);
    } catch (ex) {
        response.serverError(res, { message: ex.message });
    }
}

/**
 * Controller function to get options based on a specific calculator type.
 * @param {Object} req - Express request object with properties { type, quiz, fields, output }.
 * @param {Object} res - Express response object.
 */
exports.getAllOnXCalculatorOptions = async (req, res) => {
  try {
    // Destructure relevant properties from the request body
    const { type = "", quiz = {}, fields = [], output = "" } = req.body;

    const decodedCalculatorType = decodeURIComponent(type);

    const Model = getModelByCalculatorType(modelMap, decodedCalculatorType);

    // Check if the calculator type exists in the model map
    if (!Model) {
      return response.notFoundError(
        res,
        `${decodedCalculatorType} data does not exist`
      );
    }

    const quizData = await getQuizData(Model);
    const quizQuery = getQuizQuery(quizData, quiz) || {};
    // Fetch data from the selected model based on the quiz
    const data = await Model.find(quizQuery);
    let quizResponse = null;
    if (output) {
      const OutputModel = getModelByCalculatorType(modelMap, output);

      if (!OutputModel) {
        return response.notFoundError(
          res,
          `${decodedCalculatorType} data does not exist`
        );
      }
      const quizOutputData = await getQuizData(OutputModel);
      const quizOutputQuery = getQuizQuery(quizOutputData, quiz) || {};
      quizResponse = await getQuizData(OutputModel, quizOutputQuery, true);
      switch (output) {
        case OUTPUT_TYPES.DRILL_KIT_AND_SEQUENCE:
          quizResponse = formatDrillkitAndSequence(quizResponse);
          break;
        case OUTPUT_TYPES.BONE_REDUCTION:
          quizResponse = formatBoneReduction(quizResponse);
          break;
        case OUTPUT_TYPES.MASTER_IMPLANT_DRIVER:
          quizResponse = formatMasterImplantDriver(quizResponse);
          break;
        case OUTPUT_TYPES.CHAIR_SIDE_PICK_UP:
          quizResponse = formatChairSidePickUp(quizResponse);
          break;
        case OUTPUT_TYPES.IMPLANT_PURCHASE:
          quizResponse = formatImplantPurchase(quizResponse);
          break;
        default:
          quizResponse = [];
      }
    }

    const result = getUniqueResult(data, fields);
    const resp = { result };
    if (quizResponse) {
      resp["quizResponse"] = quizResponse;
    }
    response.success(res, resp);
  } catch (ex) {
    response.serverError(res, { message: ex.message });
  }
};
  
  