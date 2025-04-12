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
        
        // Отображаем элементы ввода
        document.getElementById('user-input').style.display = 'block';
        document.getElementById('send-button').style.display = 'block';
        
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
                            
                            setTimeout(() => {
                                agentResponse("Последний раз его видели на пляже... Затем его след теряется.");
                                updateProgress(10);
                                
                                setTimeout(() => {
                                    showResponseButtons(['Кто мог его похитить?']);
                                    isProcessingResponse = false;
                                }, 2000);
                            }, 3000);
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
        else if (currentStep === 1) {
            currentStep = 2;
            
            setTimeout(() => {
                agentResponse("Tralalelo был лучшим агентом в своем деле. Его навыки шифрования и дешифрования информации не имели равных.");
                
                setTimeout(() => {
                    agentResponse("Я подозреваю в его исчезновении своего давнего неприятеля - Bobritto bandito.");
                    addHint("Bobritto bandito - известен своими кибератаками и похищением секретных данных");
                    
                    setTimeout(() => {
                        agentResponse("Прежде чем допустить тебя к расследованию, я должен проверить твои знания в области информатики.");
                        updateProgress(20);
                        
                        setTimeout(() => {
                            // Задаем первый вопрос
                            agentResponse("Вопрос №1: Как называется система счисления с основанием 2?");
                            
                            setTimeout(() => {
                                showResponseButtons(['Двоичная', 'Восьмеричная', 'Десятичная', 'Шестнадцатеричная']);
                                isProcessingResponse = false;
                            }, 1000);
                        }, 2000);
                    }, 3000);
                }, 3000);
            }, 1000);
        }
        else if (currentStep === 2) {
            // Проверка ответа на первый вопрос
            if (userResponse.includes("двоичная") || userResponse.includes("binary")) {
                currentStep = 3;
                updateProgress(30);
                
                setTimeout(() => {
                    agentResponse("Правильно! Двоичная система счисления - основа компьютерных вычислений.");
                    
                    setTimeout(() => {
                        // Задаем второй вопрос
                        agentResponse("Вопрос №2: Какое устройство обрабатывает информацию в компьютере?");
                        
                        setTimeout(() => {
                            showResponseButtons(['Процессор', 'Видеокарта', 'Оперативная память', 'Жесткий диск']);
                            isProcessingResponse = false;
                        }, 1000);
                    }, 2000);
                }, 1000);
            } else {
                setTimeout(() => {
                    agentResponse("Это неверный ответ. Попробуй еще раз.");
                    
                    setTimeout(() => {
                        showResponseButtons(['Двоичная', 'Восьмеричная', 'Десятичная', 'Шестнадцатеричная']);
                        isProcessingResponse = false;
                    }, 1000);
                }, 1000);
            }
        }
        else if (currentStep === 3) {
            // Проверка ответа на второй вопрос
            if (userResponse.includes("процессор") || userResponse.includes("cpu")) {
                currentStep = 4;
                updateProgress(40);
                
                setTimeout(() => {
                    agentResponse("Верно! Процессор - это 'мозг' компьютера.");
                    
                    setTimeout(() => {
                        // Задаем третий вопрос
                        agentResponse("Вопрос №3: Как называется вредоносная программа, которая блокирует доступ к файлам и требует выкуп?");
                        
                        setTimeout(() => {
                            showResponseButtons(['Ransomware (Программа-вымогатель)', 'Вирус', 'Троян', 'Червь']);
                            isProcessingResponse = false;
                        }, 1000);
                    }, 2000);
                }, 1000);
            } else {
                setTimeout(() => {
                    agentResponse("Нет, это неправильный ответ. Попробуй снова.");
                    
                    setTimeout(() => {
                        showResponseButtons(['Процессор', 'Видеокарта', 'Оперативная память', 'Жесткий диск']);
                        isProcessingResponse = false;
                    }, 1000);
                }, 1000);
            }
        }
        else if (currentStep === 4) {
            // Проверка ответа на третий вопрос
            if (userResponse.includes("ransomware") || userResponse.includes("вымогатель")) {
                currentStep = 5;
                updateProgress(50);
                
                agentResponse("Верно! Ransomware (программа-вымогатель) шифрует файлы пользователя и требует выкуп за ключ расшифровки.");
                
                setTimeout(() => {
                    // Создаем специальное сообщение агента с кнопкой
                    const agentMessageWithButton = document.createElement('div');
                    agentMessageWithButton.classList.add('message', 'agent-message');
                    
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
                    
                    const messageText = document.createElement('p');
                    messageText.textContent = "Отлично! Я открою для тебя удаленный доступ к ноутбуку Tralalelo. Тебе нужно найти в терминале информацию о его местонахождении.";
                    messageContent.appendChild(messageText);
                    
                    // Создаем красивую кнопку как часть сообщения агента
                    const laptopButtonContainer = document.createElement('div');
                    laptopButtonContainer.style.marginTop = "12px";
                    
                    const laptopButton = document.createElement('button');
                    laptopButton.textContent = "ПЕРЕЙТИ К НОУТБУКУ";
                    laptopButton.style.backgroundColor = "var(--accent-color)";
                    laptopButton.style.color = "var(--background-color)";
                    laptopButton.style.border = "none";
                    laptopButton.style.padding = "10px 20px";
                    laptopButton.style.borderRadius = "5px";
                    laptopButton.style.fontFamily = "'JetBrains Mono', monospace";
                    laptopButton.style.fontWeight = "bold";
                    laptopButton.style.fontSize = "0.9rem";
                    laptopButton.style.cursor = "pointer";
                    laptopButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
                    laptopButton.style.transition = "all 0.3s ease";
                    laptopButton.style.width = "100%";
                    laptopButton.style.display = "flex";
                    laptopButton.style.justifyContent = "center";
                    laptopButton.style.alignItems = "center";
                    
                    // Добавляем эффект наведения через класс
                    const style = document.createElement('style');
                    style.textContent = `
                        .laptop-access-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 12px rgba(0, 179, 255, 0.4);
                            background-color: var(--button-hover) !important;
                        }
                    `;
                    document.head.appendChild(style);
                    
                    laptopButton.classList.add('laptop-access-button');
                    
                    // Обработчик клика на кнопку
                    laptopButton.addEventListener('click', function() {
                        // Открываем ноутбук в новом окне
                        let laptopWindow = window.open('laptop.html', '_blank', 'width=1024,height=768');
                        setTimeout(() => {
                            agentResponse("Твоя задача - раздобыть координаты подводной лаборатории.");
                            enableKeyboard();
                            isProcessingResponse = false;
                        }, 1000);
                    });
                    
                    laptopButtonContainer.appendChild(laptopButton);
                    messageContent.appendChild(laptopButtonContainer);
                    
                    agentMessageWithButton.appendChild(messageHeader);
                    agentMessageWithButton.appendChild(messageContent);
                    
                    // Добавляем в чат
                    chatContainer.appendChild(agentMessageWithButton);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    
                    isProcessingResponse = false;
                }, 2000);
            } else {
                setTimeout(() => {
                    agentResponse("Это неверный ответ. Попробуй еще раз.");
                    
                    setTimeout(() => {
                        showResponseButtons(['Ransomware (Программа-вымогатель)', 'Вирус', 'Троян', 'Червь']);
                        isProcessingResponse = false;
                    }, 1000);
                }, 1000);
            }
        }
        else if (currentStep === 5) {
            // Проверка координат или ключевых слов о местоположении
            if (userResponse.includes("41°24'12.2\"n") || 
                userResponse.includes("2°10'26.5\"e") || 
                userResponse.includes("подводная") && userResponse.includes("лаборатория") ||
                userResponse.includes("координаты") && userResponse.includes("41") && userResponse.includes("2")) {
                
                currentStep = 6;
                updateProgress(60);
                
                agentResponse("Отличная работа! Это действительно то, что мы искали. Теперь мы знаем, где искать Tralalelo. Подводная лаборатория - это место, где Bobritto проводит свои эксперименты.");
                
                setTimeout(() => {
                    // Сообщение от Bobritto
                    const bobMessage = document.createElement('div');
                    bobMessage.classList.add('message', 'agent-message');
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.classList.add('message-header');
                    
                    const messageSender = document.createElement('span');
                    messageSender.classList.add('message-sender');
                    messageSender.textContent = 'Bobritto bandito';
                    messageSender.style.color = '#ff9900';
                    
                    const messageTime = document.createElement('span');
                    messageTime.classList.add('message-time');
                    const now = new Date();
                    messageTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    
                    messageHeader.appendChild(messageSender);
                    messageHeader.appendChild(messageTime);
                    
                    const messageContent = document.createElement('div');
                    messageContent.classList.add('message-content');
                    
                    const paragraph = document.createElement('p');
                    paragraph.textContent = "Так-так-так, кто это тут взламывает мои системы? Впечатляюще, должен признать.";
                    messageContent.appendChild(paragraph);
                    
                    bobMessage.appendChild(messageHeader);
                    bobMessage.appendChild(messageContent);
                    
                    chatContainer.appendChild(bobMessage);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    
                    setTimeout(() => {
                        const bobMessage2 = document.createElement('div');
                        bobMessage2.classList.add('message', 'agent-message');
                        
                        const messageHeader2 = document.createElement('div');
                        messageHeader2.classList.add('message-header');
                        
                        const messageSender2 = document.createElement('span');
                        messageSender2.classList.add('message-sender');
                        messageSender2.textContent = 'Bobritto bandito';
                        messageSender2.style.color = '#ff9900';
                        
                        const messageTime2 = document.createElement('span');
                        messageTime2.classList.add('message-time');
                        messageTime2.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                        
                        messageHeader2.appendChild(messageSender2);
                        messageHeader2.appendChild(messageTime2);
                        
                        const messageContent2 = document.createElement('div');
                        messageContent2.classList.add('message-content');
                        
                        const paragraph2 = document.createElement('p');
                        paragraph2.textContent = "У меня для вас предложение. Я знаю, что вы ищете Tralalelo. Он жив и в безопасности... пока что. Я готов сказать вам, как его освободить, но вы должны пообещать не использовать полученный ключ. Он открывает доступ к очень чувствительной информации.";
                        messageContent2.appendChild(paragraph2);
                        
                        bobMessage2.appendChild(messageHeader2);
                        bobMessage2.appendChild(messageContent2);
                        
                        chatContainer.appendChild(bobMessage2);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                        
                        setTimeout(() => {
                            const bobMessage3 = document.createElement('div');
                            bobMessage3.classList.add('message', 'agent-message');
                            
                            const messageHeader3 = document.createElement('div');
                            messageHeader3.classList.add('message-header');
                            
                            const messageSender3 = document.createElement('span');
                            messageSender3.classList.add('message-sender');
                            messageSender3.textContent = 'Bobritto bandito';
                            messageSender3.style.color = '#ff9900';
                            
                            const messageTime3 = document.createElement('span');
                            messageTime3.classList.add('message-time');
                            messageTime3.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                            
                            messageHeader3.appendChild(messageSender3);
                            messageHeader3.appendChild(messageTime3);
                            
                            const messageContent3 = document.createElement('div');
                            messageContent3.classList.add('message-content');
                            
                            const paragraph3 = document.createElement('p');
                            paragraph3.textContent = "Что скажете? Сделка?";
                            messageContent3.appendChild(paragraph3);
                            
                            bobMessage3.appendChild(messageHeader3);
                            bobMessage3.appendChild(messageContent3);
                            
                            chatContainer.appendChild(bobMessage3);
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                            
                            setTimeout(() => {
                                showResponseButtons(['Согласиться на сделку', 'Отказаться от сделки']);
                                isProcessingResponse = false;
                            }, 1000);
                        }, 2000);
                    }, 3000);
                }, 1000);
            } else {
                agentResponse("Это не то что мне нужно. Попробуй еще раз.");
                isProcessingResponse = false;
            }
        }
        else if (currentStep === 6) {
            // Реакция на решение пользователя о сделке с Bobritto
            currentStep = 7;
            updateProgress(90);
            
            if (userResponse.toLowerCase().includes("соглас") || userResponse.toLowerCase().includes("сделк")) {
                // Пользователь согласился на сделку
                setTimeout(() => {
                    const bobMessage = document.createElement('div');
                    bobMessage.classList.add('message', 'agent-message');
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.classList.add('message-header');
                    
                    const messageSender = document.createElement('span');
                    messageSender.classList.add('message-sender');
                    messageSender.textContent = 'Bobritto bandito';
                    messageSender.style.color = '#ff9900';
                    
                    const messageTime = document.createElement('span');
                    messageTime.classList.add('message-time');
                    const now = new Date();
                    messageTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    
                    messageHeader.appendChild(messageSender);
                    messageHeader.appendChild(messageTime);
                    
                    const messageContent = document.createElement('div');
                    messageContent.classList.add('message-content');
                    
                    const paragraph = document.createElement('p');
                    paragraph.textContent = "Мудрое решение. Tralalelo находится в подводной лаборатории по координатам, которые вы обнаружили. Код для его освобождения: DUCK-BOBBY-POWER.";
                    messageContent.appendChild(paragraph);
                    
                    const paragraph2 = document.createElement('p');
                    paragraph2.textContent = "Не пытайтесь обмануть меня. Я буду следить.";
                    messageContent.appendChild(paragraph2);
                    
                    bobMessage.appendChild(messageHeader);
                    bobMessage.appendChild(messageContent);
                    
                    chatContainer.appendChild(bobMessage);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    
                    setTimeout(() => {
                        agentResponse("[приватно] Нам пришлось пойти на компромисс, но главное - мы знаем, где Tralalelo и как его освободить. Немедленно высылаю спасательную команду.");
                        
                        setTimeout(() => {
                            updateProgress(100);
                            agentResponse("Миссия выполнена успешно! Tralalelo спасен и передает тебе благодарность за помощь.");
                            isProcessingResponse = false;
                        }, 3000);
                    }, 2000);
                }, 1000);
            } else {
                // Пользователь отказался от сделки
                setTimeout(() => {
                    const bobMessage = document.createElement('div');
                    bobMessage.classList.add('message', 'agent-message');
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.classList.add('message-header');
                    
                    const messageSender = document.createElement('span');
                    messageSender.classList.add('message-sender');
                    messageSender.textContent = 'Bobritto bandito';
                    messageSender.style.color = '#ff9900';
                    
                    const messageTime = document.createElement('span');
                    messageTime.classList.add('message-time');
                    const now = new Date();
                    messageTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    
                    messageHeader.appendChild(messageSender);
                    messageHeader.appendChild(messageTime);
                    
                    const messageContent = document.createElement('div');
                    messageContent.classList.add('message-content');
                    
                    const paragraph = document.createElement('p');
                    paragraph.textContent = "Очень жаль. Вы пожалеете об этом решении.";
                    messageContent.appendChild(paragraph);
                    
                    bobMessage.appendChild(messageHeader);
                    bobMessage.appendChild(messageContent);
                    
                    chatContainer.appendChild(bobMessage);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    
                    setTimeout(() => {
                        agentResponse("Не беспокойтесь! Мы использовали ваше подключение, чтобы отследить местоположение Bobritto. Наша команда уже в пути. А ключ нам пригодится, чтобы получить доступ к системам безопасности и освободить Tralalelo.");
                        
                        setTimeout(() => {
                            updateProgress(100);
                            agentResponse("Миссия выполнена успешно! Tralalelo спасен и передает вам благодарность за помощь. Bobritto арестован и предстанет перед судом.");
                            isProcessingResponse = false;
                        }, 3000);
                    }, 2000);
                }, 1000);
            }
        }
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
    
    // Функция для отображения чата и инициализации квеста
    function initQuest() {
        // Отображаем элементы интерфейса
        document.getElementById('chat-container').style.display = 'flex';
        document.querySelector('.agent-profile').style.display = 'flex';
        document.querySelector('.progress-container').style.display = 'block';
        document.querySelector('.hints-container').style.display = 'block';
        
        // Подготовка контейнера для кнопок ответов
        const responseButtonsContainer = document.getElementById('response-buttons');
        responseButtonsContainer.style.display = 'flex';
        responseButtonsContainer.classList.remove('hidden');
        
        // Скрываем поле ввода и кнопку отправки
        document.getElementById('user-input').style.display = 'none';
        document.getElementById('send-button').style.display = 'none';
        inputContainer.style.display = 'none';

        // Установка начальных значений прогресса
        currentStep = 0;
        progress = 0;
        keyboardEnabled = false;
        updateProgress(0);

        // Показываем только первое сообщение с вопросом
        setTimeout(() => {
            createMessage(`Мне нужна твоя помощь. Ты готов начать миссию?`, true);
            
            setTimeout(() => {
                showResponseButtons(['Да, я готов']);
            }, 1000);
        }, 1000);
    }
    
    // Запускаем квест
    initQuest();

    // Обработчик фокуса окна - только активация текстового поля ввода без сообщений
    window.addEventListener('focus', function() {
        if (currentStep === 5 && keyboardEnabled) {
            // Ничего не делаем, просто даем возможность ввода
        }
    });

    // Проверяем при загрузке страницы, нужно ли активировать поле ввода - без сообщений
    document.addEventListener('DOMContentLoaded', function() {
        if (currentStep === 5) {
            setTimeout(() => {
                enableKeyboard();
                agentResponse("Рассчитай вероятность и введи ответ.");
            }, 1500);
        }
        
        // Удаляем любые оставшиеся фиксированные кнопки
        const fixedButtons = document.querySelectorAll('[id*="fixed"], [id*="force"], [id*="coord"], [class*="coord-button"]');
        fixedButtons.forEach(button => {
            if (button && button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
    });

    // Обработка сообщений от дочернего окна терминала
    window.addEventListener('message', function(event) {
        // Проверяем, что сообщение от терминала с найденными данными
        if (event.data && event.data.type === 'terminalDataFound') {
            // Если мы на этапе, где ждем информацию из терминала
            if (currentStep === 5) {
                enableKeyboard();
            }
        }
        // Обработка просто закрытия терминала
        else if (event.data && event.data.type === 'terminalClosed') {
            // Если мы на этапе, где ждем информацию из терминала
            if (currentStep === 5) {
                enableKeyboard();
            }
        }
    });

    // Удаляем обработчик visibilitychange с сообщением о вероятности
    document.addEventListener('visibilitychange', function() {
        // Пустой обработчик или можно удалить совсем
    });
}); 