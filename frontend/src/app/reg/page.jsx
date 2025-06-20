"use client";

import { useState } from "react";

export default function Register() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Валидация логина: только латинские буквы и цифры
    const loginRegex = /^[a-zA-Z0-9]+$/;
    if (!loginRegex.test(login)) {
      setError("Логин должен содержать только латинские буквы и цифры.");
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Введите корректный адрес электронной почты.");
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    // Проверка длины пароля
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, email, password }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Ошибка регистрации.");
      } else {
        setSuccess("Регистрация успешна!");
        setLogin("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      setError("Ошибка соединения с сервером.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center w-full mt-[100px] gap-[20px]">
      <h1 className="text-[20px] font-bold">Регистрация</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-start gap-[10px]">
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="border-[2px] px-5 py-2 rounded-2xl w-[300px]"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-[2px] px-5 py-2 rounded-2xl w-[300px]"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-[2px] px-5 py-2 rounded-2xl w-[300px]"
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-[2px] px-5 py-2 rounded-2xl w-[300px]"
        />
        <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 w-[300px]">
          Зарегистрироваться
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </main>
  );
}
