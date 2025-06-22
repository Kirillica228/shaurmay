"use client"

import { useEffect, useState } from "react"

function groupByName(products) {
  const grouped = {}
  for (const p of products) {
    if (!grouped[p.name]) grouped[p.name] = { ...p, quantity: 1 }
    else grouped[p.name].quantity += 1
  }
  return Object.values(grouped)
}

export default function OrderProfile() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    console.log("TOKEN >>>", token)

    fetch("http://localhost:8000/api/order/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status}`)
        }
        return res.json()
      })
      .then(data => setOrders(data))
      .catch(err => console.error("Ошибка запроса:", err))
  }, [])

  return (
    <div>
      <h1>Мои заказы</h1>
      {orders.map((order, idx) => {
        const grouped = groupByName(order.products)
        return (
          <div key={idx} className="border p-4 my-4">
            <h2>Заказ от {new Date(order.created_at).toLocaleString()}</h2>
            <p>Статус: {order.status}</p>
            <p>Адрес: {order.street}</p>
            <ul>
              {grouped.map((item, i) => (
                <li key={i}>
                  {item.name} — {item.quantity} × {item.price}₽
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
