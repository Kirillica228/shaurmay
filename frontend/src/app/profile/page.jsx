"use client"
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchWithRefresh } from "../../../utils/fetchWithRefresh";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  
  // Исходные данные с сервера
  const [initialData, setInitialData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  
  // Текущие данные в форме
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  
  // Какие поля были изменены
  const [dirtyFields, setDirtyFields] = useState({
    first_name: false,
    last_name: false,
    phone: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      const response = await fetchWithRefresh("http://localhost:8000/users/me", {
        method: "GET"
      });
      const data = await response.json();
      
      setInitialData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || ''
      });
      
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || ''
      });
      
      setDirtyFields({
        first_name: false,
        last_name: false,
        phone: false
      });
      
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setDirtyFields(prev => ({
      ...prev,
      [name]: value !== initialData[name]
    }));
  };

  const handleSaveField = async (fieldName) => {
    if (!dirtyFields[fieldName]) return;
    
    try {
      await fetchWithRefresh("http://localhost:8000/users/profile", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: formData[fieldName] })
      });
      
      // Обновляем initialData после успешного сохранения
      setInitialData(prev => ({
        ...prev,
        [fieldName]: formData[fieldName]
      }));
      
      setDirtyFields(prev => ({
        ...prev,
        [fieldName]: false
      }));
      
    } catch (error) {
      console.error(`Ошибка при сохранении поля ${fieldName}:`, error);
    }
  };

  const handleSaveAll = async () => {
    const changes = {};
    
    Object.keys(dirtyFields).forEach(key => {
      if (dirtyFields[key]) {
        changes[key] = formData[key];
      }
    });
    
    if (Object.keys(changes).length === 0) return;
    
    try {
      await fetchWithRefresh("http://localhost:8000/users/profile", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes)
      });
      
      // Обновляем initialData после успешного сохранения
      setInitialData(prev => ({
        ...prev,
        ...changes
      }));
      
      setDirtyFields({
        first_name: false,
        last_name: false,
        phone: false
      });
      
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-[20px]">
      <div>
        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
      </div>
      
      <div className="flex flex-col items-start gap-[20px]">
        <div className="flex gap-[20px]">
          <div className="flex flex-col items-start">
            <label htmlFor="first_name" className="mb-1">Имя</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="bg-[#F9F9F9] px-4 py-2 rounded-[10px] outline-none w-64"
                placeholder="Введите ваше имя"
              />
              {dirtyFields.first_name && (
                <button 
                  onClick={() => handleSaveField('first_name')}
                  className="bg-blue-500 text-white px-3 py-1 rounded-[10px] hover:bg-blue-600 transition text-sm"
                >
                  Сохранить
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start">
            <label htmlFor="last_name" className="mb-1">Фамилия</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="bg-[#F9F9F9] px-4 py-2 rounded-[10px] outline-none w-64"
                placeholder="Введите вашу фамилию"
              />
              {dirtyFields.last_name && (
                <button 
                  onClick={() => handleSaveField('last_name')}
                  className="bg-blue-500 text-white px-3 py-1 rounded-[10px] hover:bg-blue-600 transition text-sm"
                >
                  Сохранить
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[10px] w-full">
          <h2 className="text-lg font-semibold">Контактные данные</h2>
          <div className="flex gap-[20px] w-full">
            <div className="flex flex-col items-start flex-1">
              <label htmlFor="email" className="mb-1">Почта</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                className="bg-[#F9F9F9] px-4 py-2 rounded-[10px] outline-none w-full"
                disabled
              />
            </div>
            
            <div className="flex flex-col items-start flex-1">
              <label htmlFor="phone" className="mb-1">Номер телефона</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-[#F9F9F9] px-4 py-2 rounded-[10px] outline-none flex-1"
                  placeholder="Введите ваш телефон"
                />
                {dirtyFields.phone && (
                  <button 
                    onClick={() => handleSaveField('phone')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-[10px] hover:bg-blue-600 transition"
                  >
                    Сохранить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {(dirtyFields.first_name || dirtyFields.last_name || dirtyFields.phone) && (
          <button 
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-6 py-2 rounded-[10px] hover:bg-green-600 transition mt-4"
          >
            Сохранить все изменения
          </button>
        )}
      </div>
    </div>
  );
}