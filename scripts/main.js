const postContainer = document.querySelector("#root");
const prevPostBtn = document.querySelector(".left");
const nextPostBtn = document.querySelector(".right");

const BASE_URL = "https://jsonplaceholder.typicode.com";
const localStorageKey = "postNumber";

let postNumber = localStorage.getItem(localStorageKey)
  ? Number(localStorage.getItem(localStorageKey))
  : 1;

let lastValidPostData = null;
const getPostById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || Object.keys(data).length === 0) return null;

    return data;
  } catch (error) {
    console.error(error);
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

    if (lastValidPostData) {
      renderPost(lastValidPostData);
    } else {
      postContainer.innerHTML = "<p>Не удалось загрузить данные</p>";
    }
  }
};

loadPost(postNumber);

nextPostBtn.addEventListener("click", () => {
  const oldId = postNumber;
  postNumber++;
  loadPost(oldId);
});

prevPostBtn.addEventListener("click", () => {
  if (postNumber > 1) {
    const oldId = postNumber;
    postNumber--;
    loadPost(oldId);
  } else {
    console.log("Вы находитесь на самом первом посте. Назад нельзя.");
  }
});
