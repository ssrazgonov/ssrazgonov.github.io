// Мобильное управление для jsdoom
class MobileControls {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isVisible = false;
        this.movementActive = false;
        this.movementCenter = { x: 0, y: 0 };
        this.movementStick = { x: 0, y: 0 };
        this.keys = {};
        
        // Состояния клавиш движения для предотвращения дублирования событий
        this.currentUpState = false;
        this.currentDownState = false;
        this.currentLeftState = false;
        this.currentRightState = false;
        
        // Throttling для движения
        this.movementThrottle = null;
        
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }

    init() {
        if (!this.isMobile) return;

        this.createControls();
        this.bindEvents();
        this.showControls();
    }

    createControls() {
        // Создаем контейнер для мобильного управления
        this.container = document.createElement('div');
        this.container.className = 'mobile-controls';
        this.container.innerHTML = `
            <div class="movement-panel">
                <div class="movement-joystick">
                    <div class="movement-stick"></div>
                </div>
            </div>
            
            <div class="action-panel">
                <div class="action-button fire">FIRE</div>
                <div class="action-button use">USE</div>
                <div class="action-button enter">ENTER</div>
            </div>
        `;

        document.body.appendChild(this.container);
        
        // Сохраняем ссылки на элементы
        this.movementJoystick = this.container.querySelector('.movement-joystick');
        this.movementStick = this.container.querySelector('.movement-stick');
        this.actionButtons = this.container.querySelectorAll('.action-button');
    }

    bindEvents() {
        // Обработка движения (виртуальный джойстик)
        this.bindMovementEvents();
        
        // Обработка кнопок действий
        this.bindActionEvents();
        
        // Обработка центральных кнопок
        this.bindCenterEvents();
        
        // Обработка изменения размера экрана
        window.addEventListener('resize', () => this.handleResize());
        
        // Обработка ориентации устройства
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    }

    bindMovementEvents() {
        let startX, startY, joystickRect;

        const handleStart = (e) => {
            // Предотвращаем скроллинг только если это touch событие
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
            
            const touch = e.touches ? e.touches[0] : e;
            joystickRect = this.movementJoystick.getBoundingClientRect();
            startX = touch.clientX - joystickRect.left;
            startY = touch.clientY - joystickRect.top;
            this.movementCenter = {
                x: joystickRect.width / 2,
                y: joystickRect.height / 2
            };
            this.movementActive = true;
            this.movementJoystick.style.background = 'rgba(255, 136, 0, 0.3)';
        };

        const handleMove = (e) => {
            if (!this.movementActive) return;
            
            // Предотвращаем скроллинг только если это touchmove событие
            if (e.type === 'touchmove') {
                e.preventDefault();
            }
            
            const touch = e.touches ? e.touches[0] : e;
            const currentX = touch.clientX - joystickRect.left;
            const currentY = touch.clientY - joystickRect.top;
            
            const deltaX = currentX - this.movementCenter.x;
            const deltaY = currentY - this.movementCenter.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = joystickRect.width / 2 - 20;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                this.movementStick.x = Math.cos(angle) * maxDistance;
                this.movementStick.y = Math.sin(angle) * maxDistance;
            } else {
                this.movementStick.x = deltaX;
                this.movementStick.y = deltaY;
            }
            
            this.movementStick.style.transform = `translate(calc(-50% + ${this.movementStick.x}px), calc(-50% + ${this.movementStick.y}px))`;
            
            // Отправляем команды движения с throttling
            if (!this.movementThrottle) {
                this.movementThrottle = setTimeout(() => {
                    this.handleMovement(deltaX, deltaY);
                    this.movementThrottle = null;
                }, 50); // 20 FPS для движения
            }
        };

        const handleEnd = (e) => {
            this.movementActive = false;
            this.movementStick.style.transform = 'translate(-50%, -50%)';
            this.movementJoystick.style.background = 'rgba(0, 0, 0, 0.7)';
            
            // Очищаем throttling
            if (this.movementThrottle) {
                clearTimeout(this.movementThrottle);
                this.movementThrottle = null;
            }
            
            // Останавливаем движение
            this.stopMovement();
        };

        // Touch события с улучшенной обработкой
        this.movementJoystick.addEventListener('touchstart', handleStart, { passive: false });
        this.movementJoystick.addEventListener('touchmove', handleMove, { passive: false });
        this.movementJoystick.addEventListener('touchend', handleEnd, { passive: false });
        
        // Mouse события для тестирования на десктопе
        this.movementJoystick.addEventListener('mousedown', handleStart, { passive: false });
        this.movementJoystick.addEventListener('mousemove', handleMove, { passive: false });
        this.movementJoystick.addEventListener('mouseup', handleEnd, { passive: false });
        this.movementJoystick.addEventListener('mouseleave', handleEnd, { passive: false });
    }

    bindActionEvents() {
        this.actionButtons.forEach(button => {
            const action = button.className.split(' ')[1]; // Получаем тип действия
            
            const handleAction = (e) => {
                // Предотвращаем скроллинг только для touch событий
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                this.handleAction(action);
            };

            const handleEnd = (e) => {
                // Предотвращаем скроллинг только для touch событий
                if (e.type === 'touchend') {
                    e.preventDefault();
                }
            };

            // Touch события
            button.addEventListener('touchstart', handleAction, { passive: false });
            button.addEventListener('touchend', handleEnd, { passive: false });
            
            // Mouse события
            button.addEventListener('mousedown', handleAction, { passive: false });
            button.addEventListener('mouseup', handleEnd, { passive: false });
        });
    }

    bindCenterEvents() {
        // Центральная панель больше не используется
        // Метод оставлен для совместимости
    }

    handleMovement(deltaX, deltaY) {
        // Нормализуем значения от -1 до 1
        const normalizedX = Math.max(-1, Math.min(1, deltaX / 50));
        const normalizedY = Math.max(-1, Math.min(1, deltaY / 50));
        
        // Отправляем команды движения через Dosbox (эмулируем стрелки)
        if (window.dosbox && window.dosbox.module) {
            try {
                // Движение вперед/назад (стрелка вверх/вниз)
                const newUpState = normalizedY < -0.5;
                const newDownState = normalizedY > 0.5;
                
                if (newUpState !== this.currentUpState) {
                    this.currentUpState = newUpState;
                    console.log(`Движение ВВЕРХ: ${newUpState ? 'НАЖАТА' : 'ОТПУЩЕНА'}`);
                    this.sendKeyEvent(this.getKeyCode('ARROW_UP'), newUpState);
                }
                
                if (newDownState !== this.currentDownState) {
                    this.currentDownState = newDownState;
                    console.log(`Движение ВНИЗ: ${newDownState ? 'НАЖАТА' : 'ОТПУЩЕНА'}`);
                    this.sendKeyEvent(this.getKeyCode('ARROW_DOWN'), newDownState);
                }
                
                // Движение влево/вправо (стрелка влево/вправо)
                const newLeftState = normalizedX < -0.5;
                const newRightState = normalizedX > 0.5;
                
                if (newLeftState !== this.currentLeftState) {
                    this.currentLeftState = newLeftState;
                    console.log(`Движение ВЛЕВО: ${newLeftState ? 'НАЖАТА' : 'ОТПУЩЕНА'}`);
                    this.sendKeyEvent(this.getKeyCode('ARROW_LEFT'), newLeftState);
                }
                
                if (newRightState !== this.currentRightState) {
                    this.currentRightState = newRightState;
                    console.log(`Движение ВПРАВО: ${newRightState ? 'НАЖАТА' : 'ОТПУЩЕНА'}`);
                    this.sendKeyEvent(this.getKeyCode('ARROW_RIGHT'), newRightState);
                }
            } catch (error) {
                console.log('Movement error:', error);
            }
        }
    }

    stopMovement() {
        // Останавливаем движение
        if (window.dosbox && window.dosbox.module) {
            try {
                // Отпускаем все клавиши движения (стрелки) только если они были нажаты
                if (this.currentUpState) {
                    this.sendKeyEvent(this.getKeyCode('ARROW_UP'), false);
                    this.currentUpState = false;
                }
                if (this.currentDownState) {
                    this.sendKeyEvent(this.getKeyCode('ARROW_DOWN'), false);
                    this.currentDownState = false;
                }
                if (this.currentLeftState) {
                    this.sendKeyEvent(this.getKeyCode('ARROW_LEFT'), false);
                    this.currentLeftState = false;
                }
                if (this.currentRightState) {
                    this.sendKeyEvent(this.getKeyCode('ARROW_RIGHT'), false);
                    this.currentRightState = false;
                }
            } catch (error) {
                console.log('Stop movement error:', error);
            }
        }
    }

    handleAction(action) {
        // Обрабатываем основные действия
        switch (action) {
            case 'fire':
                this.simulateKey('CTRL'); // Стрельба
                break;
            case 'use':
                this.simulateKey('SPACE'); // Использование
                break;
            case 'enter':
                this.simulateKey('ENTER'); // Enter (меню, подтверждение)
                break;
        }
    }

    simulateKey(key) {
        // Симулируем нажатие клавиши
        if (window.dosbox && window.dosbox.module) {
            // Интеграция с js-dos API
            try {
                const keyCode = this.getKeyCode(key);
                if (keyCode !== null) {
                    console.log(`🎯 Действие: ${key} (код: ${keyCode})`);
                    
                    // Отправляем нажатие клавиши
                    this.sendKeyEvent(keyCode, true);  // keydown
                    setTimeout(() => {
                        this.sendKeyEvent(keyCode, false); // keyup
                    }, 100);
                } else {
                    console.log(`❌ Неизвестная клавиша: ${key}`);
                }
            } catch (error) {
                console.log('❌ Action:', key, 'Error:', error);
            }
        } else {
            console.log('❌ Dosbox не доступен для симуляции клавиш');
        }
    }

    getKeyCode(key) {
        // Маппинг клавиш для js-dos (используем стандартные коды)
        const keyMap = {
            'CTRL': 17,      // Ctrl (17)
            'SPACE': 32,     // Space (32)
            'ENTER': 13,     // Enter (13)
            'ESC': 27,       // Escape (27)
            'SHIFT': 16,     // Shift (16)
            'ALT': 18,       // Alt (18)
            'W': 87,         // W - вперед (87)
            'S': 83,         // S - назад (83)
            'A': 65,         // A - влево (65)
            'D': 68,         // D - вправо (68)
            'ARROW_UP': 38,     // Стрелка вверх (38)
            'ARROW_DOWN': 40,   // Стрелка вниз (40)
            'ARROW_LEFT': 37,   // Стрелка влево (37)
            'ARROW_RIGHT': 39   // Стрелка вправо (39)
        };
        return keyMap[key] || null;
    }

    getKeyCodeString(keyCode) {
        // Преобразуем код клавиши в строку для события
        const keyMap = {
            17: 'ControlLeft',    // Ctrl
            32: 'Space',          // Space
            13: 'Enter',          // Enter
            27: 'Escape',         // Escape
            16: 'ShiftLeft',      // Shift
            18: 'AltLeft',        // Alt
            87: 'KeyW',           // W
            83: 'KeyS',           // S
            65: 'KeyA',           // A
            68: 'KeyD',           // D
            38: 'ArrowUp',        // Стрелка вверх
            40: 'ArrowDown',      // Стрелка вниз
            37: 'ArrowLeft',      // Стрелка влево
            39: 'ArrowRight'      // Стрелка вправо
        };
        return keyMap[keyCode] || 'Unknown';
    }

    sendKeyEvent(keyCode, isDown) {
        // Отправляем событие клавиши через js-dos API
        if (window.dosbox && window.dosbox.module) {
            try {
                // Пытаемся использовать различные методы js-dos API
                let success = false;
                
                // Метод 1: shell API
                if (window.dosbox.module.shell && window.dosbox.module.shell.sendKeyEvent) {
                    try {
                        window.dosbox.module.shell.sendKeyEvent(keyCode, isDown);
                        console.log(`🚀 js-dos shell: ${isDown ? 'keydown' : 'keyup'} ${keyCode}`);
                        success = true;
                    } catch (e) {
                        console.log('Shell API error:', e);
                    }
                }
                
                // Метод 2: прямой sendKeyEvent
                if (!success && window.dosbox.module.sendKeyEvent) {
                    try {
                        window.dosbox.module.sendKeyEvent(keyCode, isDown);
                        console.log(`🚀 js-dos direct: ${isDown ? 'keydown' : 'keyup'} ${keyCode}`);
                        success = true;
                    } catch (e) {
                        console.log('Direct API error:', e);
                    }
                }
                
                // Метод 3: через Dos object
                if (!success && window.dosbox.Dos) {
                    try {
                        window.dosbox.Dos.sendKeyEvent(keyCode, isDown);
                        console.log(`🚀 js-dos Dos: ${isDown ? 'keydown' : 'keyup'} ${keyCode}`);
                        success = true;
                    } catch (e) {
                        console.log('Dos API error:', e);
                    }
                }
                
                // Метод 4: через canvas события (наиболее надежный)
                if (!success && window.dosbox.module.canvas) {
                    try {
                        const canvas = window.dosbox.module.canvas;
                        const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
                            keyCode: keyCode,
                            which: keyCode,
                            bubbles: true,
                            cancelable: true,
                            code: this.getKeyCodeString(keyCode)
                        });
                        
                        // Отправляем событие на canvas
                        canvas.dispatchEvent(event);
                        console.log(`🚀 Canvas event: ${isDown ? 'keydown' : 'keyup'} ${keyCode}`);
                        success = true;
                    } catch (e) {
                        console.log('Canvas API error:', e);
                    }
                }
                
                // Метод 5: через document (fallback)
                if (!success) {
                    try {
                        const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
                            keyCode: keyCode,
                            which: keyCode,
                            bubbles: true,
                            cancelable: true,
                            code: this.getKeyCodeString(keyCode)
                        });
                        document.dispatchEvent(event);
                        console.log(`🔄 Document event: ${isDown ? 'keydown' : 'keyup'} ${keyCode}`);
                        success = true;
                    } catch (e) {
                        console.log('Document API error:', e);
                    }
                }
                
                if (!success) {
                    console.log(`❌ Не удалось отправить клавишу ${keyCode} через js-dos API`);
                }
                
            } catch (error) {
                console.log('SendKeyEvent error:', error);
            }
        } else {
            console.log('❌ Dosbox не доступен для отправки клавиш');
        }
    }

    showControls() {
        this.isVisible = true;
        this.container.classList.add('show');
    }

    hideControls() {
        this.isVisible = false;
        this.container.classList.remove('show');
    }

    toggleControls() {
        if (this.isVisible) {
            this.hideControls();
        } else {
            this.showControls();
        }
    }

    handleResize() {
        // Пересчитываем позиции при изменении размера экрана
        if (this.movementActive) {
            this.movementActive = false;
            this.movementStick.style.transform = 'translate(-50%, -50%)';
            this.movementJoystick.style.background = 'rgba(0, 0, 0, 0.7)';
            
            // Очищаем throttling
            if (this.movementThrottle) {
                clearTimeout(this.movementThrottle);
                this.movementThrottle = null;
            }
        }
    }

    handleOrientationChange() {
        // Обрабатываем изменение ориентации устройства
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    // Метод для интеграции с js-dos
    setDosbox(dosbox) {
        this.dosbox = dosbox;
        
        // Дополнительная настройка для лучшей интеграции
        if (dosbox && dosbox.module) {
            console.log('🎮 Мобильное управление подключено к js-dos');
            
            // Проверяем доступность API
            if (dosbox.module.shell) {
                console.log('✅ js-dos shell API доступен');
            } else if (dosbox.module.sendKeyEvent) {
                console.log('✅ js-dos sendKeyEvent API доступен');
            } else {
                console.log('⚠️ Используется fallback API для клавиатуры');
            }
            
            // Попытка найти canvas для событий
            if (dosbox.module.canvas) {
                console.log('✅ Canvas найден:', dosbox.module.canvas);
            }
            
            // Попытка найти Dos object
            if (dosbox.Dos) {
                console.log('✅ Dos object найден');
            }
            
            // Выводим все доступные методы модуля
            console.log('🔍 Доступные методы модуля:', Object.keys(dosbox.module));
            
        } else {
            console.log('❌ Модуль dosbox недоступен');
        }
    }
}

// Инициализация мобильного управления
let mobileControls;

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    mobileControls = new MobileControls();
});

// Экспортируем для использования в других скриптах
window.MobileControls = MobileControls;
