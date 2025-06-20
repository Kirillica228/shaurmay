"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function Home() {
  const men = ["Что нового","Шаурма","Выпечка","Десерты","Напитки"]

  const [activeMenuItem, setActiveMenuItem] = useState(men[0]);
  const [menu,setMenu] = useState([]);
  const [foods,setFoods] = useState([]);
  const [basket,setBasket] = useState([]);

  const [finishPrice,setFinishPrice] = useState(0);

  const { isAuthenticated } = useAuth(); 
  const router = useRouter()

  const isBasketNotEmpty = basket && basket.length > 0;
  const isButtonDisabled = !isAuthenticated || !isBasketNotEmpty;

  const fetchProductsAndBasket = async () => {
    try {
      const productsResponse = await axios.get("http://localhost:8000/api/products");
      const allFoods = productsResponse.data.food;
      setMenu(productsResponse.data.typeFoods);
      if (isAuthenticated) {
        const basketResponse = await fetchWithRefresh("http://localhost:8000/api/basket", {
          method: "GET"
        });
        const basketData = await basketResponse.json();
        setBasket(basketData);

        const basketMap = new Map(basketData.map(item => [item.id, item.quantity]));

        const foodsWithCartFlag = allFoods.map(food => ({
          ...food,
          in_cart: basketMap.has(food.id),
          quantity: basketMap.get(food.id) || 0
        }));

        setFoods(foodsWithCartFlag);
      } else {
        setFoods(allFoods);
        setBasket([]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  const calculateFinishPrice = () => {
    var price = 0
    basket.map((item) => {
      price += item.total_price
    })
    setFinishPrice(price)
  }

  useEffect(() => {
      fetchProductsAndBasket();
  }, [isAuthenticated]);

  useEffect(() => {
    calculateFinishPrice()
  },[basket])

  const handleMenuClick = (item) => {
    setActiveMenuItem(item);
  }

  const handleBasketAddProduct = async (id, quantity) => {
    try {
      await fetchWithRefresh("http://localhost:8000/api/basket/add", {
        method: 'POST',
        body: JSON.stringify({ id, quantity })  
      });
      await fetchProductsAndBasket();
    } catch (error) {
      console.log('Ошибка запроса:', error.message);
    }
  }

  const handleBasketAdditionQuantity = async (id) => {
    try {
      await fetchWithRefresh("http://localhost:8000/api/basket/increase", {
        method: 'POST',
        body: JSON.stringify({ id })  
      });
      await fetchProductsAndBasket();
    } catch (error) {
      console.log('Ошибка запроса:', error.message);
    }
  }

  const handleBasketSubstructionQuantity = async (id) => {
    try {
      await fetchWithRefresh("http://localhost:8000/api/basket/decrease", {
        method: 'POST',
        body: JSON.stringify({ id })  
      });
      await fetchProductsAndBasket();
    } catch (error) {
      console.log('Ошибка запроса:', error.message);
    }
  }

  const handleBasketClear = async () => {
    try {
      await fetchWithRefresh("http://localhost:8000/api/basket/clear", {
        method: 'DELETE', 
      });
      await fetchProductsAndBasket();
    } catch (error) {
      console.log('Ошибка запроса:', error.message);
    }
  }

  return (
    <main className="flex w-full justify-between px-6 py-5">
      {/* Меню */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-medium text-[22px] px-5">Меню</h1>
        <div className="flex flex-col items-start gap-2.5 w-[300px]">
          {menu.map((item) => (
            <button
              key={item.name}
              className={`flex items-start font-normal text-base px-5 py-3 w-full ${
                activeMenuItem === item.name 
                  ? 'font-medium bg-white rounded-[20px]' 
                  : ''
              }`}
              onClick={() => handleMenuClick(item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
  
      {/* Каталог */}
      <div className="flex-1 mx-4">
        <h1 className="font-medium text-[22px] mb-4">Каталог</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {foods.map((food) => (
            <div 
              key={food.id} 
              className="bg-white rounded-[20px] p-6 w-full max-w-[250px] flex flex-col gap-2.5"
            >
              <img 
                src={`http://localhost:8000/media/${food.img}`} 
                alt={food.name}
                className="w-full h-[150px] object-cover rounded-[20px]"
              />
              <div>
                <h1 className="font-medium text-[22px]">{food.price}₽</h1>
                <h1 className="font-normal text-[16px]">{food.name}</h1>     
                <p className="font-medium text-[16px]">
                  {food.weight >= 1000 ? `${food.weight/1000} кг` : `${food.weight} г`}
                </p>
              </div>
              
              {isAuthenticated ? (
                food.in_cart ? (
                  <div className="bg-[#F8F7F5] flex items-center justify-between p-2 rounded-2xl">
                    <button 
                      onClick={() => handleBasketSubstructionQuantity(food.id)}
                      aria-label="Уменьшить количество"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <path d="M18.0001 12.0001V14.6701C18.0001 17.9801 15.6501 19.3401 12.7801 17.6801L10.4701 16.3401L8.16007 15.0001C5.29007 13.3401 5.29007 10.6301 8.16007 8.97005L10.4701 7.63005L12.7801 6.29005C15.6501 4.66005 18.0001 6.01005 18.0001 9.33005V12.0001Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <span>{food.quantity}</span>
                    <button 
                      onClick={() => handleBasketAdditionQuantity(food.id)}
                      aria-label="Увеличить количество"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <path d="M6 12V9.33004C6 6.02005 8.35 4.66005 11.22 6.32005L13.53 7.66004L15.84 9.00005C18.71 10.66 18.71 13.37 15.84 15.03L13.53 16.37L11.22 17.71C8.35 19.34 6 17.99 6 14.67V12Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-[#F8F7F5] px-5 py-3 font-medium text-[16px] rounded-2xl w-full"
                    onClick={() => handleBasketAddProduct(food.id, 1)}
                  >
                    Добавить +
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      </div>
  
      {/* Корзина */}
      <div className="bg-white rounded-[20px] w-[25%] min-w-[300px] p-3 flex flex-col  justify-between">
        <div className="flex flex-col gap-[20px]">
          <div className="flex items-center justify-between w-[100%]">
            <h1 className="font-medium text-[22px]">Корзина</h1>
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleBasketClear()}
            >
              Очистить
            </button>
          </div>
          <div className="flex flex-col items-center w-[100%]">
              { basket && basket.length > 0
              ? (basket.map((item) => (
                <div 
                  key={`${item.id}-${item.quantity}`} 
                  className="flex items-center justify-between p-2 w-[100%]"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={`http://localhost:8000${item.img}`} 
                      alt={item.name}
                      className="w-[69px] h-[69px] rounded-[20px] object-cover"
                    />
                    <div>
                      <h1 className="font-light text-[14px]">{item.name}</h1>
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-[12px]">{item.total_price}₽</p>
                        <p>•</p>
                        <p className="font-medium text-[12px]">
                          {item.total_weight >= 1000 
                            ? `${item.total_weight/1000} кг` 
                            : `${item.total_weight} г`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#F8F7F5] flex items-center justify-between p-2 rounded-2xl w-[35%]">
                    <button 
                      onClick={() => handleBasketSubstructionQuantity(item.id)}
                      aria-label="Уменьшить количество"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M18.0001 12.0001V14.6701C18.0001 17.9801 15.6501 19.3401 12.7801 17.6801L10.4701 16.3401L8.16007 15.0001C5.29007 13.3401 5.29007 10.6301 8.16007 8.97005L10.4701 7.63005L12.7801 6.29005C15.6501 4.66005 18.0001 6.01005 18.0001 9.33005V12.0001Z" 
                          stroke="#292D32" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleBasketAdditionQuantity(item.id)}
                      aria-label="Увеличить количество"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M6 12V9.33004C6 6.02005 8.35 4.66005 11.22 6.32005L13.53 7.66004L15.84 9.00005C18.71 10.66 18.71 13.37 15.84 15.03L13.53 16.37L11.22 17.71C8.35 19.34 6 17.99 6 14.67V12Z" 
                          stroke="#292D32" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )))
              :(<div className="flex flex-col items-center gap-[10px] mt-[70px]">
                <img src="/orig.svg" alt="" />
                <h1>Корзина пуста</h1>
                </div>
              )
              }
          </div>
        </div>
        <div>
          <button className={`px-3 py-2 rounded-[10px] w-[100%] ${isButtonDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#ffe100]'}`}
            onClick={() => {
              if (!isButtonDisabled) router.push("/checkout");
            }}
            disabled={isButtonDisabled}
          >
            <div className="flex items-center justify-between ">
              <h1 className="text-[18px] font-medium">Далее</h1>
              <h1 className="text-[17px] font-mono">{finishPrice}₽</h1>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}