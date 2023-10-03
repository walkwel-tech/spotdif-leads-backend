import axios from "axios";
import { checkAccess } from "../../app/Middlewares/serverAccess";

const POST = "post";

export const fullySignupForNonBillableClients = async (details: Object) => {
  return new Promise((resolve, reject) => {
    let config = {
      method: POST,
      url: process.env.NON_BILLABLE_CLIENT_SIGNUP_WEBHOOK_URL,
      headers: {
        "Content-Type": "application/json",
        "API-KEY": process.env.BUSINESS_DETAILS_SUBMISSION_API_KEY,
      },
      data: details,
    };
    if (checkAccess()) {
      axios(config)
        .then(async (response) => {
          console.log(
            "fullySignupForNonBillableClients webhook hits successfully",
            response.data
          );
        })
        .catch((err) => {
          console.log(
            "fullySignupForNonBillableClients webhook hits error",
            err.response?.data
          );
        });
    } else {
      console.log(
        "No Access for hitting business submission webhook to this " +
          process.env.APP_ENV
      );
    }
  });
};
