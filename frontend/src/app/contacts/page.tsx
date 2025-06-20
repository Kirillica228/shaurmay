"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import Image from "next/image";
declare global {
  interface Window {
    ymaps: typeof import("yandex-maps");
    ymapsInited?: boolean;
  }
}

export default function Contacts() {
  const [mapKey, setMapKey] = useState(0);
  const mapCreated = useRef(false);

  const initMap = () => {
    if (mapCreated.current) return;
    mapCreated.current = true;
    window.ymapsInited = true;

    const ymaps = window.ymaps;

    const map = new ymaps.Map("map", {
      center: [55.7558, 37.6176],
      zoom: 9,
    });

    const officePlacemark = new ymaps.Placemark(
      [55.741399, 37.555319],
      { balloonContent: "Шаур 構 мяу" },
      { preset: "islands#icon", iconColor: "#8e2de2" }
    );

    map.geoObjects.add(officePlacemark);
  };

 useEffect(() => {
  const loadYandexMapScript = () => {
    if (document.getElementById("ymaps-script")) {
      if (window.ymaps) {
        window.ymaps.ready(initMap);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "ymaps-script";
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.async = true;
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(initMap);
      }
    };
    document.head.appendChild(script);
  };

  loadYandexMapScript();

  return () => {
    mapCreated.current = false;
    const container = document.getElementById("map");
    if (container) container.innerHTML = "";
    setMapKey((prev) => prev + 1);
  };
}, []);

  return (
    <section className="mt-[50px] w-full gap-[10px]">
      <div className="flex flex-col items-center h-[650px] justify-between">
        <div className="max-w-6xl mx-auto space-y-10 flex flex-col justify-around w-full">
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-center">Мы на карте</h2>
            <div id="map" key={mapKey} className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg" />
          </div>
        </div>
        <div className="text-center flex rounded-2xl w-[800px] justify-between shadow-2xl">
            <div className="bg-white/5 rounded-xl p-6 space-y-2 flex-col items-center flex">
              <Image src="/sms.svg" alt="" width={25} height={25} />
              <p className="font-semibold">Почта</p>
              <p className="text-sm text-gray-800">info@impasto-color.ru</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 space-y-2 flex-col items-center flex">
              <Image src="/phone.svg" alt="" width={25} height={25} />
              <p className="font-semibold">Телефон</p>
              <p className="text-sm text-gray-800">+7 929 245 5131</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 space-y-2 flex-col items-center flex">
              <Image src="/office.svg" alt="" width={25} height={25} />
              <p className="font-semibold">Адрес</p>
              <p className="text-sm text-gray-800">г. Москва, ул. Киевская, д. 19</p>
            </div>
          </div>
        </div>
    </section>
  );
}
