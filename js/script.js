const urls = {
  lordSerials: ['https://lord4.lordfilm.lu/serialy/', renderLord],
  lordFilms: ['https://lord4.lordfilm.lu/filmy/', renderLord],
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
const favoriteTab = document.querySelector('.hide').querySelector('.favotites-item');
const favoriteList = document.querySelector('.favorites-list');
const favoriteCounter = document.querySelector('.favorites-counter');
const addFavoriteBtn = document.querySelector('.view-favorite');
let activeFilm = {};

function checkFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites'));
  if (!favorites) {
    favoriteCounter.innerHTML = '(0)';
    return;
  }

  for (let k in favorites) {
    const newTab = favoriteTab.cloneNode(true);
    newTab.querySelector('.favorites-descr').innerHTML = k;
    newTab.querySelector('.favorites-descr').href = favorites[k];
    favoriteList.append(newTab);
  }
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
  const prefix = 'https://lord4.lordfilm.lu';
  const div = document.createElement('div');
  div.innerHTML = res.split('<body')[1];
  div.querySelectorAll('.th-item').forEach((item) => {
    const content = contentItem.cloneNode(true);
    content.querySelector('a').href = item.querySelector('a').href;
    content.querySelector('a').dataset.play = 'lord';
    content.querySelector('img').src = prefix + item.querySelector('img').dataset.src;
    content.querySelector('p').innerHTML = item.querySelector('.th-title').innerHTML;
    content.addEventListener('click', loadFilm)
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
    content.addEventListener('click', loadFilm)
    selectContent.append(content);
  });
}
async function loadFilm (e) {
  e.preventDefault();
  const currentLink = e.currentTarget.querySelector('a');
  activeFilm.name = currentLink.innerHTML;
  activeFilm.href = currentLink.href;

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
    case "lord": {player.append(div.querySelectorAll('iframe')[1])}
    break;
  }

  wrapper.style.transform = `translateX(-${select.clientWidth + 5}px)`;
}

document.querySelector('.view-close').addEventListener('click', () => {
  wrapper.style.transform = `translateX(0px)`;
  player.innerHTML = '';
});
addFavoriteBtn.addEventListener('click', (e) => {
  if (localStorage.getItem('favorites').includes(activeFilm.name)) {
    addFavoriteBtn.classList.remove('active');
  } else {
    addFavoriteBtn.classList.add('active');
  }
});