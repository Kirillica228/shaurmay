"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRefresh } from "../../../utils/fetchWithRefresh";

export default function PasswordModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetchWithRefresh("http://localhost:8000/api/order/confirm-password", {
        method: "POST",
        body:JSON.stringify({password})
    });
    console.log(res.data)
    if (res.ok) {
      onSuccess(); // вызвать заказ
      onClose();
    } else {
      const data = await res.json();
      setError(data.message || "Неверный пароль");
    }
  }

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.0.6)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Подтвердите пароль</h2>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full px-4 py-2 rounded mb-3"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-600 px-3 py-1">
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}