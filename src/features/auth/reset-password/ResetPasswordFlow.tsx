"use client";

import { useState } from "react";
import { ResetEmailStep } from "./ResetEmailStep";
import { ResetPasswordStep } from "./ResetPasswordStep";

type ResetStep = "email" | "password";

export function ResetPasswordFlow() {
  const [step, setStep] = useState<ResetStep>("email");
  const [correo, setCorreo] = useState("");

  if (step === "password" && correo) {
    return (
      <ResetPasswordStep
        correo={correo}
        onBack={() => {
          setStep("email");
          setCorreo("");
        }}
      />
    );
  }

  return (
    <ResetEmailStep
      onSuccess={(nextCorreo) => {
        setCorreo(nextCorreo);
        setStep("password");
      }}
    />
  );
}
