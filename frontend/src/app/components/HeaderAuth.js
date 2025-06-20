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
      <button className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 24 24">
          <path d="M 12 2 C 11.172 2 10.5 2.672 10.5 3.5 L 10.5 4.1953125 C 7.9131836 4.862095 6 7.2048001 6 10 L 6 16 L 4 18 L 4 19 L 10.269531 19 A 2 2 0 0 0 10 20 A 2 2 0 0 0 12 22 A 2 2 0 0 0 14 20 A 2 2 0 0 0 13.728516 19 L 20 19 L 20 18 L 18 16 L 18 10 C 18 7.2048001 16.086816 4.862095 13.5 4.1953125 L 13.5 3.5 C 13.5 2.672 12.828 2 12 2 z M 12 6 C 14.206 6 16 7.794 16 10 L 16 16 L 16 16.828125 L 16.171875 17 L 7.828125 17 L 8 16.828125 L 8 16 L 8 10 C 8 7.794 9.794 6 12 6 z"></path>
        </svg>
        <span>Уведомления</span>
      </button>
      <Link href="/auth" className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" fill="black"/>
          <path d="M17.08 14.15C14.29 12.29 9.74001 12.29 6.93001 14.15C5.66001 15 4.96001 16.15 4.96001 17.38C4.96001 18.61 5.66001 19.75 6.92001 20.59C8.32001 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" fill="black"/>
        </svg>
        <span>Войти</span>
      </Link>
    </div>
  );
}
