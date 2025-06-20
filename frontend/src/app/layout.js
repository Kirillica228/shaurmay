"use client"
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import HeaderAuth from "./components/HeaderAuth";
import { usePathname } from "next/navigation";
import { useEffect, useState} from "react";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin", "japanese"],  // добавляем поддержку японских символов
  weight: ["400", "700"],          // при необходимости указываем нужные веса
});



export default function RootLayout({ children }) {
  const [procces,setProcces]= useState(true);
  const path = usePathname()

  const middleWare = ["/auth", "/reg", "/checkout"];

  useEffect(() => {
    if (path && middleWare.includes(path)) {
      setProcces(false);
    }
    else{
      setProcces(true);
    }
  }, [path]);

  return (
    <html lang="en">
      <head>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;500;700&family=Roboto+Mono&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${notoSansJP.variable} antialiased bg-[#F8F7F5]`}
      >
        <header className= {`flex items-center p-3 w-[98%] border-b-[1px] border-[#8A8784] ${procces ? `justify-between` : `justify-center`}`}>
          <div className={procces ? "flex items-center gap-[50px] w-[50%]" : ""}>
            <Link href="/" className="font-bold text-[35px]">Шаур 構 мяу</Link>
            {procces && <div className="relative w-[40%]">
              <input type="text" className="w-[100%] border-[2px] border-[#C4C2BE] rounded-[15px] pl-[40px] py-3 outline-none " placeholder="Найти в ресторане"/>
              <button className="absolute left-[10px] top-[25%]">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
                  <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
                </svg>
              </button>
            </div>
            }
          </div>
          <div className="flex items-center w-[280px] justify-between">
            <Link href="/about" className="font-medium text-neutral-800">О нас</Link>
            <Link href="/" className="font-medium text-neutral-800">Каталог</Link>
            <Link href="/contacts" className="font-medium text-neutral-800 text-[15px]">Контакты</Link>
            {procces && <HeaderAuth/>}
          </div>
          {procces && <HeaderAuth/>}
        </header>
        {children}
      </body>
    </html>
  );
}
