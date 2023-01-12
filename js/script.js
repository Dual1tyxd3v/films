const urls = {
  lordSerials: ['https://n.lordfilm.film/serialys/', renderLord],
  lordFilms: ['https://n.lordfilm.film/films/', renderLord],
  zagonkaFilms: ['http://zagonko12.zagonko.com/9', renderZagon, 1],
  zagonkaNewSerials: ['http://zagonko12.zagonko.com/9', renderZagon, 4],
  zagonkaNewSeasons: ['http://zagonko12.zagonko.com/9', renderZagon, 5],
};

const selectContent = document.querySelector('.select-content');
const select = document.querySelector('.select');
const background = document.querySelector('.background').cloneNode(true);
const contentItem = document.querySelector('.hide').querySelector('.content');
const wrapper = document.querySelector('.wrapper');
const player = document.querySelector('.view-content');
const favoriteTab = document.querySelector('.hide').querySelector('.favorites-item');
const favoriteList = document.querySelector('.favorites-list');
const favoriteCounter = document.querySelector('.favorites-counter');
const addFavoriteBtn = document.querySelector('.view-favorite');
const favoriteTitle = document.querySelector('.favorites-title');
const modalForm = document.querySelector('.modal-form');
let activeFilm = {};
let filmWindow = 0;

function checkFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites'));
  favoriteList.innerHTML = '';
  if (!favorites || Object.keys(favorites).length === 0) {
    favoriteCounter.innerHTML = '(0)';
    return;
  }

  for (let k in favorites) {
    const newTab = favoriteTab.cloneNode(true);
    newTab.querySelector('.favorites-descr').innerHTML = k;
    newTab.querySelector('.favorites-descr').href = favorites[k][0];
    newTab.querySelector('.favorites-descr').dataset.play = favorites[k][1];
    newTab.querySelector('.favorites-delete').addEventListener('click', (e) => {
      editFavoritesStorage(false, k);
    });
    newTab.querySelector('.favorites-descr').addEventListener('click', (e) => loadFilm(e, true));
    favoriteList.append(newTab);
  }
  favoriteCounter.innerHTML = `(${Object.keys(favorites).length})`;
}
checkFavorites();

document.querySelectorAll('.nav-item').forEach((li) => {
  li.addEventListener('click', (e) => {
    loadContent(urls[e.target.dataset.src]);
  });
});

async function loadContent([url, render, index = null]) {
  selectContent.innerHTML = '';
  selectContent.append(background);

  await fetch(url)
    .then(res => {
      if (!res.ok) {
        alert(`something wrong!`);
        return;
      }
      return res.text();
    })
    .then(res => render(res, index))
    .catch(e => alert(e.message));

  selectContent.querySelector('.background').remove();
}

function renderLord(res) {
  const prefix = 'https://n.lordfilm.film';
  const div = document.createElement('div');
  div.innerHTML = res.split('<body')[1];
  div.querySelectorAll('.th-item').forEach((item) => {
    const content = contentItem.cloneNode(true);
    content.querySelector('a').href = item.querySelector('a').href;
    content.querySelector('a').dataset.play = 'lord';
    // content.querySelector('img').src = prefix + item.querySelector('img').dataset.src;
    content.querySelector('img').src = item.querySelector('img').dataset.src
    content.querySelector('p').innerHTML = item.querySelector('.th-title').innerHTML;
    content.querySelector('a').addEventListener('click', loadFilm)
    selectContent.append(content);
  });
}

function renderZagon(res, index) {
  const prefix = 'http://zagonko12.zagonko.com';
  const div = document.createElement('div');
  div.innerHTML = res.split('<body')[1];
  const films = div.querySelectorAll('.box4')[index - 1].querySelectorAll('.short');
  films.forEach((film) => {
    const content = contentItem.cloneNode(true);
    content.querySelector('a').href = prefix + '/' + film.querySelector('a').href.split(':/')[2];
    content.querySelector('a').dataset.play = 'zagonka';
    content.querySelector('img').src = prefix + film.querySelector('img').dataset.srcset.split(' ')[0];
    content.querySelector('p').innerHTML = film.querySelector('a').innerHTML;
    content.querySelector('a').addEventListener('click', loadFilm);
    selectContent.append(content);
  });
}
async function loadFilm(e, tab = false) {
  e.preventDefault();
  let currentLink = null;
  if (!tab) {
    currentLink = e.currentTarget;
    activeFilm.name = currentLink.querySelector('.content-title').innerHTML;
  } else {
    currentLink = e.currentTarget;
    activeFilm.name = currentLink.innerHTML;
  }

  activeFilm.href = currentLink.href;
  activeFilm.play = currentLink.dataset.play;

  if (localStorage.getItem('favorites') && localStorage.getItem('favorites').includes(activeFilm.name)) {
    addFavoriteBtn.classList.add('active');
  } else {
    addFavoriteBtn.classList.remove('active');
  }
  const html = await fetch(currentLink.href)
    .then(res => res.text())
    .catch(e => alert(e.message));
  const div = document.createElement('div');
  div.innerHTML = html.split('<body')[1];

  switch (currentLink.dataset.play) {
    case "zagonka": {
      div.querySelector('#ipl').src = 'http://zagonko12.zagonko.com' + div.querySelector('#ipl').dataset.src;
      player.append(div.querySelector('#ipl'));
    }
      break;
    case "lord": {
      // player.append(div.querySelectorAll('iframe')[0]);
      const src = div.querySelectorAll('iframe')[0].dataset.src;
      const ifr = document.createElement('iframe');
      ifr.allowFullscreen = true;
      ifr.src = src;
      player.append(ifr);
    }
      break;
  }

  wrapper.style.transform = `translateX(-${wrapper.clientWidth / 2 + 5}px)`;
  filmWindow = 1;
}

document.querySelector('.view-close').addEventListener('click', () => {
  wrapper.style.transform = `translateX(0px)`;
  player.innerHTML = '';
  filmWindow = 0;
});

addFavoriteBtn.addEventListener('click', (e) => {
  if (localStorage.getItem('favorites') && localStorage.getItem('favorites').includes(activeFilm.name)) {
    addFavoriteBtn.classList.remove('active');
    editFavoritesStorage(false);
  } else {
    addFavoriteBtn.classList.add('active');
    editFavoritesStorage(true);
  }
});

function editFavoritesStorage(add, film = null) {
  const temp = JSON.parse(localStorage.getItem('favorites'));
  add
    ? temp[activeFilm.name] = [activeFilm.href, activeFilm.play]
    : delete temp[film || activeFilm.name];
  localStorage.setItem('favorites', JSON.stringify(temp));
  checkFavorites();
}

favoriteTitle.addEventListener('click', () => {
  favoriteList.classList.toggle('hideTab');
});

function toggleModal() {
  document.querySelector('.modal-bg').classList.toggle('hide');
}

document.querySelector('.favorites-addBtn').addEventListener('click', toggleModal);
document.querySelector('.modal-close').addEventListener('click', toggleModal);

modalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  activeFilm.name = modalForm.querySelector('#film-name').value;
  activeFilm.href = modalForm.querySelector('#film-url').value;

  activeFilm.href.includes('zagon')
    ? activeFilm.play = 'zagonka'
    : activeFilm.play = 'lord';
  editFavoritesStorage(true);
  toggleModal();
});

window.addEventListener('resize', () => {
  if (!filmWindow) {
    return;
  }
  wrapper.style.transition = 'none';
  wrapper.style.transform = `translateX(-${wrapper.clientWidth / 2 + 5}px)`;
  wrapper.style.transitionDuration = '0.5s';
  wrapper.style.transitionProperty = 'all';
});