"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

const USERNAME_ALLOWED_CHARACTERS = /[^a-zA-Z0-9._-]/g;
const MIN_PASSWORD_LENGTH = 8;

export function useLoginFormUi() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    password: false,
  });

  const usernameError =
    touchedFields.username && username.trim().length === 0
      ? "Ingresa tu usuario institucional."
      : "";

  const passwordError =
    touchedFields.password && password.length === 0
      ? "Ingresa tu contraseña."
      : touchedFields.password && password.length < MIN_PASSWORD_LENGTH
        ? "La contraseña debe tener al menos 8 caracteres."
        : "";

  const isSubmitDisabled =
    username.trim().length === 0 || password.length < MIN_PASSWORD_LENGTH;

  function handleUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    const cleanUsername = event.target.value.replace(USERNAME_ALLOWED_CHARACTERS, "");
    setUsername(cleanUsername);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function handleUsernameBlur() {
    setTouchedFields((fields) => ({ ...fields, username: true }));
  }

  function handlePasswordBlur() {
    setTouchedFields((fields) => ({ ...fields, password: true }));
  }

  function handleShowPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setShowPassword(event.target.checked);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouchedFields({ username: true, password: true });

    if (isSubmitDisabled) {
      return;
    }
  }

  return {
    username,
    password,
    showPassword,
    usernameError,
    passwordError,
    isSubmitDisabled,
    handleUsernameChange,
    handlePasswordChange,
    handleUsernameBlur,
    handlePasswordBlur,
    handleShowPasswordChange,
    handleSubmit,
  };
}