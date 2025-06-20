"use client"
import { useState,useEffect } from "react";
import { fetchWithRefresh } from "../../../utils/fetchWithRefresh";
import PasswordModal from "../components/PasswordModal";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

export default function CheckOut(){
    const [basket,setBasket] = useState([]);
    const [finishPrice,setFinishPrice] = useState(0);
    const { isAuthenticated } = useAuth(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error,setError] = useState("")

    const [formData, setFormData] = useState({
    street: '',
    apartment: '',
    intercom: '',
    entrance: '',
    floor: ''
    });

    const router = useRouter()

    const fetchProductsAndBasket = async () => {
    try {
        if (isAuthenticated){
            const basketResponse = await fetchWithRefresh("http://localhost:8000/api/basket", {
            method: "GET"
            });
            const basketData = await basketResponse.json();
            setBasket(basketData);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheck = (e) => {
        e.preventDefault()
        if (formData.street.length > 0){
            setError("")
            setIsModalOpen(true)
        }
        else{
            setError("Введите обязательное поле(улица)")
        }
    }

    const handleOrder = async () => {
        const res = await fetchWithRefresh("http://localhost:8000/api/order/checkout", {
        method: "POST",
        body: JSON.stringify({
                street: formData.street,
                apartment: formData.apartment || null,
                entrance: formData.entrance || null,
                floor: formData.floor || null,
                intercom: formData.intercom || null
            })
        });

        if (res.ok) {
        router.push("/profile/order")
        } else {
        console.log(res.data)
        }
    };

    useEffect(() => {
        fetchProductsAndBasket();
    }, [isAuthenticated]);
    
      useEffect(() => {
        calculateFinishPrice()
    },[basket])

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
      router.push("/")
    } catch (error) {
      console.log('Ошибка запроса:', error.message);
    }
  }

    return(
        <main className="w-screen h-screen flex justify-center items-center">
            <form className="flex flex-row justify-center gap-[20px] items-center w-[100%]">
                <div className="flex flex-col items-center gap-[20px] w-[60%]">
                    <div className="bg-white p-8 flex flex-col gap-[10px] rounded-[20px] w-[100%]">
                        <h1 className="text-[20px] font-medium">Укажите адрес</h1>
                        <p className="text-[14px] font-light text-[red]">{error && error}</p>
                        <div className="flex flex-col gap-[10px]">
                            <input 
                                className=" border-[#8b8b8b] border-[2px] px-2 py-1 rounded-[5px] outline-none" 
                                type="text" name="street" id="street" placeholder="Улица" required 
                                onChange={handleChange} value={formData.street}/>
                            <div className="flex items-center justify-between gap-[30px]">
                                <input 
                                    className=" border-[#8b8b8b] border-[2px] py-1 rounded-[5px] outline-none pl-1" 
                                    type="text" name="apartment" id="apartment" placeholder="Кв./офис" 
                                    onChange={handleChange} value={formData.apartment}/>
                                <input 
                                    className=" border-[#8b8b8b] border-[2px] py-1 rounded-[5px] outline-none pl-1" 
                                    type="text" name="intercom" id="intercom" placeholder="Домофон" 
                                    onChange={handleChange} value={formData.intercom}/>
                                <input 
                                    className=" border-[#8b8b8b] border-[2px] py-1 rounded-[5px] outline-none pl-1" 
                                    type="text" name="entrance" id="entrance" placeholder="Подъезд" 
                                    onChange={handleChange} value={formData.entrance}/>
                                <input 
                                    className=" border-[#8b8b8b] border-[2px] py-1 rounded-[5px] outline-none pl-1" 
                                    type="text" name="floor" id="floor" placeholder="Этаж"
                                    onChange={handleChange} value={formData.floor}/>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 flex flex-col gap-[10px] rounded-[20px] w-[100%]">
                        <div className="flex items-center justify-between w-[100%]">
                            <h1 className="font-medium text-[22px]">Ваш заказ</h1>
                            <button 
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleBasketClear()}
                            >
                            Очистить корзину
                            </button>
                        </div>
                        <div className="flex flex-col items-start gap-[10px]">
                        {
                        basket.map((item) => (
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
                                    <h1 className="font-light text-[18px]">{item.name}</h1>
                                    <div className="flex items-center gap-1">
                                    <p className="font-medium text-[16px]">{item.total_price}₽</p>
                                    <p>•</p>
                                    <p className="font-medium text-[16px]">
                                        {item.total_weight >= 1000 
                                        ? `${item.total_weight/1000} кг` 
                                        : `${item.total_weight} г`}
                                    </p>
                                    </div>
                                </div>
                                </div>
                                <div className="bg-[#F8F7F5] flex items-center justify-between p-2 rounded-2xl w-[20%]">
                                <button 
                                    onClick={() => handleBasketSubstructionQuantity(item.id)}
                                    aria-label="Уменьшить количество"
                                    type="button"
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
                                    type="button"
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
                        ))
                        }
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 flex flex-col gap-[10px] rounded-[20px] w-[30%]">
                    <h1 className="text-[20px] font-medium">Что в цене</h1>
                    <div className="w-[100%] flex items-center justify-between">
                        <h1 className="text-[18px]">Товары в заказе</h1>
                        <h1 className="font-medium text-[16px]">{finishPrice}₽</h1>
                    </div>
                    <div className="border-t-2">
                        <div className="flex flex-col gap-[20px] items-center mt-[10px]">
                            <div className="w-[100%] flex items-center justify-between">
                                <h1 className="text-[18px]">Финальная цена</h1>
                                <h1 className="font-medium text-[16px]">{finishPrice}₽</h1>
                            </div>
                            
                            <button onClick={(e) => handleCheck(e)} className="w-[100%] py-2 bg-[#ffe100] rounded-[10px]">
                            <h1 className="text-[18px] font-medium">Заказать</h1>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <PasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleOrder}
            />
        </main>
    );
}