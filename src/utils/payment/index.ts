import axios from "axios";
import { PaymentInput } from "../../app/Inputs/Payment.input";
// import { RyftPaymentMethods } from "../../app/Models/RyftPaymentMethods";
// import { User } from "../../app/Models/User";
import { addCreditsToBuyer } from "./addBuyerCredit";
import { attemptToPayment, attemptToPaymentBy_PaymentMethods, createSession, createSessionInitial, refundPayment } from "./createPaymentToRYFT";

export const managePayments = (params: PaymentInput) => {
  console.log('DEBUGGER params--->>>>>',params)
    return new Promise((resolve, reject) => {
      createSession(params)
        .then((response: any) => {
          console.log("DEBUGGER 1--->", response)
          attemptToPayment(response,params)
            .then((data:any) => {
              console.log("DEBUGGER 2--->", data)

              addCreditsToBuyer(params).then((res)=>{
                  resolve(res)
              }).catch((err)=>{
                  reject(err.response?.data)
              })
            })
            .catch((err) => {
              reject(err.response?.data);
            });
        })
        .catch((err) => {
          reject(err.response?.data);
        });
    });
  };

export const fetchPaymentSessionById = (id:string)=>{
  return new Promise((resolve, reject) => {
    const config = {
      method: "GET",
      url: `https://api.ryftpay.com/v1/payment-sessions/${id}`,
      headers: {
        // Account: process.env.ACCOUNT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: process.env.RYFT_SECRET_KEY,
      },
    };
    axios(config)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        // reject(err);
        console.log("Create session error", err.response.data);
      });
  });
}


  export const  managePaymentsByPaymentMethods = (params:any) => {
    console.log('DEBUGGER params by payment method--->>>>>',params)

    return new Promise((resolve, reject) => {
      createSessionInitial(params)
        .then(async(res: any) => {
          console.log("DEBUGGER 1.1--->", res)          
          // customerPaymentMethods(res).then((response:any)=>{
            // console.log("DEBUGGER 1.2--->", response)

              attemptToPaymentBy_PaymentMethods(params?.paymentId,res.data.clientSecret)
            .then((data:any) => {
              resolve(data)
              // console.log("DEBUGGER 1.3--->", data)
              // addCreditsToBuyer(params).then((res)=>{
              //   console.log("credits added")

              //     resolve(res)
              // }).catch((err)=>{
              //     reject(err.response?.data)
              // })
            })          
            .catch((err) => {
              reject(err.response?.data);
            });
          })
          // .catch((err)=>{
          //   reject(err.response?.data)
          // })
        
        // })
        .catch((err) => {
          reject(err.response?.data);
        });
    });
  };


  export const managePaymentsForWeeklyPayment = (params: PaymentInput) => {
    return new Promise((resolve, reject) => {
      createSession(params)
        .then((response: any) => {
          attemptToPaymentBy_PaymentMethods(response,response.data.clientSecret)
            .then((data) => {
              resolve(data)
            })
            .catch((err) => {
              reject(err.response?.data);
            });
        })
        .catch((err) => {
          reject(err.response?.data);
        });
    });
  };
  

  export const managePaymentsWithRefund = (params: PaymentInput) => {
    return new Promise((resolve, reject) => {
      createSession(params)
        .then((response: any) => {
          attemptToPayment(response,params)
            .then((data:any) => {
              setTimeout(() => {
                refundPayment(data?.data).then((res:any)=>{
                  resolve(res)
                })
                .catch((err)=>{reject(err.response?.data)})
              }, 300000);
             
            })
            .catch((err) => {
              reject(err.response?.data);
            });
        })
        .catch((err) => {
          reject(err.response?.data);
        });
    });
  };


  export const manageInitialPayments = (params: PaymentInput) => {
    console.log('DEBUGGER params--->>>>>',params)
      return new Promise((resolve, reject) => {
        createSessionInitial(params)
          .then((response: any) => {
            console.log("DEBUGGER 1--->", response)
            attemptToPayment(response,params)
              .then((data:any) => {
                console.log("DEBUGGER 2--->", data)
  
                addCreditsToBuyer(params).then((res)=>{
                    resolve(res)
                }).catch((err)=>{
                    reject(err.response?.data)
                })
              })
              .catch((err) => {
                reject(err.response?.data);
              });
          })
          .catch((err) => {
            reject(err.response?.data);
          });
      });
    };
