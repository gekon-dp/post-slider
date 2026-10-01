// Реализовать функционал переключения между постами.
// В качестве API использовать https://jsonplaceholder.typicode.com/posts/

// Страница должна содержать 2 кнопки (вперед, назад),
// которые переключают к следующему и предыдущему посту соответственно.
// При загрузке страницы должен отправляться запрос на получение поста с id=1.
//
// // 1.localStorage 2.Loading, 3.Валидация 4.Debounce (350ms - 1 click)
const postContainer = document.querySelector("#root");
const prevPostBtn = document.querySelector(".left");
const nextPostBtn = document.querySelector(".right");

const BASE_URL = "https://jsonplaceholder.typicode.com";
// Ключ, под которым номер текущего поста сохраняется в LocalStorage браузера
const localStorageKey = "postNumber";

// Инициализируем номер поста: если в LocalStorage есть значение, приводим его к числу, иначе ставим 1
let postNumber = localStorage.getItem(localStorageKey)
  ? Number(localStorage.getItem(localStorageKey))
  : 1;

// Переменная для хранения объекта с данными последнего успешно загруженного поста (кэш на клиенте)
let lastValidPostData = null;
// Переменная-указатель на таймер setTimeout для реализации Debounce (устранения дребезга)
let debounceTimer = null;
// Переменная для фиксации ID, который был ДО начала серии частых кликов (нужен для корректного отката)
let initialIdBeforeSeries = postNumber;

// Асинхронная функция для отправки HTTP-запроса к API за конкретным постом по его id
const getPostById = async (id) => {
  try {
    // Делаем сетевой запрос к эндпоинту конкретного поста
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    // Если статус ответа не OK (например, 404 или 500), прерываемся и возвращаем null
    if (!response.ok) return null;

    // Читаем тело ответа как чистый текст (заменяет response.json для безопасной обработки пустых ответов)
    const text = await response.text();
    // Если сервер вернул пустую строку или пустой объект "{}", значит данных для этого ID нет
    if (!text || text.trim() === "{}" || text.trim() === "") return null;

    // Превращаем валидную строку JSON в стандартный объект JavaScript
    const data = JSON.parse(text);
    // Возвращаем успешно полученный объект с данными поста
    return data;
  } catch (error) {
    // Логируем ошибку в консоль, если пропала сеть или сломался сервер
    console.error("Ошибка при получении поста:", error);
    // Возвращаем null, сообщая вызывающей функции, что запрос провалился
    return null;
  }
};

// Функция для генерации HTML-разметки и вставки поста на страницу
const renderPost = (post) => {
  // Полностью очищаем контейнер от старого контента (включая надпись Loading...)
  postContainer.innerHTML = "";
  // Создаем параграф для заголовка поста
  const title = document.createElement("p");
  // Создаем параграф для текста (тела) поста
  const body = document.createElement("p");
  // Создаем элемент заголовка h3 для отображения ID поста
  const id = document.createElement("h3");
  // Создаем обертку-див для всей карточки
  const container = document.createElement("div");

  // Заполняем текстовое содержимое элементов данными из объекта поста
  title.textContent = post.title;
  body.textContent = post.body;
  id.textContent = post.id;
  // Добавляем класс стиля для главного контейнера поста
  container.classList.add("post");
  // Добавляем класс стиля для заголовка
  title.classList.add("subheader");
  // Собираем элементы (ID, заголовок, текст) внутрь карточки-контейнера
  container.append(id, title, body);
  // Вставляем готовую карточку поста в корневой элемент на странице
  postContainer.append(container);
};

// Главная управляющая функция загрузки и обработки логики отображения
const loadPost = async (oldId) => {
  // Меняем содержимое контейнера на индикатор загрузки на время ожидания ответа
  postContainer.innerHTML = "<p class='loading'>Loading...</p>";
  // Вызываем сетевой запрос и ждем (await) получения данных для текущего значения postNumber
  const post = await getPostById(postNumber);

  // Проверяем, удалось ли успешно получить объект поста с сервера
  if (post) {
    // Сохраняем успешный пост в память, чтобы использовать его при ошибочных переходах в будущем
    lastValidPostData = post;
    // Обновляем запись в LocalStorage, фиксируя актуальный рабочий ID поста
    localStorage.setItem(localStorageKey, `${postNumber}`);
    // Отрисовываем полученный пост на экране
    renderPost(post);
  } else {
    // Сюда заходим, если сервер вернул ошибку или пустой ответ (например, вышли за границы на id=101)
    console.log(`Поста с ID ${postNumber} не существует! Откат к ID ${oldId}.`);
    // Сбрасываем счетчик postNumber обратно к последнему рабочему ID, который был до отправки запроса
    postNumber = oldId;

    // Синхронизируем LocalStorage, перезаписывая ошибочный ID обратно на рабочий старый ID
    localStorage.setItem(localStorageKey, `${postNumber}`);

    // Если у нас в кэше уже есть данные старого поста, возвращаем их на экран
    if (lastValidPostData) {
      renderPost(lastValidPostData);
    } else {
      // Экстренный случай: если база упала на самом первом запросе при открытии страницы
      postNumber = 1; // Принудительно ставим первый ID
      localStorage.setItem(localStorageKey, "1"); // Записываем единицу в хранилище
      // Пытаемся сделать резервный запрос самого первого поста базы
      const fallbackPost = await getPostById(1);
      if (fallbackPost) {
        lastValidPostData = fallbackPost; // Кэшируем его
        renderPost(fallbackPost); // Выводим на экран
      } else {
        // Если даже первый пост недоступен (нет интернета), выводим финальное сообщение об ошибке
        postContainer.innerHTML = "<p>Не удалось загрузить данные</p>";
      }
    }
  }
};

// Автоматический вызов при первой загрузке скрипта для отображения стартового поста
loadPost(postNumber);

// Функция-дебаунсер для задержки вызова тяжелой функции loadPost
const debounceLoadPost = () => {
  // Сразу при клике пишем Loading..., чтобы юзер видел моментальный отклик интерфейса
  postContainer.innerHTML = "<p class='loading'>Loading...</p>";
  // Сбрасываем (удаляем) запущенный ранее таймер, если 350мс с момента прошлого клика еще не прошли
  clearTimeout(debounceTimer);

  // Задаем новый таймер ожидания на 350 миллисекунд
  debounceTimer = setTimeout(() => {
    // Когда пауза выдержана, вызываем загрузку, передавая стартовую точку для возможного отката
    loadPost(initialIdBeforeSeries);
    // Обновляем стартовую точку для следующей потенциальной серии кликов
    initialIdBeforeSeries = postNumber;
  }, 350);
};

// Навешиваем обработчик события «клик» на кнопку «Вперед»
nextPostBtn.addEventListener("click", () => {
  // Если это самый первый клик в серии (таймер пуст), фиксируем текущий стабильный ID как точку отката
  if (debounceTimer === null || debounceTimer === undefined) {
    initialIdBeforeSeries = postNumber;
  }
  // Мгновенно увеличиваем счетчик постов в памяти на единицу
  postNumber++;
  // Запускаем дебаунс-функцию ожидания перед запросом
  debounceLoadPost();
});

// Навешиваем обработчик события «клик» на кнопку «Назад»
prevPostBtn.addEventListener("click", () => {
  // Универсальная валидация нижней границы: не даем счетчику опускаться ниже 1-го поста
  if (postNumber > 1) {
    // Если это первый клик в серии, запоминаем текущий рабочий ID для отката
    if (debounceTimer === null || debounceTimer === undefined) {
      initialIdBeforeSeries = postNumber;
    }
    // Мгновенно уменьшаем счетчик постов в памяти на единицу
    postNumber--;
    // Запускаем дебаунс-функцию ожидания перед запросом
    debounceLoadPost();
  } else {
    // Если пользователь пытается нажать «Назад», находясь на 1-м посте, просто логируем запрет
    console.log("Вы находитесь на самом первом посте. Назад нельзя.");
  }
});
