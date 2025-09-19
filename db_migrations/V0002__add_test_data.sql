-- Добавление тестовых данных

-- Добавляем тестовые ячейки (1-482)
INSERT INTO cells (cell_number, capacity_kg, dimensions, location) VALUES
('1', 10.0, '30x30x30', 'Секция A'),
('44', 15.0, '40x40x40', 'Секция B'),
('123', 20.0, '50x50x50', 'Секция C'),
('255', 10.0, '30x30x30', 'Секция D'),
('482', 25.0, '60x60x60', 'Секция E');

-- Добавляем тестовые заказы
INSERT INTO orders (order_number, customer_name, customer_phone, cell_number, status, total_amount, items_count) VALUES
('WB123456789', 'Елена Иванова', '7589', '44', 'ready_for_pickup', 2450.00, 3),
('WB987654321', 'Петр Сидоров', '4321', '123', 'arrived', 1200.50, 1),
('WB555666777', 'Анна Петрова', '8899', '255', 'pending', 3200.00, 2),
('WB111222333', 'Михаил Козлов', '1144', '1', 'completed', 850.75, 1),
('WB444555666', 'Ольга Смирнова', '3366', '482', 'ready_for_pickup', 1750.25, 4);

-- Добавляем информацию об аудио файлах
INSERT INTO audio_files (file_key, file_type, cell_number, file_name, file_size) VALUES
('44', 'cell', '44', 'cell-44.mp3', 25600),
('cell-44', 'cell', '44', 'cell-44.mp3', 25600),
('123', 'cell', '123', 'cell-123.mp3', 24800),
('cell-123', 'cell', '123', 'cell-123.mp3', 24800),
('discount', 'system', NULL, 'discount-announcement.mp3', 45000),
('Товары со со скидкой проверьте ВБ кошелек', 'system', NULL, 'discount-check-wallet.mp3', 67200),
('check-product', 'system', NULL, 'check-product-camera.mp3', 38400);

-- Добавляем тестовые логи сканирования
INSERT INTO scan_logs (scan_type, scanned_data, order_id, cell_number, user_action, audio_played, success) VALUES
('qr_code', 'qr-123456789-7589', 1, '44', 'customer_scan', 'cell-44, discount', true),
('phone', '7589', 1, '44', 'manual_search', 'cell-44', true),
('qr_code', 'barcode-product-456', 1, '44', 'product_verification', 'check-product', true);