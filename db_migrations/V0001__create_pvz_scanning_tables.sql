-- Создание таблиц для приложения сканирования и озвучки ПВЗ

-- Таблица для хранения информации о ячейках
CREATE TABLE cells (
    id SERIAL PRIMARY KEY,
    cell_number VARCHAR(10) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'reserved', 'maintenance')),
    capacity_kg DECIMAL(5,2) DEFAULT 10.0,
    dimensions VARCHAR(50),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    cell_number VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'ready_for_pickup', 'completed', 'returned')),
    arrival_date TIMESTAMP,
    pickup_date TIMESTAMP,
    return_date TIMESTAMP,
    total_amount DECIMAL(10,2),
    items_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_number) REFERENCES cells(cell_number)
);

-- Таблица для аудио файлов
CREATE TABLE audio_files (
    id SERIAL PRIMARY KEY,
    file_key VARCHAR(100) NOT NULL UNIQUE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('cell', 'system', 'announcement')),
    cell_number VARCHAR(10),
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (cell_number) REFERENCES cells(cell_number)
);

-- Таблица для логов сканирования
CREATE TABLE scan_logs (
    id SERIAL PRIMARY KEY,
    scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('qr_code', 'barcode', 'phone')),
    scanned_data VARCHAR(500),
    order_id INTEGER,
    cell_number VARCHAR(10),
    user_action VARCHAR(50),
    audio_played VARCHAR(100),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (cell_number) REFERENCES cells(cell_number)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_orders_cell ON orders(cell_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_scan_logs_timestamp ON scan_logs(scan_timestamp);
CREATE INDEX idx_audio_files_type ON audio_files(file_type);

-- Добавляем комментарии к таблицам
COMMENT ON TABLE cells IS 'Информация о ячейках ПВЗ';
COMMENT ON TABLE orders IS 'Заказы клиентов';
COMMENT ON TABLE audio_files IS 'Аудио файлы для озвучки';
COMMENT ON TABLE scan_logs IS 'Логи сканирования QR кодов и штрихкодов';