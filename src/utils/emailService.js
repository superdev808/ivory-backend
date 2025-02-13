const Mailjet = require("node-mailjet");
const fs = require("fs").promises;
const path = require("path");
const { imageToDataURI } = require("./helper");
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "",
});

const sendVerificationEmail = async (user, verificationToken) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "verification-email.html"
  );
  let htmlTemplate = await fs.readFile(templatePath, "utf8");

  // Replace the placeholders with the actual values
  htmlTemplate = htmlTemplate.replace(/{{FIRST_NAME}}/g, user.firstName);
  htmlTemplate = htmlTemplate.replace(
    /{{FRONTEND_URL}}/g,
    process.env.FRONTEND_URL
  );
  htmlTemplate = htmlTemplate.replace(
    /{{VERIFICATION_TOKEN}}/g,
    verificationToken
  );

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: user.email.toLowerCase(),
            Name: `${user.firstName} ${user.lastName}`,
          },
        ],
        Subject: "Welcome to Ivory Guide!",
        TextPart: `Thanks for registering with Ivory Guide!. Confirm your email address to activate your Ivory Guide account by clicking this line: ${process.env.FRONTEND_URL}/verify?token=${verificationToken}`,
        HTMLPart: htmlTemplate,
      },
    ],
  });

  request
    .then((result) => result)
    .catch((err) => {
      throw new Error(err.message);
    });
};

const sendResetPasswordEmail = async (user, token) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "reset-password-email.html"
  );
  let htmlTemplate = await fs.readFile(templatePath, "utf8");

  // Replace the placeholders with the actual values
  htmlTemplate = htmlTemplate.replace(/{{FIRST_NAME}}/g, user.firstName);
  htmlTemplate = htmlTemplate.replace(
    /{{FRONTEND_URL}}/g,
    process.env.FRONTEND_URL
  );
  htmlTemplate = htmlTemplate.replace(/{{TOKEN}}/g, token);

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: user.email.toLowerCase(),
            Name: `${user.firstName} ${user.lastName}`,
          },
        ],
        Subject: "Reset your password",
        TextPart: `Reset your Ivory Guide account password by clicking this line: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        HTMLPart: htmlTemplate,
      },
    ],
  });

  request
    .then((result) => result)
    .catch((err) => {
      throw new Error(err.message);
    });
};

const sendContactNotification = async (
  name,
  email,
  phone,
  zip,
  role,
  message
) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "contact-notification.html"
  );
  let htmlTemplate = await fs.readFile(templatePath, "utf8");

  htmlTemplate = htmlTemplate.replace(/{{name}}/g, name);
  htmlTemplate = htmlTemplate.replace(/{{email}}/g, email.toLowerCase());
  htmlTemplate = htmlTemplate.replace(/{{phone}}/g, phone);
  htmlTemplate = htmlTemplate.replace(/{{zip}}/g, zip);
  htmlTemplate = htmlTemplate.replace(/{{role}}/g, role);
  htmlTemplate = htmlTemplate.replace(/{{message}}/g, message);

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: "support@ivoryguide.com",
            Name: "Ivory Guide",
          },
        ],
        Subject: `[Contact Us] New Message from ${name}`,
        TextPart: `Hello Team, We've received a new message. Here are the details of the submission for your review and action:
				Name: {{name}} |
				Email: {{email}} |
				Phone: {{phone}} |
				Zip Code: {{zip}} |
				Role: {{role}} |
				Message: {{message}}`,
        HTMLPart: htmlTemplate,
      },
    ],
  });

  request
    .then((result) => result)
    .catch((err) => {
      throw new Error(err.message);
    });
};

const sendCalculatorSummaryEmail = async (info) => {
  try {
    const { emails, pdfBuffer, calculatorName, filename } = info;
    const text = `Please see summary of ${calculatorName} in the attached document.`;

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "summary-email.html"
    );
    let htmlTemplate = await fs.readFile(templatePath, "utf8");

    // Replace the placeholders with the actual values
    htmlTemplate = htmlTemplate.replace(
      /{{FRONTEND_URL}}/g,
      process.env.FRONTEND_URL
    );
    htmlTemplate = htmlTemplate.replace(/{{TEXT}}/g, text);

    const emailOptions = {
      Messages: emails.map((email) => ({
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: email.toLowerCase(),
          },
        ],
        Subject: `IvoryGuide: ${calculatorName} Summary`,
        HTMLPart: htmlTemplate,
        Attachments: [
          {
            ContentType: "application/pdf",
            Filename: `${filename}.pdf`,
            Base64Content: pdfBuffer.toString("base64"),
          },
        ],
      })),
    };
    return await mailjet
      .post("send", { version: "v3.1" })
      .request({ Messages: emailOptions.Messages });
  } catch (err) {
    throw new Error(err.message);
  }
};

const sendCalculatorFeedbackEmail = async (info) => {
  try {
    const {
      name,
      feedbackCategory,
      message,
      imageBuffer,
      timestamp,
      fileName,
      calculatorName,
      userAnswers,
    } = info;

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "feedback-email.html"
    );
    let htmlTemplate = await fs.readFile(templatePath, "utf8");

    // Replace the placeholders with the actual values
    htmlTemplate = htmlTemplate.replace(/{{NAME}}/g, name);
    htmlTemplate = htmlTemplate.replace(/{{TIMESTAMP}}/g, timestamp);
    htmlTemplate = htmlTemplate.replace(
      /{{FEEDBACK_CATEGORY}}/g,
      feedbackCategory
    );
    htmlTemplate = htmlTemplate.replace(
      /{{FRONTEND_URL}}/g,
      process.env.FRONTEND_URL
    );
    htmlTemplate = htmlTemplate.replace(/{{TEXT}}/g, message);
    htmlTemplate = htmlTemplate.replace(/{{CALCULATOR_NAME}}/g, calculatorName);
    const userAnswersHTML = userAnswers
      .map(
        ({ colName, colText, answer }) => `
<p style="margin: auto">
  <b>${
    answer ? colName || colText : `<del>${colName || colText}</del>`
  }</b> : ${answer || ""}
</p>
`
      )
      .join("");
    htmlTemplate = htmlTemplate.replace(/{{USER_ANSWERS}}/g, userAnswersHTML);
    htmlTemplate = htmlTemplate.replace(
      /{{IMG_SCREENSHOT}}/g,
      imageBuffer
        ? `<img src="${imageToDataURI(
            imageBuffer,
            fileName
          )}" width="100%" height="100%" style="margin-top: 1rem;"></img>`
        : ""
    );
    const attachments = imageBuffer
      ? [
          {
            ContentType: "image/*",
            Filename: fileName,
            Base64Content: imageBuffer.toString("base64"),
          },
        ]
      : [];

    const emailOptions = {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER || "",
            Name: name,
          },
          To: [
            {
              Email: "feedback@ivoryguide.com",
              Name: "Ivory Guide Feedback",
            },
          ],
          Subject: `IvoryGuide: Feedback`,
          HTMLPart: htmlTemplate,
          Attachments: attachments,
        },
      ],
    };

    return await mailjet
      .post("send", { version: "v3.1" })
      .request({ Messages: emailOptions.Messages });
  } catch (err) {
    throw new Error(err.message);
  }
};

const sendCalculatorHelpfulFeedbackEmail = async (info) => {
  try {
    const {
      name,
      feedbackCategory,
      message,
      timestamp,
      calculatorName,
      quiz,
      fileName,
      imageBuffer,
    } = info;

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "feedback-helpful-email.html"
    );
    let htmlTemplate = await fs.readFile(templatePath, "utf8");

    let quizData = "";
    Object.keys(quiz).forEach((quizKey) => {
      quizData += `<p>${quizKey}: ${quiz[quizKey]}</p>`;
    });

    // Replace the placeholders with the actual values
    htmlTemplate = htmlTemplate.replace(/{{NAME}}/g, name);
    htmlTemplate = htmlTemplate.replace(/{{TIMESTAMP}}/g, timestamp);
    htmlTemplate = htmlTemplate.replace(
      /{{FEEDBACK_CATEGORY}}/g,
      feedbackCategory
    );
    htmlTemplate = htmlTemplate.replace(/{{CALC_NAME}}/g, calculatorName);

    htmlTemplate = htmlTemplate.replace(/{{QUIZ_DATA}}/g, quizData);

    htmlTemplate = htmlTemplate.replace(
      /{{FRONTEND_URL}}/g,
      process.env.FRONTEND_URL
    );
    htmlTemplate = htmlTemplate.replace(/{{TEXT}}/g, message);

    const attachments = imageBuffer
      ? [
          {
            ContentType: "image/*",
            Filename: fileName,
            Base64Content: imageBuffer.toString("base64"),
          },
        ]
      : [];

    const emailOptions = {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER || "",
            Name: name,
          },
          To: [
            {
              Email: "feedback@ivoryguide.com",
              Name: "Ivory Guide Feedback",
            },
          ],
          Subject: `IvoryGuide: ${calculatorName} Feedback`,
          HTMLPart: htmlTemplate,
          Attachments: attachments,
        },
      ],
    };

    return await mailjet
      .post("send", { version: "v3.1" })
      .request({ Messages: emailOptions.Messages });
  } catch (err) {
    throw new Error(err.message);
  }
};

const sendRequestNotification = async (
  name,
  email,
  phone,
  featureType,
  productTypes,
  message,
  discuss
) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "request-notification.html"
  );
  let htmlTemplate = await fs.readFile(templatePath, "utf8");

  htmlTemplate = htmlTemplate.replace(/{{name}}/g, name);
  htmlTemplate = htmlTemplate.replace(/{{email}}/g, email.toLowerCase());
  htmlTemplate = htmlTemplate.replace(/{{phone}}/g, phone);
  htmlTemplate = htmlTemplate.replace(/{{featureType}}/g, featureType);
  htmlTemplate = htmlTemplate.replace(/{{productTypes}}/g, productTypes);
  htmlTemplate = htmlTemplate.replace(/{{message}}/g, message);
  htmlTemplate = htmlTemplate.replace(/{{discuss}}/g, discuss);

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: "support@ivoryguide.com",
            Name: "Ivory Guide",
          },
        ],
        Subject: `[Contact Us] New Message from ${name}`,
        TextPart: `Hello Team, We've received a new message. Here are the details of the submission for your review and action:
				Name: {{name}} |
				Email: {{email}} |
				Phone: {{phone}} |
				Type of Feature: {{featureType}} |
				Type of Products: {{productTypes}} |
				Message: {{message}} |
        Can Discuss: {{discuss}}`,
        HTMLPart: htmlTemplate,
      },
    ],
  });

  request
    .then((result) => result)
    .catch((err) => {
      throw new Error(err.message);
    });
};

const sendItemRequestNotification = async (
  name,
  email,
  phone,
  itemName,
  inputSummaries
) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "request-product-email.html"
  );
  let htmlTemplate = await fs.readFile(templatePath, "utf8");

  htmlTemplate = htmlTemplate.replace(/{{name}}/g, name);
  htmlTemplate = htmlTemplate.replace(/{{email}}/g, email.toLowerCase());
  htmlTemplate = htmlTemplate.replace(/{{phone}}/g, phone);
  htmlTemplate = htmlTemplate.replace(/{{itemName}}/g, itemName);
  const inputSummariesHtml = `<ul>
      ${inputSummaries
        .map(({ question, answer }) => `<li>${question} - ${answer}</li>`)
        .join("")}
    </ul>`;
  const inputSummariesText = inputSummaries.map(
    ({ question, answer }) => `${question} - ${answer}`
  );
  htmlTemplate = htmlTemplate.replace(
    /{{inputSummaries}}/g,
    inputSummariesHtml
  );

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER || "",
          Name: "Ivory Guide",
        },
        To: [
          {
            Email: "feedback@ivoryguide.com",
            Name: "Ivory Guide",
          },
        ],
        Subject: `[Contact Us] New Item Request from ${name}`,
        TextPart: `Hello Team, We've received a new item request. Here are the details of the submission for your review and action::
				Name: ${name} |
				Email: ${email} |
				Phone: ${phone} |
				Item Name: ${itemName} |
				Input Summaries: ${inputSummariesText}`,
        HTMLPart: htmlTemplate,
      },
    ],
  });

  request
    .then((result) => result)
    .catch((err) => {
      throw new Error(err.message);
    });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendCalculatorSummaryEmail,
  sendContactNotification,
  sendCalculatorFeedbackEmail,
  sendCalculatorHelpfulFeedbackEmail,
  sendRequestNotification,
  sendItemRequestNotification,
};
