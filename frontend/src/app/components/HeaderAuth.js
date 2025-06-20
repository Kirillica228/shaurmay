"use client";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { logout } from "../../../utils/logout";

export default function HeaderAuth() {
  const { isAuthenticated, username } = useAuth();

  return isAuthenticated ? (
    <div className="flex items-center gap-4">
      <Link href="/profile" className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" fill="black"/>
          <path d="M17.08 14.15C14.29 12.29 9.74001 12.29 6.93001 14.15C5.66001 15 4.96001 16.15 4.96001 17.38C4.96001 18.61 5.66001 19.75 6.92001 20.59C8.32001 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" fill="black"/>
        </svg>
        <span>{username}</span>
      </Link>
      <button 
        onClick={
          () => 
            // console.log(session)
          logout()
        }
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Выйти
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-[50px]">
      <Link href="/auth" className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" fill="black"/>
          <path d="M17.08 14.15C14.29 12.29 9.74001 12.29 6.93001 14.15C5.66001 15 4.96001 16.15 4.96001 17.38C4.96001 18.61 5.66001 19.75 6.92001 20.59C8.32001 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" fill="black"/>
        </svg>
        <span className="font-medium text-neutral-800">Войти</span>
      </Link>
    </div>
  );
}
