"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
export default function About() {
  return (
    <section className="w-full py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Левая часть — текст */}
        <div className="space-y-6">
          <span className="text-sm uppercase text-gray-500">🍽 Шаурма • Вкусно</span>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Открой для себя вкус, от которого мурчит душа
          </h1>
          <p className="text-lg text-gray-600">
            Наша шаурма — это больше, чем еда. Это уют, тепло и сочность в каждом укусе.
            Заходи — мурчать будем вместе.
          </p>
            <Link href="/" className="mt-4 inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-full shadow hover:bg-purple-700 transition">Попробовать</Link>
        </div>

        {/* Правая часть — изображение с метками */}
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] shadow-lg border border-gray-200">
            <Image
              src="/shayrma.png"
              alt="Шаурма"
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Bubble 1 */}
          <div className="absolute top-6 left-6 bg-white rounded-xl shadow px-4 py-2 text-sm text-gray-700 border">
            😻 Люди мурчат от вкуса!
          </div>

          {/* Bubble 2 */}
          <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow px-4 py-2 text-sm text-gray-700 border">
            🐾 Более 350К довольных клиентов
          </div>
        </div>
      </div>

      {/* Нижняя часть — статистика */}
      <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
        <div className="bg-purple-100 rounded-xl p-6 text-center shadow">
          <p className="text-3xl font-bold text-purple-700">351K+</p>
          <p className="text-gray-600 mt-2 text-sm">Продано шаурм</p>
        </div>
        <div className="bg-yellow-100 rounded-xl p-6 text-center shadow">
          <p className="text-3xl font-bold text-yellow-700">99%</p>
          <p className="text-gray-600 mt-2 text-sm">Клиентов возвращаются</p>
        </div>
        <div className="bg-pink-100 rounded-xl p-6 text-center shadow">
          <p className="text-3xl font-bold text-pink-700">4.89</p>
          <p className="text-gray-600 mt-2 text-sm">Оценка на DeliveryCat</p>
        </div>
      </div>
    </section>
  );
}
