"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
   const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при входе");
      }

      // Сохраняем токены и имя пользователя в localStorage
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username);

      // Перенаправляем на главную страницу
      router.push("/");
    } catch (err) {
      setError(err.message || "Произошла ошибка при входе");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center w-full mt-20 gap-5">
      <h1 className="text-2xl font-bold">Войти</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-start gap-4">
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 px-5 py-2 rounded-2xl w-64"

        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 px-5 py-2 rounded-2xl w-64"
          
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 w-full"
        >
          Войти
        </button>
        <a href="/reg" className="text-blue-500 hover:underline">
          Вы еще не зарегистрированы?
        </a>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </main>
  );
}