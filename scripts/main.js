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
const localStorageKey = "postNumber";

let postNumber = localStorage.getItem(localStorageKey)
  ? Number(localStorage.getItem(localStorageKey))
  : 1;

let lastValidPostData = null;
let debounceTimer = null;
let initialIdBeforeSeries = postNumber;

const getPostById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    if (!response.ok) return null;

    const text = await response.text();
    if (!text || text.trim() === "{}" || text.trim() === "") return null;

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Ошибка при получении поста:", error);
    return null;
  }
};

const renderPost = (post) => {
  postContainer.innerHTML = "";
  const title = document.createElement("p");
  const body = document.createElement("p");
  const id = document.createElement("h3");
  const container = document.createElement("div");

  title.textContent = post.title;
  body.textContent = post.body;
  id.textContent = post.id;
  container.classList.add("post");
  title.classList.add("subheader");
  container.append(id, title, body);
  postContainer.append(container);
};

const loadPost = async (oldId) => {
  postContainer.innerHTML = "<p class='loading'>Loading...</p>";
  const post = await getPostById(postNumber);

  if (post) {
    lastValidPostData = post;
    localStorage.setItem(localStorageKey, `${postNumber}`);
    renderPost(post);
  } else {
    console.log(`Поста с ID ${postNumber} не существует! Откат к ID ${oldId}.`);
    postNumber = oldId;

    localStorage.setItem(localStorageKey, `${postNumber}`);

    if (lastValidPostData) {
      renderPost(lastValidPostData);
    } else {
      postNumber = 1;
      localStorage.setItem(localStorageKey, "1");
      const fallbackPost = await getPostById(1);
      if (fallbackPost) {
        lastValidPostData = fallbackPost;
        renderPost(fallbackPost);
      } else {
        postContainer.innerHTML = "<p>Не удалось загрузить данные</p>";
      }
    }
  }
};

loadPost(postNumber);

const debounceLoadPost = () => {
  postContainer.innerHTML = "<p class='loading'>Loading...</p>";
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    loadPost(initialIdBeforeSeries);
    initialIdBeforeSeries = postNumber;
  }, 350);
};

nextPostBtn.addEventListener("click", () => {
  if (debounceTimer === null || debounceTimer === undefined) {
    initialIdBeforeSeries = postNumber;
  }
  postNumber++;
  debounceLoadPost();
});

prevPostBtn.addEventListener("click", () => {
  if (postNumber > 1) {
    if (debounceTimer === null || debounceTimer === undefined) {
      initialIdBeforeSeries = postNumber;
    }
    postNumber--;
    debounceLoadPost();
  } else {
    console.log("Вы находитесь на самом первом посте. Назад нельзя.");
  }
});
