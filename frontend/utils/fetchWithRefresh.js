export async function fetchWithRefresh(url, options = {}) {
  // Получаем токены из localStorage
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    throw new Error("Access token not found");
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'Authorization': `Bearer ${accessToken}`,
  };

  // Выполняем первоначальный запрос
  let response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? options.body : undefined,
  });

  // Если токен валиден - возвращаем ответ
  if (response.status !== 401) return response;

  // Если токен истек и есть refreshToken - пробуем обновить
  if (refreshToken) {
    try {
      const refreshResponse = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const { access } = await refreshResponse.json();
      
      // Сохраняем новый accessToken
      localStorage.setItem("accessToken", access);
      
      // Обновляем заголовок авторизации
      headers.Authorization = `Bearer ${access}`;
      
      // Повторяем исходный запрос с новым токеном
      return await fetch(url, {
        ...options,
        headers,
        body: options.body ? options.body : undefined,
      });
      
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Если не удалось обновить - разлогиниваем пользователя
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      window.location.href = "/auth";
      throw error;
    }
  }

  // Если refreshToken отсутствует - просто возвращаем оригинальный ответ
  return response;
}