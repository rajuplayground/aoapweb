import React, { useEffect, useRef, useState } from "react";
import crypto from "crypto";

const PayProcessingForm = ({ txndetails }) => {
  const formRef = useRef(null);
  console.log(txndetails);

  const key = "aJ1WVm";
  const salt = "hKmYSMBAzg5QOw64IV9MFtcu6BKaIyYA";
  const hash = generateHash(txndetails, salt);

  function generateHash(input, salt) {
    let hashString =
      key +
      "|" +
      input["txnid"] +
      "|" +
      input["amount"] +
      "|" +
      input["productinfo"] +
      "|" +
      input["firstname"] +
      "|" +
      input["email"] +
      "|" +
      input["udf1"] +
      "||||||||||" +
      salt;
    console.log("hashstring", hashString);
    // Generate the hash
    const hash = sha512(hashString);

    return hash;
  }

  function sha512(str) {
    return crypto.createHash("sha512").update(str).digest("hex");
  }

  useEffect(() => {
    console.log("submit form");
    if (formRef.current) {
      console.log(txndetails);

      formRef.current.submit();
    }
  }, [txndetails]);
  return (
    <form
      ref={formRef}
      action="https://test.payu.in/_payment"
      method="post"
      className="flex flex-col"
    >
      <input type="hidden" name="key" value={key} />
      <input type="hidden" name="txnid" value={txndetails.txnid} />
      <input type="hidden" name="amount" value={txndetails.amount} />
      <input type="hidden" name="productinfo" value={txndetails.productinfo} />
      <input type="hidden" name="firstname" value={txndetails.firstname} />
      <input type="hidden" name="email" value={txndetails.email} />
      <input type="hidden" name="phone" value={txndetails.phone} />
      <input type="hidden" name="udf1" value={txndetails.udf1} />
      <input
        type="hidden"
        name="surl"
        value="http://amritha.edu/api/exam/paymentsuccess"
      />
      <input
        type="hidden"
        name="furl"
        value="http://amritha.edu/api/exam/paymentfailure"
      />
      <input type="hidden" name="hash" value={hash} />
    </form>
  );
};

export default PayProcessingForm;
