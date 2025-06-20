"use client"
import { useState } from 'react';

export default function ProductInventory() {
  // Массив из 5 цветов для поставок
  const batchColors = [
    'bg-blue-500',    // Первая поставка
    'bg-green-500',   // Вторая поставка
    'bg-yellow-500',  // Третья поставка
    'bg-purple-500',  // Четвертая поставка
    'bg-pink-500'     // Пятая поставка
  ];

  const statusColors = {
    good: 'bg-green-100 text-green-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    good: 'Годен',
    expiring: 'Скоро истекает',
    expired: 'Просрочено'
  };

  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Курица', 
      batches: [
        { quantity: 10.2, unit: 'кг', expiry: '2024-05-20', deliveryDate: '2024-05-10', minQuantity: 5 },
        { quantity: 5, unit: 'кг', expiry: '2024-05-25', deliveryDate: '2024-05-15', minQuantity: 5 }
      ]
    },
    { 
      id: 2, 
      name: 'Лаваш', 
      batches: [
        { quantity: 80, unit: 'шт.', expiry: '2024-06-01', deliveryDate: '2024-05-12', minQuantity: 50 },
        { quantity: 40, unit: 'шт.', expiry: '2024-06-05', deliveryDate: '2024-05-18', minQuantity: 50 }
      ]
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    batches: [{
      quantity: '',
      unit: 'кг',
      expiry: '',
      deliveryDate: '',
      minQuantity: ''
    }]
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' или 'orders'

  const handleInputChange = (e, batchIndex) => {
    const { name, value } = e.target;
    
    if (batchIndex !== undefined) {
      const updatedBatches = [...newProduct.batches];
      updatedBatches[batchIndex] = {
        ...updatedBatches[batchIndex],
        [name]: name === 'quantity' || name === 'minQuantity' ? Number(value) || 0 : value
      };
      setNewProduct({...newProduct, batches: updatedBatches});
    } else {
      setNewProduct({...newProduct, [name]: value});
    }
  };

  const addNewBatch = () => {
    setNewProduct({
      ...newProduct,
      batches: [
        ...newProduct.batches,
        { quantity: '', unit: 'кг', expiry: '', deliveryDate: '', minQuantity: '' }
      ]
    });
  };

  const removeBatch = (index) => {
    const updatedBatches = [...newProduct.batches];
    updatedBatches.splice(index, 1);
    setNewProduct({...newProduct, batches: updatedBatches});
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      alert('Введите название продукта');
      return;
    }

    for (const batch of newProduct.batches) {
      if (!batch.quantity || !batch.expiry || !batch.deliveryDate || !batch.minQuantity) {
        alert('Заполните все поля для каждой партии');
        return;
      }
    }

    if (editingId) {
      setProducts(products.map(p => 
        p.id === editingId ? { 
          ...newProduct, 
          batches: newProduct.batches.map(b => ({
            ...b,
            quantity: Number(b.quantity),
            minQuantity: Number(b.minQuantity)
          }))
        } : p
      ));
      setEditingId(null);
    } else {
      setProducts([...products, { 
        ...newProduct, 
        id: Date.now(),
        batches: newProduct.batches.map(b => ({
          ...b,
          quantity: Number(b.quantity),
          minQuantity: Number(b.minQuantity)
        }))
      }]);
    }
    
    setNewProduct({
      name: '',
      batches: [{
        quantity: '',
        unit: 'кг',
        expiry: '',
        deliveryDate: '',
        minQuantity: ''
      }]
    });
    setShowAddForm(false);
  };

  const handleEdit = (product) => {
    setNewProduct({
      ...product,
      batches: product.batches.map(batch => ({
        ...batch,
        quantity: batch.quantity.toString(),
        minQuantity: batch.minQuantity.toString()
      }))
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const cancelEdit = () => {
    setNewProduct({
      name: '',
      batches: [{
        quantity: '',
        unit: 'кг',
        expiry: '',
        deliveryDate: '',
        minQuantity: ''
      }]
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (expiry) => {
    const today = new Date();
    const expiryDate = new Date(expiry);
    const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysToExpiry < 0) return 'expired';
    if (daysToExpiry <= 3) return 'expiring';
    return 'good';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative flex">
      {/* Боковая панель */}
      <div className={`bg-orange-600 text-white w-64 min-h-screen transition-all duration-300 fixed z-20 ${sidebarOpen ? 'left-0' : '-left-64'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">
              <span className="text-white">Шаур</span>
              <span className="text-yellow-300">Мяу</span>
              <span role="img" aria-label="шаурма" className="ml-2">😺</span>
            </h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:text-yellow-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors ${activeTab === 'inventory' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Инвентаризация
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('recipes')}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors ${activeTab === 'recipes' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Рецепты
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors ${activeTab === 'orders' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Заказы
                </button>
              </li>
            </ul>
          </nav>
          
        </div>
      </div>

      {/* Основное содержимое */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Красивый фон шаурмы */} 
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Новый брендинг ШаурМяу */}
          <div className="flex justify-between items-center mb-8">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-orange-600 hover:text-orange-800 mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-3xl font-bold">
              <span className="text-orange-500">Шаур</span>
              <span className="text-black">Мяу</span>
              <span role="img" aria-label="шаурма" className="ml-2">😺</span>
            </h1>
            {!showAddForm && activeTab === 'inventory' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Новый продукт
              </button>
            )}
          </div>
          
          {activeTab === 'inventory' && (
            <>
              {/* Улучшенный поиск */}
              <div className="mb-10 flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск ингредиентов..."
                    className="pl-14 pr-12 py-4 border-2 border-orange-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 shadow-md bg-white/95 transition-all duration-300 placeholder-orange-300 text-lg hover:border-orange-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center animate-fade-in"
                    >
                      <svg className="h-6 w-6 text-orange-500 hover:text-orange-700 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {showAddForm && (
                <div className="bg-white/95 p-6 rounded-2xl mb-10 shadow-xl backdrop-blur-sm border-2 border-orange-100">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    {editingId ? 'Редактирование продукта' : 'Добавление нового продукта'}
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Название продукта</label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      className="px-4 py-3 border-2 border-orange-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-lg"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-lg font-medium text-gray-700">Партии продукта</label>
                      <button
                        onClick={addNewBatch}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Добавить партию
                      </button>
                    </div>
                    
                    {newProduct.batches.map((batch, index) => (
                      <div key={index} className="border-2 border-orange-100 p-4 rounded-xl mb-4 relative bg-orange-50">
                        {newProduct.batches.length > 1 && (
                          <button
                            onClick={() => removeBatch(index)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl"
                          >
                            ×
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-600 mb-1">Количество</label>
                            <input
                              type="number"
                              name="quantity"
                              value={batch.quantity}
                              onChange={(e) => handleInputChange(e, index)}
                              className="px-3 py-2 border border-orange-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-600 mb-1">Единица измерения</label>
                            <select
                              name="unit"
                              value={batch.unit}
                              onChange={(e) => handleInputChange(e, index)}
                              className="px-3 py-2 border border-orange-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            >
                              <option value="кг">кг</option>
                              <option value="шт.">шт.</option>
                              <option value="л">л</option>
                              <option value="г">г</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-600 mb-1">Дата поставки</label>
                            <input
                              type="date"
                              name="deliveryDate"
                              value={batch.deliveryDate}
                              onChange={(e) => handleInputChange(e, index)}
                              className="px-3 py-2 border border-orange-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-600 mb-1">Срок годности</label>
                            <input
                              type="date"
                              name="expiry"
                              value={batch.expiry}
                              onChange={(e) => handleInputChange(e, index)}
                              className="px-3 py-2 border border-orange-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-600 mb-1">Минимальный запас</label>
                            <input
                              type="number"
                              name="minQuantity"
                              value={batch.minQuantity}
                              onChange={(e) => handleInputChange(e, index)}
                              className="px-3 py-2 border border-orange-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 shadow-md transition-all"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition-all flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {editingId ? 'Сохранить' : 'Добавить'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Карточки продуктов */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 w-full max-w-6xl">
                  {filteredProducts.map((product) => {
                    const totalQuantity = product.batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
                    const minQuantity = Math.max(...product.batches.map(batch => Number(batch.minQuantity)));
                    
                    return (
                      <div key={product.id} className="bg-white/95 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl border-2 border-orange-100 hover:border-orange-200">
                        <div className="p-5 border-b-2 border-orange-100">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-orange-600">{product.name}</h3>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-blue-500 hover:text-blue-700 transition-colors text-lg"
                                title="Редактировать"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-500 hover:text-red-700 transition-colors text-lg"
                                title="Удалить"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex justify-between text-gray-600 mb-2">
                              <span className="font-medium">Всего: {totalQuantity} {product.batches[0].unit}</span>
                              <span className="font-medium">Минимум: {minQuantity} {product.batches[0].unit}</span>
                            </div>
                            
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex relative">
                              {product.batches.map((batch, index) => {
                                const width = (batch.quantity / totalQuantity) * 100;
                                const colorIndex = index % batchColors.length;
                                
                                return (
                                  <div 
                                    key={index}
                                    className={`h-full ${batchColors[colorIndex]} relative`}
                                    style={{ width: `${width}%` }}
                                  >
                                    {index > 0 && (
                                      <div 
                                        className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${batchColors[colorIndex]} border-2 border-white`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <div className="space-y-4">
                            {product.batches.map((batch, index) => {
                              const status = getStatus(batch.expiry);
                              const colorIndex = index % batchColors.length;
                              const width = (batch.quantity / totalQuantity) * 100;
                              
                              return (
                                <div key={index} className="flex items-start">
                                  <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${batchColors[colorIndex]}`}></div>
                                  <div className="ml-3">
                                    <div className="font-medium text-gray-800">
                                      {batch.quantity} {batch.unit} ({width.toFixed(1)}%)
                                    </div>
                                    <div className={`text-sm px-2 py-1 rounded-full inline-block ${statusColors[status]} mt-1`}>
                                      {statusLabels[status]} до: {batch.expiry}
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                      Поставка: {batch.deliveryDate}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-5 pt-4 border-t-2 border-orange-100">
                            <div className="flex flex-wrap gap-3 justify-center">
                              {product.batches.map((batch, index) => {
                                const colorIndex = index % batchColors.length;
                                return (
                                  <div key={index} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${batchColors[colorIndex]} mr-2`}></div>
                                    <span className="text-sm text-gray-600">
                                      Поставка {index + 1}: {batch.quantity} {batch.unit}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'recipes' && (
            <div className="bg-white/95 p-6 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-orange-100">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Рецепты</h2>
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mt-4">Раздел рецептов</h3>
                <p className="text-gray-500 mt-2">Здесь будут отображаться все рецепты вашего ресторана</p>
                <button className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition-all">
                  Добавить рецепт
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white/95 p-6 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-orange-100">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Заказы</h2>
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mt-4">Раздел заказов</h3>
                <p className="text-gray-500 mt-2">Здесь будут отображаться все заказы поставок</p>
                <button className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition-all">
                  Создать заказ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}