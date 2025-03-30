import React, { useState, useEffect } from 'react';
import './ServicesSection.css';

const API_URL = 'http://localhost:5001/services';

const ServicesSection = () => {
    const [services, setServices] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [descriptionItems, setDescriptionItems] = useState(['']); // Начинаем с одного пустого пол
    // Загрузка данных с сервера
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            const data = await response.json();
            console.log(data);
            setServices(data);
        } catch (error) {
            console.error("Ошибка загрузки услуг:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка удаления');
            }

            setServices(services.filter(service => service._id !== id));
        } catch (error) {
            console.error("Ошибка удаления:", error);
        }
    };

    const handleAddClick = () => setIsAdding(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService({ ...newService, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Фильтруем пустые пункты
        const validDescriptionItems = descriptionItems.filter(item => item.trim() !== '');

        // Проверяем, что есть хотя бы один пункт описания
        if (validDescriptionItems.length === 0) {
            alert('Пожалуйста, добавьте хотя бы один пункт описания');
            return;
        }

        const formData = new FormData();
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        // Добавляем данные
        formData.append('name', newService.name);
        formData.append('price', newService.price);

        // Добавляем каждый пункт описания отдельно
        validDescriptionItems.forEach((item, index) => {
            formData.append(`description[${index}]`, item);
        });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении услуги');
            }

            const addedService = await response.json();
            setServices([...services, addedService]);

            // Сбрасываем форму
            setNewService({ name: '', description: '', price: '' });
            setDescriptionItems(['']);
            setSelectedFile(null);
            setIsAdding(false);
        } catch (error) {
            console.error("Ошибка добавления:", error);
            alert(error.message);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setSelectedFile(null);
        setDescriptionItems(['']);
        setNewService({ name: '', description: '', price: '' });
    };

    const handleDescriptionChange = (index, value) => {
        const updatedItems = [...descriptionItems];
        updatedItems[index] = value;

        // Автоматически добавляем новое поле, если редактируется последний пункт и он не пустой
        if (index === descriptionItems.length - 1 && value.trim() !== '') {
            updatedItems.push('');
        }

        setDescriptionItems(updatedItems);
    };

    const handleRemoveItem = (index) => {
        if (descriptionItems.length > 1) { // Не удаляем последнее поле
            setDescriptionItems(descriptionItems.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="services-section">
            <div className="section-header">
                <h2 className="title">Список услуг</h2>
                <button className="add-button" onClick={handleAddClick}>Добавить</button>
            </div>

            {isLoading ? (
                <div className="loading">Загрузка...</div>
            ) : (
                <div className="services-container">
                    {services.map(service => (
                        <div key={service._id} className="service-item">
                            <img
                                src={service.photo ? `http://localhost:5001${service.photo}` : 'https://via.placeholder.com/100'}
                                alt={service.name}
                                className="service-photo"
                            />
                            <div className="service-info">
                                <div className="service-header">
                                    <h3 className="service-name">{service.name}</h3>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(service._id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                                <div className="service-description">
                                    {Array.isArray(service.description) ? (
                                        <ul>
                                            {service.description.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : typeof service.description === 'string' ? (
                                        <ul>
                                            {service.description.split('\n').map((item, i) => (
                                                item.trim() && <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <ul>
                                            <li>{service.description || 'Описание отсутствует'}</li>
                                        </ul>
                                    )}
                                </div>
                                <div className="service-price">{service.price} руб.</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form className="add-service-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
                            <h3>Добавить новую услугу</h3>
                            <div className="image-preview-container">
                                {selectedFile ? (
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Предпросмотр"
                                        className="image-preview"
                                    />
                                ) : (
                                    <div className="no-image-preview">
                                        Превью изображения появится здесь
                                    </div>
                                )}
                            </div>

                            <div className="file-upload-wrapper">
                                <label htmlFor="photo" className="file-upload-label">
                                    Выберите изображение
                                </label>
                                <input
                                    type="file"
                                    id="photo"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-upload-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Название услуги:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newService.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Описание (по пунктам):</label>
                                {descriptionItems.map((item, index) => (
                                    <div key={index} className="description-item-container">
                                        <div className="description-input-wrapper">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                                placeholder={`Пункт ${index + 1}`}
                                                className="description-input"
                                            />
                                            {index !== descriptionItems.length - 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-item-btn"
                                                    onClick={() => handleRemoveItem(index)}
                                                    aria-label="Удалить пункт"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Отображение в виде списка пунктов */}
                            <div className="description-preview">
                                <ul>
                                    {newService.description
                                        .split('\n')
                                        .filter(line => line.trim() !== '')
                                        .map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                </ul>
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Цена:</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={newService.price}
                                    onChange={(e) => {
                                        // Фильтруем ввод, разрешаем только цифры и точку
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        // Удаляем лишние точки
                                        const filteredValue = value.replace(/\.{2,}/g, '.');
                                        // Обновляем состояние
                                        setNewService({...newService, price: filteredValue});
                                    }}
                                    onKeyPress={(e) => {
                                        // Блокируем ввод букв и специальных символов
                                        if (!/[0-9.]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    min="500"
                                    step="500"
                                    required
                                    placeholder="Введите цену"
                                    className="price-input"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button">Добавить услугу</button>
                                <button type="button" className="cancel-button" onClick={handleCancel}>
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesSection;