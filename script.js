const header = document.getElementById('site-header');
const burgerBtn = document.getElementById('burger-btn');

burgerBtn.addEventListener('click', () => {
  const isOpen = header.classList.toggle('open');
  burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

document.addEventListener('click', (e) => {
  if(header.classList.contains('open') && !header.contains(e.target)){
    header.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
});

document.getElementById('mobile-nav').addEventListener('click', (e) => {
  if(e.target.tagName === 'A'){
    header.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
});

const box = document.getElementById('snowfall');

for(let i=0;i<24;i++) {
  const f = document.createElement('div');
  f.className = 'flake';
  const size = 2 + Math.random()*3;
  f.style.width = size+'px';
  f.style.height = size+'px';
  f.style.left = Math.random()*100+'%';
  f.style.animationDuration = (4+Math.random()*4)+'s';
  f.style.animationDelay = (Math.random()*5)+'s';
  box.appendChild(f);
}