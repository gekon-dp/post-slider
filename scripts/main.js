// Реализовать функционал переключения между постами.
// В качестве API использовать https://jsonplaceholder.typicode.com/posts/

// Страница должна содержать 2 кнопки (вперед, назад),
// которые переключают к следующему и предыдущему посту соответственно.
// При загрузке страницы должен отправляться запрос на получение поста с id=1.

const postContainer = document.querySelector("#root");
const prevPostBtn = document.querySelector(".left");
const nextPostBtn = document.querySelector(".right");

const BASE_URL = "https://jsonplaceholder.typicode.com";

const localStorageKey = "postNumber";
let postNumber = 1;

if (localStorage.getItem(localStorageKey)) {
  postNumber = Number(localStorage.getItem(localStorageKey));
}

const getPostById = async (postNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postNumber}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const renderPost = (post) => {
  postContainer.innerHTML = "";
  const title = document.createElement("p");
  const body = document.createElement("p");
  const id = document.createElement("h3");
  const continer = document.createElement("div");

  title.textContent = post.title;
  body.textContent = post.body;
  id.textContent = post.id;
  continer.classList.add("post");
  title.classList.add("subheader");
  continer.append(id, title, body);
  postContainer.append(continer);
};

const loadPost = async () => {
  const post = await getPostById(postNumber);
  renderPost(post);
};

loadPost();

nextPostBtn.addEventListener("click", () => {
  postNumber++;
  localStorage.setItem(localStorageKey, `${postNumber}`);
  loadPost();
});

prevPostBtn.addEventListener("click", () => {
  postNumber--;
  localStorage.setItem(localStorageKey, `${postNumber}`);
  loadPost();
});

// 1.localStorageя 2.Loading, 3.Валидация 4.Debounce (350ms - 1 click)
