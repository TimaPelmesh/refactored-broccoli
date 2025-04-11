document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылку на кнопку
    const startButton = document.querySelector('.start-button-container');
    // Скрываем кнопку при загрузке страницы
    if (startButton) {
        startButton.style.opacity = "0";
        startButton.style.visibility = "hidden";
    }
    
    // Добавляем эффект терминала для текста (печатающая машинка)
    const description = document.querySelector('.description');
    const originalHTML = description.innerHTML;
    const warningElement = document.querySelector('.warning');
    const warningHTML = warningElement.innerHTML;
    
    // Функция для добавления эффекта печатающейся машинки для элементов
    function typewriterEffect(element, text, speed = 20) {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = "";
            element.style.opacity = "1";
            
            const typing = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typing);
                    resolve();
                }
            }, speed);
        });
    }
    
    // Терминальный эффект при загрузке
    function terminalStartup() {
        description.innerHTML = ""; // Очищаем содержимое для эффекта
        const startupContainer = document.createElement('div');
        startupContainer.classList.add('terminal-startup');
        description.appendChild(startupContainer);
        
        const lines = [
            "> ЗАГРУЗКА СИСТЕМЫ...",
            "> ИНИЦИАЛИЗАЦИЯ БЕЗОПАСНОГО СОЕДИНЕНИЯ...",
            "> ШИФРОВАНИЕ КАНАЛА СВЯЗИ...",
            "> ПРОВЕРКА ЦЕЛОСТНОСТИ ДАННЫХ...",
            "> ДОСТУП РАЗРЕШЕН.",
            "> ЗАПУСК КВЕСТА...",
        ];
        
        async function typeLines() {
            for (let i = 0; i < lines.length; i++) {
                const line = document.createElement('div');
                line.classList.add('terminal-line');
                startupContainer.appendChild(line);
                await typewriterEffect(line, lines[i], 30);
                await new Promise(r => setTimeout(r, 300));
            }
            
            // После окончания эффекта загрузки, загружаем оригинальный контент
            setTimeout(() => {
                description.innerHTML = originalHTML;
                description.classList.add('fade-in');
                addMatrixEffect();
                
                // Показываем кнопку старта через небольшую задержку
                setTimeout(() => {
                    if (startButton) {
                        startButton.style.visibility = "visible";
                        startButton.style.opacity = "1";
                        startButton.style.transition = "opacity 0.8s ease";
                    }
                }, 800);
            }, 800);
        }
        
        typeLines();
    }
    
    // Запускаем терминальный эффект при загрузке
    setTimeout(terminalStartup, 500);
    
    // Добавляем эффект парящих символов в стиле "Матрицы"
    function addMatrixEffect() {
        const container = document.querySelector('.container');
        
        for (let i = 0; i < 20; i++) {
            const symbol = document.createElement('div');
            symbol.classList.add('matrix-symbol');
            symbol.style.left = `${Math.random() * 100}%`;
            symbol.style.top = `${Math.random() * 100}%`;
            symbol.style.animationDuration = `${Math.random() * 10 + 5}s`;
            symbol.style.animationDelay = `${Math.random() * 5}s`;
            symbol.textContent = ['0', '1', '{', '}', '[', ']', '>', '<', '#', '$', '%', '&', '*', '+', '=', '/', '\\'][Math.floor(Math.random() * 17)];
            container.appendChild(symbol);
        }
    }
    
    // Добавляем эффект курсора мыши
    function addCustomCursor() {
        const cursor = document.createElement('div');
        cursor.classList.add('cursor');
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    }
    
    addCustomCursor();
    
    // Добавляем эффект глюка на заголовок при клике
    const title = document.querySelector('h1');
    title.addEventListener('click', () => {
        title.classList.add('title-glitch');
        setTimeout(() => {
            title.classList.remove('title-glitch');
        }, 500);
    });
});

// Добавляем CSS для эффектов, созданных через JS
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 1s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .terminal-line {
        margin-bottom: 0.5rem;
        color: var(--terminal-green);
        font-family: 'JetBrains Mono', monospace;
    }
    
    .matrix-symbol {
        position: absolute;
        color: var(--accent-color);
        opacity: 0.2;
        font-size: 1.5rem;
        font-weight: bold;
        pointer-events: none;
        animation: float linear infinite;
        z-index: -1;
    }
    
    @keyframes float {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0.2;
        }
    }
    
    .cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--accent-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        mix-blend-mode: difference;
        transition: transform 0.1s ease;
        z-index: 9999;
    }
    
    .title-glitch {
        animation: titleGlitch 0.5s ease;
    }
    
    @keyframes titleGlitch {
        0% {
            transform: translate(0);
            text-shadow: 0 0 5px var(--accent-color);
        }
        20% {
            transform: translate(-5px, 5px);
            text-shadow: -5px 0 5px var(--warning-color), 5px 0 5px var(--accent-color);
        }
        40% {
            transform: translate(5px, -5px);
            text-shadow: 5px 0 5px var(--warning-color), -5px 0 5px var(--accent-color);
        }
        60% {
            transform: translate(-3px, 2px);
            text-shadow: 2px 0 5px var(--warning-color), -2px 0 5px var(--accent-color);
        }
        80% {
            transform: translate(3px, -2px);
            text-shadow: -2px 0 5px var(--warning-color), 2px 0 5px var(--accent-color);
        }
        100% {
            transform: translate(0);
            text-shadow: 0 0 5px var(--accent-color);
        }
    }
`;

document.head.appendChild(style); 