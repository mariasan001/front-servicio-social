"use client";

import { useState } from "react";

import { ResetEmailForm } from "./ResetEmailForm";
import { ResetCodeForm } from "./ResetCodeForm";

type ResetStep = "email" | "code";

export function ResetPasswordFlow() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("code");
  };

  return step === "email" ? (
    <ResetEmailForm onSubmit={handleEmailSubmit} />
  ) : (
    <ResetCodeForm email={email} onBack={() => setStep("email")} />
  );
}
