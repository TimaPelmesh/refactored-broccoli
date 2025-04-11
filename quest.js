document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const timeDisplay = document.getElementById('current-time');
    const progressBar = document.getElementById('mission-progress');
    const progressText = document.querySelector('.progress-text');
    const hintList = document.getElementById('hint-list');
    const inputContainer = document.querySelector('.input-container');
    
    // Состояние квеста
    let currentStep = 0;
    let progress = 0;
    let hints = [];
    let keyboardEnabled = false; // Изначально клавиатура отключена
    let lastAgentMessage = ""; // Для предотвращения дублирования сообщений
    let isProcessingResponse = false; // Флаг для предотвращения множественных вызовов
    
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
    
    // Функция создания сообщения
    function createMessage(content, isAgent = false, withImage = false) {
        const message = document.createElement('div');
        message.classList.add('message');
        message.classList.add(isAgent ? 'agent-message' : 'user-message');
        
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');
        
        const messageSender = document.createElement('span');
        messageSender.classList.add('message-sender');
        messageSender.textContent = isAgent ? 'Spijuniro Golubiro' : 'Вы';
        
        const messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        const now = new Date();
        messageTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageHeader.appendChild(messageSender);
        messageHeader.appendChild(messageTime);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Добавляем изображение, если это сообщение с фото
        if (withImage) {
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('message-image');
            const image = document.createElement('img');
            image.src = 'tralalelo.jpg';
            image.alt = 'Пропавший Tralalelo Tralala';
            imageContainer.appendChild(image);
            messageContent.appendChild(imageContainer);
            const imageCaption = document.createElement('p');
            imageCaption.textContent = "Последнее фото Tralalelo Tralala перед пропажей";
            imageCaption.classList.add('image-caption');
            messageContent.appendChild(imageCaption);
        }
        
        // Добавляем текст сообщения
        const messageText = document.createElement('p');
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        message.appendChild(messageHeader);
        message.appendChild(messageContent);
        
        chatContainer.appendChild(message);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Эффекты печатающейся машинки для агента
        if (isAgent) {
            // Симуляция печати
            messageText.textContent = "";
            let i = 0;
            const typing = setInterval(() => {
                if (i < content.length) {
                    messageText.textContent += content.charAt(i);
                    i++;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                } else {
                    clearInterval(typing);
                }
            }, 20);
        }
    }
    
    // Функция для создания кнопки быстрого ответа
    function createResponseButtons(responses) {
        // Скрываем обычный ввод
        inputContainer.style.display = 'none';
        
        // Создаем контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('response-buttons');
        
        // Создаем кнопки для каждого ответа
        responses.forEach(response => {
            const button = document.createElement('button');
            button.classList.add('response-button');
            button.textContent = response;
            button.addEventListener('click', () => {
                // Удаляем контейнер с кнопками
                buttonsContainer.remove();
                
                // Показываем сообщение пользователя
                createMessage(response);
                
                // Показываем обычный ввод, если включена клавиатура
                if (keyboardEnabled) {
                    inputContainer.style.display = 'flex';
                }
                
                // Проверяем ответ пользователя
                checkUserResponse(response);
            });
            buttonsContainer.appendChild(button);
        });
        
        // Добавляем контейнер с кнопками в чат
        chatContainer.appendChild(buttonsContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Функция для обновления прогресса квеста
    function updateProgress(newProgress) {
        progress = newProgress;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }
    
    // Функция для добавления подсказки
    function addHint(text) {
        if (hints.includes(text)) return;
        
        hints.push(text);
        
        // Очищаем "Нет подсказок", если это первая подсказка
        if (hints.length === 1) {
            hintList.innerHTML = '';
        }
        
        const hint = document.createElement('div');
        hint.classList.add('hint');
        hint.textContent = text;
        hintList.appendChild(hint);
    }
    
    // Функция для включения клавиатуры
    function enableKeyboard() {
        keyboardEnabled = true;
        inputContainer.style.display = 'flex';
        
        // Скрываем кнопки ответов
        const responseButtons = document.getElementById('response-buttons');
        if (responseButtons) {
            responseButtons.classList.add('hidden');
        }
        
        // Показываем клавиатуру, если она есть
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) {
            keyboardContainer.classList.remove('hidden');
        }
    }
    
    // Функция для отображения сообщения от агента
    function agentResponse(message, hasImage = false) {
        // Проверяем, не отправляли ли мы уже такое сообщение недавно
        // Проверяем наличие идентичного сообщения среди последних 5 сообщений
        const existingMessages = chatContainer.querySelectorAll('.message.agent-message');
        const lastMessages = Array.from(existingMessages).slice(-5);
        
        for (const msg of lastMessages) {
            const content = msg.querySelector('.message-content p')?.textContent;
            if (content === message) {
                console.log("Предотвращено дублирование сообщения агента:", message);
                return;
            }
        }
        
        lastAgentMessage = message;
        
        // Сначала показываем индикатор печати
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'agent-message', 'typing-message');
        typingIndicator.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.classList.add('typing-indicator');
        typingContent.innerHTML = '<span></span><span></span><span></span>';
        
        typingIndicator.appendChild(typingContent);
        chatContainer.appendChild(typingIndicator);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Через небольшую задержку показываем само сообщение
        setTimeout(() => {
            // Удаляем индикатор печати, если он еще существует
            const typingElement = document.getElementById('typing-indicator');
            if (typingElement) {
                typingElement.remove();
            }
            
            // Создаем и показываем сообщение
            createMessage(message, true, hasImage);
        }, 1200);
    }
    
    // Функция для отображения изображения
    function showImage(imageSrc, altText) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('message');
        imageContainer.classList.add('agent-message');
        
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');
        
        const messageSender = document.createElement('span');
        messageSender.classList.add('message-sender');
        messageSender.textContent = 'Spijuniro Golubiro';
        
        const messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        const now = new Date();
        messageTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageHeader.appendChild(messageSender);
        messageHeader.appendChild(messageTime);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const image = document.createElement('img');
        image.src = imageSrc;
        image.alt = altText;
        image.classList.add('quest-image');
        
        messageContent.appendChild(image);
        
        imageContainer.appendChild(messageHeader);
        imageContainer.appendChild(messageContent);
        
        chatContainer.appendChild(imageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Обработчик отправки сообщения пользователем
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        createMessage(message);
        
        // Очищаем поле ввода
        userInput.value = '';
        
        // Проверяем ответ и определяем следующий шаг
        checkUserResponse(message);
    }
    
    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Добавление звуковых эффектов
    function addSoundEffects() {
        // Звук отправки сообщения
        const sendSound = new Audio();
        sendSound.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhEAGbaAIkhv4IQABLqTX9RRMQg4mIQJhEwhHAaCIQjQBAEAwmCCYP8TOPnOcfwfB9+DgIAgCAIA+D4Pv4Pn/B8Hwf5//8Hwf/gyD4Pv//5cEwT/P//+D//U/E3O4zMzveISQiIiIYmfqf///50kIGGWQhCxpIEEsaSP/7UMQFg+n5KRAI2ngCJqReAAGaLDGkkiyxc0kSNJIuWL9JIj9JIuaSLmkkXLF7SRfpJIksXpJIvVy/0kiSxekki5Yv0ki/4v0kfWL+kj6NJF+L2lj6itJayGiYPiNZYt3bJSK7h8pfMX7JSmyTBMH4mD4maZL2SiYPxMHwfCYJg/EwfB9Ef9Gl/Oz9TOgAAAAAAAAAAAAAAAAAAAD/+1LEBIPbFTcQANpYAk8GmAAiSgAAAEgVCSgAAJgqFQKAgGgsAAF5QKqTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";
        sendSound.load();
        
        // Звук получения сообщения от агента
        const receiveSound = new Audio();
        receiveSound.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADBoAhEAGbaAIMiGIAQABF6l5QkeISEiIhIRCQiDaIREQkRCQiGEQkRCIiEn4RCe+ZmZj+d8zMzO7u9J37MzMzEIibncREe+ZmT8Ii/zMzj+ZmeYiJnzMzMzETTfMzMzMxETieZmZmYiJpvzMzMzebu1K1GUxRKJelFbD/qrlbtRjW+pi2PcX/+1DECgPp8SrwKNNKAjcVVgEaZ0K9XvK3anKOUV3TtmfLILmXdE21amVbqkVXdMqt1aqVW6kAAKAEAABjzgAAA+IAAJBwfEAAfIAAEwDPAACcAzwAAn4BngABPwGeABBPwDPAQT9PwGeRBP0/AM8RBPz8AzxEE/PwDPHwT88AiPHwT88AiPHw/PxEE/Xh/XxEE/Pws9YgCA+IAEGdBa6oKQZcFxhPRNu7w5QZK7Q//tSxAoCPTVdEgHKOAkMGYcAOMcAu8DXeJFwgpArZAMpRXqZQkxDTUAhRReENTELTtKN6BqrAaGW7UDStM0jStQaPW6LVQ2bGMY262MYxpt2xjbSt1uiHS6K7bdFqt0WhPZztkV26K7bbortuit2y0K7dFbtt0V22borttkV22yK7YxW3dFbt/bortuit223SXbborbgrtjFbpui2226KTZztkV7ui3WxituOS60MYxXYCgAAAAA=";
        receiveSound.load();
        
        // Добавляем обработчики
        sendButton.addEventListener('click', () => {
            if (userInput.value.trim() !== '') {
                sendSound.play();
            }
        });
        
        // Мониторим добавление сообщений агента
        const originalCreateMessage = createMessage;
        createMessage = function(content, isAgent = false, withImage = false) {
            originalCreateMessage(content, isAgent, withImage);
            if (isAgent) {
                setTimeout(() => {
                    receiveSound.play();
                }, 500);
            }
        };
    }
    
    // Проверка ответа пользователя
    function checkUserResponse(response) {
        // Предотвращаем множественную обработку одного и того же ответа
        if (isProcessingResponse) {
            console.log("Обработка предыдущего ответа еще не завершена");
            return;
        }
        
        isProcessingResponse = true;
        console.log("Обработка ответа: ", response, "Текущий шаг:", currentStep);
        
        // Приведение ответа пользователя к нижнему регистру для удобства сравнения
        const userResponse = response.toLowerCase();
        
        // Если мы еще в начале квеста, проверяем готовность пользователя
        if (currentStep === 0) {
            const readyResponses = ["да", "конечно", "готов", "давай", "начнем", "я готов", "поехали", "вперед", "ок", "yes"];
            
            if (readyResponses.some(answer => userResponse.includes(answer))) {
                // Пользователь готов, продолжаем квест
                currentStep = 1;
                
                // Задержка перед следующим сообщением агента
                setTimeout(() => {
                    agentResponse("Отлично! Меня зовут Spijuniro Golubiro, я агент секретной службы голубиной почты.");
                    
                    setTimeout(() => {
                        agentResponse("Мне нужна твоя помощь в поисках пропавшего агента - Tralalelo Tralala.");
                        
                        setTimeout(() => {
                            agentResponse("Вот его фотография:", true);
                            
                            // После фотографии диалог завершается, заданий не даем
                            isProcessingResponse = false;
                            // На этом диалог заканчивается - уже ничего не пишем и не спрашиваем
                        }, 2000);
                    }, 2000);
                }, 1000);
            } else {
                // Пользователь ответил что-то другое, просим ответить снова
                agentResponse("Мне нужна твоя помощь. Ты готов начать миссию?");
                setTimeout(() => {
                    showResponseButtons(['Да, я готов']);
                    isProcessingResponse = false;
                }, 1000);
            }
        }
        // Все остальные шаги мы больше не обрабатываем, так как диалог завершается после фотографии
        else {
            isProcessingResponse = false;
        }
    }
    
    // Функция для показа кнопок с вариантами ответов
    function showResponseButtons(options) {
        // Получаем или создаем контейнер для кнопок
        let responseButtons = document.getElementById('response-buttons');
        if (!responseButtons) {
            responseButtons = document.createElement('div');
            responseButtons.id = 'response-buttons';
            responseButtons.classList.add('response-buttons');
            chatContainer.appendChild(responseButtons);
        }
        
        // Очищаем существующие кнопки
        responseButtons.innerHTML = '';
        
        // Добавляем новые кнопки
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('response-button');
            button.addEventListener('click', function() {
                const userMsg = this.textContent;
                
                // Скрываем кнопки ответов
                responseButtons.classList.add('hidden');
                
                // Показываем сообщение пользователя
                createMessage(userMsg, false);
                
                // Проверяем ответ
                checkUserResponse(userMsg);
            });
            responseButtons.appendChild(button);
        });
        
        // Показываем кнопки
        responseButtons.classList.remove('hidden');
        
        // Скрываем клавиатуру
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) {
            keyboardContainer.classList.add('hidden');
        }
        
        // Скрываем поле ввода
        inputContainer.style.display = 'none';
    }
    
    // Инициализация квеста
    function initQuest() {
        // Очищаем состояние квеста
        currentStep = 0;
        progress = 0;
        hints = [];
        lastAgentMessage = "";
        keyboardEnabled = false;
        isProcessingResponse = false;
        
        // Очищаем контейнер чата
        chatContainer.innerHTML = '';
        
        // Очищаем и сбрасываем прогресс
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        // Очищаем подсказки
        hintList.innerHTML = '<p class="no-hints">Подсказки появятся по мере прохождения квеста</p>';
        
        // Скрываем клавиатуру
        const keyboardContainer = document.getElementById('keyboard-container') || 
            document.createElement('div');
        keyboardContainer.id = 'keyboard-container';
        keyboardContainer.classList.add('hidden');
        
        // Если контейнер для клавиатуры еще не добавлен в DOM
        if (!document.getElementById('keyboard-container')) {
            inputContainer.parentNode.appendChild(keyboardContainer);
        }
        
        // Скрываем поле ввода
        inputContainer.style.display = 'none';
        
        // Очищаем и подготавливаем контейнер для кнопок
        let responseButtons = document.getElementById('response-buttons');
        if (responseButtons) {
            responseButtons.innerHTML = '';
            responseButtons.classList.add('hidden');
        } else {
            responseButtons = document.createElement('div');
            responseButtons.id = 'response-buttons';
            responseButtons.classList.add('response-buttons', 'hidden');
            chatContainer.appendChild(responseButtons);
        }
        
        // Отображаем первое сообщение через небольшую задержку
        setTimeout(() => {
            // Единственное первое сообщение с вопросом
            agentResponse("Приветствую! Я нуждаюсь в твоей помощи для выполнения важной миссии. Ты готов помочь?");
            
            // Показываем кнопки с вариантами ответа, убираем опцию "Нет, не сейчас"
            setTimeout(() => {
                showResponseButtons(['Да, я готов']);
            }, 1500);
        }, 1000);
    }
    
    // Запускаем квест
    initQuest();
}); 