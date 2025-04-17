document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const userName = document.getElementById('user-name');
    const generateButton = document.getElementById('generate-button');
    const downloadButton = document.getElementById('download-button');
    const certificateName = document.getElementById('certificate-name');
    const certificateDate = document.getElementById('certificate-date');
    const certificateElement = document.getElementById('certificate');
    const timeDisplay = document.getElementById('current-time');
    
    // Обновление времени
    function updateTime() {
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Запускаем обновление времени
    updateTime();
    setInterval(updateTime, 1000);
    
    // Установка текущей даты в сертификате
    function setCurrentDate() {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('ru-RU', options);
        certificateDate.textContent = `Дата: ${formattedDate}`;
    }
    
    // Вызываем установку даты при загрузке страницы
    setCurrentDate();
    
    // Обработчик для кнопки создания сертификата
    generateButton.addEventListener('click', () => {
        if (userName.value.trim() === '') {
            // Анимация ошибки, если имя не введено
            userName.style.border = '1px solid var(--error-color)';
            userName.style.boxShadow = '0 0 0 2px rgba(255, 51, 51, 0.25)';
            
            setTimeout(() => {
                userName.style.border = '1px solid #333';
                userName.style.boxShadow = 'none';
            }, 1500);
            
            userName.focus();
            return;
        }
        
        // Обновляем имя на сертификате
        certificateName.textContent = userName.value;
        
        // Активируем кнопку скачивания
        downloadButton.disabled = false;
        
        // Анимация создания
        certificateElement.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        certificateElement.style.transform = 'scale(1.02)';
        certificateElement.style.boxShadow = '0 15px 40px rgba(0, 179, 255, 0.4)';
        
        setTimeout(() => {
            certificateElement.style.transform = 'scale(1)';
            certificateElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        }, 500);
    });
    
    // Обработчик для кнопки скачивания сертификата
    downloadButton.addEventListener('click', () => {
        if (downloadButton.disabled) return;
        
        // Создаем анимацию загрузки
        downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ОБРАБОТКА...';
        downloadButton.disabled = true;
        
        // Используем html2canvas для создания картинки сертификата
        html2canvas(certificateElement, {
            scale: 2, // Увеличиваем разрешение в 2 раза
            backgroundColor: "#ffffff", // Явно задаем белый фон
            useCORS: true, // Разрешаем cross-origin для лучшей совместимости
            allowTaint: true, // Разрешаем использование изображений, которые могут "загрязнить" canvas
            logging: false
        }).then(canvas => {
            try {
                // Преобразуем в изображение JPEG вместо PNG
                const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG с качеством 95%
                
                // Создаем ссылку для скачивания
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `Сертификат - ${userName.value}.jpg`; // Меняем расширение на jpg
                
                // Открываем в новом окне для предварительного просмотра
                // (это может помочь, если есть проблемы с ассоциациями файлов)
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>Сертификат - ${userName.value}</title>
                                <style>
                                    body { 
                                        margin: 0; 
                                        display: flex; 
                                        justify-content: center; 
                                        align-items: center; 
                                        height: 100vh; 
                                        background-color: #f0f0f0;
                                    }
                                    img { max-width: 95%; max-height: 95%; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                                    .download-hint { 
                                        position: fixed; 
                                        top: 20px; 
                                        left: 0; 
                                        right: 0; 
                                        text-align: center; 
                                        font-family: Arial, sans-serif;
                                        padding: 10px;
                                        background-color: rgba(0, 179, 255, 0.8);
                                        color: white;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="download-hint">
                                    Ваш сертификат. Чтобы сохранить, щелкните правой кнопкой мыши по изображению и выберите "Сохранить изображение как..."
                                </div>
                                <img src="${imgData}" alt="Сертификат">
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
                
                // Добавляем ссылку в документ и имитируем клик для скачивания
                document.body.appendChild(link);
                link.click();
                
                // Удаляем ссылку
                document.body.removeChild(link);
                
                // Возвращаем кнопку в нормальное состояние
                setTimeout(() => {
                    downloadButton.innerHTML = '<i class="fas fa-download"></i> СКАЧАТЬ СЕРТИФИКАТ';
                    downloadButton.disabled = false;
                    
                    // Показываем уведомление об успешном скачивании
                    showNotification('Сертификат успешно скачан и открыт в новом окне!', 'success');
                }, 1000);
            } catch (error) {
                console.error('Ошибка при обработке сертификата:', error);
                showNotification('Произошла ошибка при создании сертификата', 'error');
                downloadButton.innerHTML = '<i class="fas fa-download"></i> СКАЧАТЬ СЕРТИФИКАТ';
                downloadButton.disabled = false;
            }
        }).catch(error => {
            console.error('Ошибка при создании сертификата:', error);
            
            // Показываем уведомление об ошибке
            showNotification('Произошла ошибка при создании сертификата', 'error');
            
            // Возвращаем кнопку в нормальное состояние
            downloadButton.innerHTML = '<i class="fas fa-download"></i> СКАЧАТЬ СЕРТИФИКАТ';
            downloadButton.disabled = false;
        });
    });
    
    // Функция для показа уведомления
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        
        // Добавляем иконку в зависимости от типа
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        // Добавляем стили к уведомлению
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'all 0.3s ease';
        
        // Устанавливаем цвет в зависимости от типа
        if (type === 'success') {
            notification.style.backgroundColor = 'rgba(0, 200, 83, 0.95)';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.backgroundColor = 'rgba(255, 51, 51, 0.95)';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.backgroundColor = 'rgba(255, 214, 0, 0.95)';
            notification.style.color = '#333';
        } else {
            notification.style.backgroundColor = 'rgba(0, 179, 255, 0.95)';
            notification.style.color = 'white';
        }
        
        // Добавляем уведомление в документ
        document.body.appendChild(notification);
        
        // Анимируем появление
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Автоматически удаляем через 4 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
    
    // Реакция на нажатие Enter в поле ввода имени
    userName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateButton.click();
        }
    });
}); 