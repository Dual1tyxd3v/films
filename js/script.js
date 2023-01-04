const urls = {
  lordSerials: ['https://lord4.lordfilm.lu/serialy/', lordRender],
  lordFilms: ['https://lord4.lordfilm.lu/filmy/', lordRender],
  zagonkaFilms: ['http://zagonko12.zagonko.com/9',]
};
const selectContent = document.querySelector('.select-content');
const select = document.querySelector('.select');
const background = document.querySelector('.background').cloneNode(true);
const contentItem = document.querySelector('.content');
const wrapper = document.querySelector('.wrapper');
const player = document.querySelector('.view-content');

document.querySelectorAll('.nav-item').forEach((li) => {
  li.addEventListener('click', (e) => {
    loadContent(
      urls[e.target.dataset.src][0],
      urls[e.target.dataset.src][1]
    );
  });
});

async function loadContent(url, render) {
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
    .then(res => render(res))
    .catch(e => alert(e.message));
  
    selectContent.querySelector('.background').remove();
} 

function lordRender(res) {
  const prefix = 'https://lord4.lordfilm.lu';
  const div = document.createElement('div');
  div.innerHTML = res.split('<body')[1];
  div.querySelectorAll('.th-item').forEach((item) => {
    const content = contentItem.cloneNode(true);
    content.querySelector('a').href = item.querySelector('a').href;
    content.querySelector('img').src = prefix + item.querySelector('img').dataset.src;
    content.querySelector('p').innerHTML = item.querySelector('.th-title').innerHTML;
    content.addEventListener('click', loadFilm)
    selectContent.append(content);
  });
  // console.log(items.length)
}

async function loadFilm (e) {
  e.preventDefault();
  const html = await fetch(e.currentTarget.querySelector('a').href)
    .then(res => res.text())
    .catch(e => alert(e.message));
  const div = document.createElement('div');
  div.innerHTML = html.split('<body')[1];
  player.append(div.querySelectorAll('iframe')[1]);
  wrapper.style.transform = `translateX(-${select.clientWidth + 5}px)`;
}

document.querySelector('.view-close').addEventListener('click', () => {
  wrapper.style.transform = `translateX(0px)`;
  player.innerHTML = '';
});