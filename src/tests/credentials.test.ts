/**
 * Тест для проверки корректности credentials для Yandex Tracker API
 * Запуск: npx ts-node src/tests/credentials.test.ts
 */

import { config } from "../settings/config";
import axios from "axios";

interface TestResult {
  test: string;
  status: "OK" | "FAIL";
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Попробуем оба типа заголовков
async function testWithHeader(headerName: string, orgId: string): Promise<boolean> {
  console.log(`\n🔄 Тестируем с заголовком: ${headerName}: ${orgId}`);
  
  try {
    const response = await axios.get(`${config.YANDEX_TRACKER_BASE_URL}/myself`, {
      headers: {
        "Authorization": `OAuth ${config.YANDEX_TRACKER_TOKEN}`,
        [headerName]: orgId,
        "Content-Type": "application/json",
      },
      timeout: config.REQUEST_TIMEOUT,
    });

    console.log("   ✅ УСПЕХ!");
    console.log(`   👤 Пользователь: ${response.data.display || response.data.login}`);
    console.log(`   📧 Email: ${response.data.email || "не указан"}`);
    return true;

  } catch (error: any) {
    const status = error.response?.status;
    console.log(`   ❌ Ошибка: ${status}`);
    return false;
  }
}

async function testCredentials() {
  console.log("\n🔍 Проверка credentials для Yandex Tracker API\n");
  console.log("=".repeat(60));

  const orgId = config.YANDEX_TRACKER_ORG_ID || config.YANDEX_TRACKER_CLOUD_ORG_ID || "";

  // Проверка переменных окружения
  console.log("\n📋 Текущие настройки:");
  console.log(`   Token: ${config.YANDEX_TRACKER_TOKEN?.substring(0, 20)}...`);
  console.log(`   Org ID: ${orgId}`);
  console.log(`   Base URL: ${config.YANDEX_TRACKER_BASE_URL}`);

  // Тест 1: X-Cloud-Org-Id (Yandex Cloud)
  console.log("\n" + "=".repeat(60));
  console.log("📋 Тест 1: Проверка с X-Cloud-Org-Id (Yandex Cloud)");
  const cloudResult = await testWithHeader("X-Cloud-Org-Id", orgId);

  // Тест 2: X-Org-Id с текущим ID
  console.log("\n" + "=".repeat(60));
  console.log("📋 Тест 2: Проверка с X-Org-Id (Yandex 360)");
  const org360Result = await testWithHeader("X-Org-Id", orgId);

  // Тест 3: Попробуем числовой ID 102384520 (из скриншота)
  const numericOrgId = "102384520";
  console.log("\n" + "=".repeat(60));
  console.log(`📋 Тест 3: Проверка с X-Org-Id и числовым ID (${numericOrgId})`);
  const numericResult = await testWithHeader("X-Org-Id", numericOrgId);

  // Итог
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 РЕЗУЛЬТАТЫ:\n");
  
  if (cloudResult) {
    console.log("   ✅ X-Cloud-Org-Id работает! Используйте текущие настройки.");
  } else if (org360Result) {
    console.log("   ✅ X-Org-Id работает с текущим ID!");
    console.log("   💡 Нужно изменить код для использования X-Org-Id вместо X-Cloud-Org-Id");
  } else if (numericResult) {
    console.log(`   ✅ X-Org-Id работает с числовым ID: ${numericOrgId}`);
    console.log("   💡 Обновите .env:");
    console.log(`      YANDEX_TRACKER_CLOUD_ORG_ID=${numericOrgId}`);
    console.log("   💡 И измените код для использования X-Org-Id");
  } else {
    console.log("   ❌ Ни один вариант не сработал.");
    console.log("\n   💡 Возможные проблемы:");
    console.log("      1. OAuth токен недействителен или не имеет прав на Tracker");
    console.log("      2. Организация не подключена к Yandex Tracker");
    console.log("\n   🔗 Получите новый токен:");
    console.log("      https://oauth.yandex.ru/authorize?response_type=token&client_id=23700f81ec1d4c35bbb3e8b60c55cdf2");
  }
  
  console.log("\n");
}

// Запуск теста
testCredentials().catch((error) => {
  console.error("Критическая ошибка:", error.message);
  process.exit(1);
});
