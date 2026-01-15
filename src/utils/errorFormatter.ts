import { logger } from "../settings/logger";

/**
 * Интерфейс для структурированной информации об ошибке
 */
export interface FormattedError {
  message: string;
  statusCode?: number;
  statusText?: string;
  errorDetails?: any;
  url?: string;
  method?: string;
}

/**
 * Форматирует ошибку API в читаемый вид для нейросети
 * Извлекает максимум полезной информации из объекта ошибки
 * 
 * @param error - Объект ошибки
 * @param context - Дополнительный контекст (например, "createIssue", "getUser")
 * @returns Отформатированная строка с детальной информацией об ошибке
 */
export function formatApiError(error: any, context?: string): string {
  const formatted: FormattedError = {
    message: "Неизвестная ошибка",
  };

  // Проверяем различные типы ошибок

  // 1. Ошибка axios (используется в YandexWikiAPI)
  if (error?.response) {
    formatted.statusCode = error.response.status;
    formatted.statusText = error.response.statusText;
    formatted.method = error.response.config?.method?.toUpperCase();
    formatted.url = error.response.config?.url;

    // Извлекаем детали ошибки из тела ответа
    const responseData = error.response.data;
    if (responseData) {
      // Yandex API может возвращать ошибки в разных форматах
      if (typeof responseData === 'string') {
        formatted.errorDetails = responseData;
      } else if (responseData.error || responseData.errors || responseData.errorMessages) {
        formatted.errorDetails = responseData.error || responseData.errors || responseData.errorMessages;
      } else if (responseData.message) {
        formatted.errorDetails = responseData.message;
      } else {
        formatted.errorDetails = responseData;
      }
    }

    // Формируем основное сообщение
    if (formatted.errorDetails) {
      formatted.message = typeof formatted.errorDetails === 'string' 
        ? formatted.errorDetails 
        : JSON.stringify(formatted.errorDetails, null, 2);
    } else {
      formatted.message = `HTTP ${formatted.statusCode}: ${formatted.statusText}`;
    }
  }
  // 2. Ошибка от yandex-tracker-client
  else if (error?.status || error?.statusCode) {
    formatted.statusCode = error.status || error.statusCode;
    formatted.statusText = error.statusText || error.statusMessage;
    
    // Проверяем различные поля с деталями ошибки
    if (error.data) {
      formatted.errorDetails = error.data;
    } else if (error.error) {
      formatted.errorDetails = error.error;
    } else if (error.errors) {
      formatted.errorDetails = error.errors;
    } else if (error.errorMessages) {
      formatted.errorDetails = error.errorMessages;
    } else if (error.body) {
      formatted.errorDetails = error.body;
    }

    // Формируем сообщение
    if (formatted.errorDetails) {
      formatted.message = typeof formatted.errorDetails === 'string' 
        ? formatted.errorDetails 
        : JSON.stringify(formatted.errorDetails, null, 2);
    } else if (error.message) {
      formatted.message = error.message;
    } else {
      formatted.message = `HTTP ${formatted.statusCode}${formatted.statusText ? ': ' + formatted.statusText : ''}`;
    }
  }
  // 3. Стандартная ошибка JavaScript
  else if (error instanceof Error) {
    formatted.message = error.message;
    
    // Проверяем, есть ли дополнительные поля в ошибке
    const errorObj = error as any;
    if (errorObj.statusCode || errorObj.status) {
      formatted.statusCode = errorObj.statusCode || errorObj.status;
    }
  }
  // 4. Просто строка
  else if (typeof error === 'string') {
    formatted.message = error;
  }

  // Собираем финальное сообщение
  let result = '';
  
  if (context) {
    result += `Ошибка при выполнении ${context}:\n`;
  }
  
  if (formatted.statusCode) {
    result += `Статус: ${formatted.statusCode}${formatted.statusText ? ' (' + formatted.statusText + ')' : ''}\n`;
  }
  
  if (formatted.method && formatted.url) {
    result += `Запрос: ${formatted.method} ${formatted.url}\n`;
  }
  
  result += `Описание: ${formatted.message}`;

  // Логируем для отладки
  logger.error({
    context,
    statusCode: formatted.statusCode,
    statusText: formatted.statusText,
    method: formatted.method,
    url: formatted.url,
    errorDetails: formatted.errorDetails,
    originalError: error,
  }, 'API Error');

  return result;
}

/**
 * Создает объект Error с отформатированным сообщением
 * Полезно для пробрасывания ошибок выше по стеку
 * 
 * @param error - Исходная ошибка
 * @param context - Контекст выполнения
 * @returns Новый объект Error с детальным сообщением
 */
export function createFormattedError(error: any, context?: string): Error {
  const formattedMessage = formatApiError(error, context);
  const newError = new Error(formattedMessage);
  
  // Сохраняем оригинальную ошибку
  (newError as any).originalError = error;
  
  // Копируем код статуса если есть
  if (error?.response?.status) {
    (newError as any).statusCode = error.response.status;
  } else if (error?.status || error?.statusCode) {
    (newError as any).statusCode = error.status || error.statusCode;
  }
  
  return newError;
}
