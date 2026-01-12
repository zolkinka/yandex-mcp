#!/bin/bash

# Скрипт для генерации самоподписанных SSL сертификатов для локальной разработки

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CERTS_DIR="$PROJECT_ROOT/certs"

# Создаем директорию для сертификатов
mkdir -p "$CERTS_DIR"

echo "🔐 Генерация SSL сертификатов для локальной разработки..."

# Генерируем приватный ключ и самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERTS_DIR/localhost.key" \
  -out "$CERTS_DIR/localhost.crt" \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=Development/OU=IT/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

if [ $? -eq 0 ]; then
  echo "✅ Сертификаты успешно созданы:"
  echo "   📄 Сертификат: $CERTS_DIR/localhost.crt"
  echo "   🔑 Приватный ключ: $CERTS_DIR/localhost.key"
  echo ""
  echo "📝 Добавьте в .env файл:"
  echo "   SSL_KEY_PATH=$CERTS_DIR/localhost.key"
  echo "   SSL_CERT_PATH=$CERTS_DIR/localhost.crt"
  echo ""
  echo "⚠️  Для macOS: чтобы браузер доверял сертификату, выполните:"
  echo "   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERTS_DIR/localhost.crt"
  echo ""
  echo "🚀 Запуск HTTPS сервера:"
  echo "   npm run start:https"
else
  echo "❌ Ошибка при генерации сертификатов"
  exit 1
fi
