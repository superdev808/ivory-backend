const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "./../.env") });

const AppRoutes = require("./routes/app-routes");
const CalculatorRoutes = require("./routes/calculator-routes");
const WorkflowRoutes = require("./routes/workflow-routes");
const UserRoutes = require("./routes/user-routes");
const PublicRoutes = require("./routes/public-routes");

const app = express();

app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 63072000, // HSTS set to 2 years (default by Mozilla)
    includeSubDomains: true,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "connect-src": ["'self'"],
      "default-src": ["none"],
      "frame-ancestors": ["none"],
    },
  })
);
app.use(
  helmet.frameguard({
    action: "deny",
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const router = express.Router();
const port = process.env.PORT || 8000;
app.set("port", port);

AppRoutes.getRoutes(app, router);
CalculatorRoutes.getRoutes(app, router);
WorkflowRoutes.getRoutes(app, router);
UserRoutes.getRoutes(app, router);
PublicRoutes.getRoutes(app, router);

app.use(
  "/v1/",
  cors({
    optionsSuccessStatus: 200,
    credentials: true,
    origin: [
      "https://ig-dev.zensol.app",
      "http://localhost:3000",
      "https://igdevelopment.app",
      "https://ivoryguide.com",
      "https://staging.ivoryguide.com",
      "https://www.ivoryguide.com",
      "https://www.igdevelopment.app",
    ],
  }),
  router
);

const mongoose = require("mongoose");

if (process.env.CURRENT_ENV !== "prod") {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: false });
}

console.log(process.env.MongoDbUri);
mongoose.connect(process.env.MongoDbUri).then(
  () => {
    console.log("Connected to MongoDB");
    const CalculatorModel = require("./models/calculator-models");
    const { createModel } = require("./models/schema");
    const UploadProgressModel = require("./models/upload-progress");

    CalculatorModel.getCalculators().exec().then((calculators) => {
      calculators.forEach((calculator) => {
        createModel(calculator.type, calculator.collectionName);
      });
      console.info("Successfully initialized all calculators");
    });
    UploadProgressModel.deleteMany({}).exec();
    // CalculatorModel.insertMany(
    //   CALCULATORS.map((calculator) => ({
    //     ...calculator,
    //     collectionName: calculator.type,
    //   }))
    // );
  },
  async (err) => {
    console.error(err);
    return;
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
