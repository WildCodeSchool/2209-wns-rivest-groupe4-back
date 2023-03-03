import express from "express";
import * as SibApiV3Sdk from "@sendinblue/client";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());

app.post("/sendMail", (req, res) => {
  const { name, email, reason } = req.body;
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { apiKey } = apiInstance.authentications;
  apiKey.apiKey = `${process.env.SIB_API_KEY}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `${name} vous a envoyé un message`;
  sendSmtpEmail.htmlContent = `<html><body><h1>codeless4 : </h1><p>${reason}</p></body></html>`;
  sendSmtpEmail.sender = { name: `${name}`, email: `${email}` };
  sendSmtpEmail.to = [{ email: "codeless4@outlook.fr", name: "codeless4" }];
  sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  sendSmtpEmail.params = {
    parameter: "My param value",
    subject: "New Subject",
  };

  apiInstance
    .sendTransacEmail(sendSmtpEmail)
    .then((data) => {
      console.warn(
        `API called successfully. Returned data: ${JSON.stringify(data)}`,
      );
      res.status(201).send("Message sent");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Something went wrong");
    });
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-restricted-syntax
  console.log("app running on port 5005!");
});
