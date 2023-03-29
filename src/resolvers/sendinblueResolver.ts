import { Arg, Query, Resolver } from "type-graphql";
import * as SibApiV3Sdk from "@sendinblue/client";

@Resolver()
export default class SendinBlueResolver {
  @Query(() => String)
  async SendMail(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("reason") reason: string,
  ): Promise<string> {
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

    let status;
    let response;

    await apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        status = data.response.statusCode;
      })
      .catch((error) => {
        console.warn(error);
      });
    if (status === 201) {
      response = "Mail sent successfully";
    } else {
      response = "Something went wrong";
    }
    return `${response}`;
  }
}
