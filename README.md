# Bike Renting System

Кроссплатформенная система аренды велосипедов: мобильный и web-клиент на Expo/React Native, REST API на Spring Boot и PostgreSQL. Пользователь может зарегистрироваться, найти станцию, начать или завершить аренду и управлять балансом; администратор — управлять велосипедами, станциями и ремонтами.

> Статус: проект находится в активной разработке. Основные сценарии и инфраструктура доступны, но файл OpenAPI пока описывает более новый контракт `/api/v1`, чем реализованные Java-контроллеры `/api`. См. [«Известные ограничения»](#известные-ограничения).

## Содержание

- [Стек](#стек)
- [Быстрый запуск](#быстрый-запуск)
- [Локальный запуск без Docker](#локальный-запуск-без-docker)
- [Переменные окружения](#переменные-окружения)
- [Структура проекта](#структура-проекта)
- [Сборка и проверки](#сборка-и-проверки)
- [E2E-тесты](#e2e-тесты)
- [API и авторизация](#api-и-авторизация)
- [Решение проблем](#решение-проблем)
- [Участие в разработке](#участие-в-разработке)

## Стек

| Часть | Технологии |
| --- | --- |
| Клиент | Expo 54, React Native 0.81, React 19, Expo Router, TypeScript, Axios, Zod |
| Карты и устройство | React Native Maps, Expo Location, Expo Camera, Secure Store |
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, MapStruct |
| Данные | PostgreSQL 16; H2 только в тестах |
| Авторизация | JWT Bearer, BCrypt |
| Тесты | Jest/Jest Expo, Detox, JUnit 5/Spring Boot Test |
| Инфраструктура | Docker, Docker Compose, GitHub Actions |

## Быстрый запуск

Для самого короткого пути нужны Docker с Compose, Node.js 20.19+ и npm 10+.

1. Клонируйте репозиторий и перейдите в него:

   ```bash
   git clone https://github.com/Shir5/bike-renting-system.git
   cd bike-renting-system
   ```

2. Создайте конфигурацию Docker:

   ```bash
   cp .env.example .env
   ```

   Для локальной разработки значения по умолчанию рабочие. Перед публикацией обязательно замените `POSTGRES_PASSWORD` и `JWT_SECRET`; новый JWT-секрет можно получить командой `openssl rand -base64 48`.

3. Запустите PostgreSQL и backend:

   ```bash
   docker compose up --build -d
   docker compose logs -f backend
   ```

   API будет доступен на `http://localhost:8080/api`. При первом запуске Hibernate создаст таблицы автоматически.

4. В другом терминале настройте и запустите клиент:

   ```bash
   cd frontend/bike-renting
   cp .env.example .env
   npm ci
   npm start
   ```

5. В интерфейсе Expo выберите платформу либо выполните одну из команд:

   ```bash
   npm run web
   npm run android
   npm run ios
   ```

Для web и iOS Simulator адрес из примера (`http://localhost:8080/api`) подходит без изменений. Для Android Emulator укажите `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api`. Для физического устройства используйте LAN-IP компьютера, например `http://192.168.1.50:8080/api`; телефон и компьютер должны быть в одной сети.

Остановка инфраструктуры:

```bash
docker compose down
```

Данные PostgreSQL сохраняются в Docker volume. Удалять их следует только осознанно: `docker compose down -v`.

## Локальный запуск без Docker

### Backend

Понадобятся JDK 17+ и PostgreSQL. Maven отдельно устанавливать не нужно — используется Maven Wrapper.

1. Создайте базу и пользователя:

   ```sql
   CREATE USER bike_renting WITH PASSWORD 'bike_renting';
   CREATE DATABASE bike_renting OWNER bike_renting;
   ```

2. Запустите приложение из каталога `backend`:

   ```bash
   cd backend
   DATABASE_URL=jdbc:postgresql://localhost:5432/bike_renting \
   DATABASE_USERNAME=bike_renting \
   DATABASE_PASSWORD=bike_renting \
   JWT_SECRET="$(openssl rand -base64 48)" \
   ./mvnw spring-boot:run
   ```

Backend слушает порт `8080`. Значения для локальной БД также имеют development defaults, поэтому при совпадающих реквизитах достаточно `./mvnw spring-boot:run`.

### Клиент

Из `frontend/bike-renting` выполните:

```bash
cp .env.example .env
npm ci
npm start
```

Для нативной сборки дополнительно нужны Android Studio и Android SDK либо macOS с Xcode и CocoaPods. В проекте уже находятся нативные каталоги `android/` и `ios/`; после изменения Expo plugins синхронизируйте их командой `npx expo prebuild` и внимательно проверьте diff.

## Переменные окружения

### Backend и Docker Compose

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/bike_renting` | JDBC URL PostgreSQL |
| `DATABASE_USERNAME` | `bike_renting` | Пользователь БД |
| `DATABASE_PASSWORD` | `bike_renting` | Пароль БД |
| `JWT_SECRET` | development-only key | Base64-ключ подписи JWT, минимум 32 байта после декодирования |
| `JWT_EXPIRATION_MS` | `86400000` | Время жизни access token в миллисекундах |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | `http://localhost:*` | Разрешённые origin patterns через запятую |
| `JPA_DDL_AUTO` | `update` | Стратегия Hibernate schema management |
| `JPA_SHOW_SQL` | `false` | Вывод SQL в лог |
| `SPRING_LOG_LEVEL` | `INFO` | Уровень логов Spring |

Compose также читает `POSTGRES_DB`, `POSTGRES_USER` и `POSTGRES_PASSWORD` из корневого `.env`. Шаблон находится в [.env.example](.env.example).

### Expo

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8080/api` | Базовый URL REST API без завершающего `/` |

Переменные с префиксом `EXPO_PUBLIC_` попадают в клиентский bundle — секреты в них хранить нельзя. После изменения `.env` перезапустите Metro; при проблемах очистите кеш командой `npx expo start --clear`.

## Структура проекта

```text
.
├── backend/
│   ├── src/main/java/com/labwork/islabfirst/
│   │   ├── config/       # Security, JPA, WebSocket и сериализация
│   │   ├── controller/   # REST-контроллеры
│   │   ├── dto/          # Контракты входа/выхода
│   │   ├── entity/       # JPA-модели и security-модели
│   │   ├── mapper/       # MapStruct-мапперы
│   │   ├── repository/   # Spring Data repositories
│   │   └── service/      # Бизнес-логика и JWT/auth
│   └── src/test/         # JUnit-тесты и H2-конфигурация
├── frontend/bike-renting/
│   ├── app/              # Экраны и file-based routing Expo Router
│   ├── api/              # Axios client, токены, OpenAPI/Zod-код
│   ├── components/       # Переиспользуемые UI-компоненты
│   ├── context/          # AuthContext
│   ├── hooks/            # Геолокация, аренды, платежи, станции
│   ├── services/         # Запросы к API и преобразование DTO
│   ├── validation/       # Zod-схемы и sanitizers
│   ├── e2e/              # Detox smoke tests
│   ├── android/          # Нативный Android-проект
│   └── ios/              # Нативный iOS-проект
├── compose.yaml          # PostgreSQL + backend
└── Dockerfile            # Multi-stage образ backend
```

Поток клиентского запроса: экран из `app/` вызывает hook/service, общий Axios-клиент из `api/client.ts` добавляет Bearer token из Secure Store и нормализует ошибки. Backend обрабатывает запрос в controller → service → repository, а mapper преобразует entity в DTO.

## Сборка и проверки

Backend:

```bash
cd backend
./mvnw test
./mvnw clean package
java -jar target/bike-renting-backend-0.1.jar
```

Backend-тесты используют in-memory H2 и не требуют запущенного PostgreSQL.

Клиент:

```bash
cd frontend/bike-renting
npm ci
npm test
npm run typecheck
npm run lint
npm run format:check
npm run doctor
```

Перегенерация Zod-клиента после изменения `api/openapi.json`:

```bash
npm run gen:api
```

Сгенерированный `api/generated/index.ts` коммитится вместе со спецификацией. CI выполняет backend-тесты, frontend unit tests и статические проверки для каждого pull request.

## E2E-тесты

Detox-тесты требуют собранный development app и запущенный simulator/emulator.

iOS (только macOS/Xcode; конфигурация ожидает `iPhone 15`):

```bash
cd frontend/bike-renting
npm run e2e:build:ios
npm run e2e:test:ios
```

Android (конфигурация ожидает AVD `Pixel_6_API_34`):

```bash
npm run e2e:build:android
npm run e2e:test:android
```

Если названия устройств отличаются, измените секцию `devices` в `.detoxrc.js`. E2E не запускаются в обычном `npm test`.

## API и авторизация

Реализованные контроллеры доступны под `/api`:

- `/api/auth/register`, `/api/auth/login`, `/api/auth/info`;
- `/api/station`, `/api/bicycle`, `/api/rental`, `/api/payment`;
- `/api/repair`, `/api/technician`, `/api/admin-requests`;
- `/ws` — SockJS/STOMP endpoint, broker topics используют префикс `/topic`.

Все маршруты, кроме регистрации, входа и WebSocket handshake, требуют заголовок `Authorization: Bearer <token>`. Регистрация и вход возвращают `access_token`, `user_id` и `username`.

## Известные ограничения

- `frontend/bike-renting/api/openapi.json` описывает планируемый контракт `/api/v1` с plural routes, тогда как текущие Java-контроллеры используют `/api` и преимущественно singular routes. Сервисы клиента частично относятся к обеим версиям. Перед развитием интеграционных сценариев выберите канонический контракт, обновите контроллеры/сервисы и перегенерируйте Zod-клиент.
- В репозитории пока нет миграций Flyway/Liquibase; локально схема создаётся через `spring.jpa.hibernate.ddl-auto=update`. Для production установите `JPA_DDL_AUTO=validate` и добавьте версионируемые миграции.
- E2E покрывают только smoke-сценарий экрана входа; бизнес-сценарии требуют расширения.
- Ранее созданные пользователи с устаревшими MD5-хешами паролей не смогут войти после перехода на BCrypt; для существующей БД нужен отдельный сценарий сброса паролей.
- Встроенный development JWT key и стандартные реквизиты БД предназначены только для локального запуска.

## Решение проблем

**Клиент не видит API.** Проверьте `EXPO_PUBLIC_API_URL`, перезапустите Metro с `npx expo start --clear` и убедитесь, что устройство открывает адрес backend. `localhost` внутри Android Emulator указывает на сам эмулятор — используйте `10.0.2.2`.

**Порт 5432 или 8080 занят.** Найдите локальный PostgreSQL/Java-процесс либо измените левую часть port mapping в `compose.yaml`; при изменении порта API синхронно обновите `EXPO_PUBLIC_API_URL`.

**Backend не подключается к БД.** Выполните `docker compose ps` и `docker compose logs postgres`. Значения `POSTGRES_*` и `DATABASE_*` должны обозначать одну и ту же базу и учётную запись.

**JWT key слишком короткий или неверно закодирован.** Создайте новый ключ через `openssl rand -base64 48`, поместите его в корневой `.env` и пересоздайте backend: `docker compose up --build -d --force-recreate backend`.

**Нативная сборка устарела после изменения зависимостей.** Запустите `npx expo prebuild`, для iOS затем `npx pod-install`, после чего повторите `npm run ios` или `npm run android`.

## Участие в разработке

Перед pull request прочитайте [CONTRIBUTING.md](CONTRIBUTING.md), запустите проверки из раздела выше и не коммитьте `.env`, токены или production credentials. Ошибки и предложения оформляйте через GitHub Issues. Уязвимости сообщайте по процедуре из [SECURITY.md](SECURITY.md).

Проект распространяется по лицензии [MIT](LICENSE).
