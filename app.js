const main = document.querySelector('#main');
const startGalleryButton = document.querySelector('#startGallery');
const seriesModal = document.querySelector('#seriesModal');
const closeSeriesButton = document.querySelector('#closeSeries');
const backToGalleryButton = document.querySelector('#backToGallery');
const seriesTitle = document.querySelector('#seriesTitle');
const seriesDescription = document.querySelector('#seriesDescription');
const seriesImage = document.querySelector('#seriesImage');
const nextSlideButton = document.querySelector('#nextSlide');
const prevSlideButton = document.querySelector('#prevSlide');

let worldData = null;
let seriesData = null;
let currentSeries = null;
let currentSlideIndex = 0;
let movementInterval = null;
let isWalking = false;
let speedMultiplier = 1;

const state = {
  position: 0,
  viewportWidth: 0,
  worldWidth: 0,
  activePaintingId: null,
};

const sections = {
  home: () => {
    main.innerHTML = `
      <section class="intro">
        <div class="intro__copy">
          <h1>Gallery Walk</h1>
          <p>
            Прогуляйтесь по виртуальной галерее, чтобы изучить серии работ,
            посмотреть фотографии в полноэкранном режиме и записаться на съемку.
          </p>
          <ul>
            <li>Пробел — шаг вперед, удержание — непрерывное движение.</li>
            <li>Shift + пробел — ускорение.</li>
            <li>Esc — закрытие просмотра серии.</li>
          </ul>
          <button id="enterGallery" class="primary">Открыть Gallery Walk</button>
        </div>
        <div class="intro__visual">
          <div class="intro__panel">
            <h3>Что внутри</h3>
            <p>2D сцена, активные картины, просмотр серий и быстрый CTA.</p>
          </div>
        </div>
      </section>
    `;

    const enterButton = document.querySelector('#enterGallery');
    enterButton.addEventListener('click', () => navigate('/gallery'));
  },
  gallery: () => {
    main.innerHTML = `
      <section class="gallery">
        <div class="gallery__hud">
          <span>Залы: ${worldData.rooms.length}</span>
          <span>Подойдите к картине, чтобы открыть серию</span>
        </div>
        <div class="gallery__viewport" id="galleryViewport">
          <div class="gallery__world" id="galleryWorld"></div>
          <div class="gallery__floor"></div>
          <div class="character" id="character"></div>
          <div class="interaction" id="interaction">
            <strong id="interactionTitle"></strong>
            <button id="openSeries" class="primary">Открыть</button>
          </div>
        </div>
        <div class="controls">
          <button class="controls__button" id="walkButton">Идти</button>
          <span>Подсказка: удерживайте кнопку или пробел для непрерывного движения.</span>
        </div>
      </section>
    `;

    setupGallery();
  },
};

const routes = {
  '/': 'home',
  '/gallery': 'gallery',
};

function navigate(path) {
  window.history.pushState({}, '', path);
  renderRoute();
}

function getRoute() {
  const path = window.location.pathname;
  if (path.startsWith('/gallery/series/')) {
    return 'series';
  }

  return routes[path] ?? 'home';
}

function renderRoute() {
  const route = getRoute();
  if (route === 'series') {
    const id = window.location.pathname.split('/').pop();
    showSeries(id);
    if (routes['/gallery']) {
      sections.gallery();
    }
    return;
  }

  sections[route]();
}

async function loadData() {
  const [worldResponse, seriesResponse] = await Promise.all([
    fetch('data/world.json'),
    fetch('data/series.json'),
  ]);

  worldData = await worldResponse.json();
  seriesData = await seriesResponse.json();
}

function setupGallery() {
  const world = document.querySelector('#galleryWorld');
  const viewport = document.querySelector('#galleryViewport');
  const character = document.querySelector('#character');
  const interaction = document.querySelector('#interaction');
  const interactionTitle = document.querySelector('#interactionTitle');
  const openSeriesButton = document.querySelector('#openSeries');
  const walkButton = document.querySelector('#walkButton');

  state.viewportWidth = viewport.clientWidth;

  world.innerHTML = '';
  state.worldWidth = 0;

  worldData.rooms.forEach((room) => {
    const roomElement = document.createElement('div');
    roomElement.className = 'room';
    roomElement.style.width = `${room.width}px`;

    const roomLabel = document.createElement('span');
    roomLabel.className = 'room__label';
    roomLabel.textContent = room.title;
    roomElement.appendChild(roomLabel);

    room.paintings.forEach((painting) => {
      const paintingElement = document.createElement('div');
      paintingElement.className = 'painting';
      paintingElement.dataset.id = painting.seriesId;
      paintingElement.style.left = `${painting.position}px`;
      paintingElement.innerHTML = `<strong>${painting.title}</strong>`;
      roomElement.appendChild(paintingElement);
    });

    world.appendChild(roomElement);
    state.worldWidth += room.width;
  });

  world.style.width = `${state.worldWidth}px`;
  character.style.left = `${state.position}px`;

  const update = () => {
    const clampedPosition = Math.max(0, Math.min(state.position, state.worldWidth - 60));
    state.position = clampedPosition;
    character.style.left = `${clampedPosition}px`;
    const cameraX = Math.max(0, clampedPosition - state.viewportWidth / 2);
    world.style.transform = `translateX(${-cameraX}px)`;

    let activePainting = null;
    world.querySelectorAll('.painting').forEach((painting) => {
      const paintingX = painting.offsetLeft + painting.parentElement.offsetLeft;
      const distance = Math.abs(paintingX - clampedPosition);
      painting.classList.toggle('active', distance < 120);
      if (distance < 120) {
        activePainting = painting;
      }
    });

    if (activePainting) {
      state.activePaintingId = activePainting.dataset.id;
      interactionTitle.textContent = activePainting.textContent;
      interaction.style.left = `${Math.max(0, activePainting.offsetLeft - 20)}px`;
      interaction.classList.add('visible');
    } else {
      state.activePaintingId = null;
      interaction.classList.remove('visible');
    }
  };

  const stepForward = (multiplier = 1) => {
    state.position += worldData.step * multiplier;
    update();
  };

  const startWalking = () => {
    if (isWalking) return;
    isWalking = true;
    character.classList.add('walk');
    movementInterval = window.setInterval(() => {
      stepForward(speedMultiplier);
    }, worldData.walkInterval);
  };

  const stopWalking = () => {
    isWalking = false;
    character.classList.remove('walk');
    if (movementInterval) {
      window.clearInterval(movementInterval);
      movementInterval = null;
    }
  };

  walkButton.addEventListener('mousedown', () => {
    speedMultiplier = 1;
    startWalking();
  });

  walkButton.addEventListener('mouseup', stopWalking);
  walkButton.addEventListener('mouseleave', stopWalking);
  walkButton.addEventListener('touchstart', (event) => {
    event.preventDefault();
    speedMultiplier = 1;
    startWalking();
  });
  walkButton.addEventListener('touchend', stopWalking);

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      speedMultiplier = event.shiftKey ? 2 : 1;
      if (!isWalking) {
        stepForward(speedMultiplier);
      }
      startWalking();
    }

    if (event.code === 'Escape') {
      hideSeries();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
      stopWalking();
    }
  });

  openSeriesButton.addEventListener('click', () => {
    if (state.activePaintingId) {
      navigate(`/gallery/series/${state.activePaintingId}`);
    }
  });

  update();
}

function showSeries(id) {
  currentSeries = seriesData.series.find((series) => series.id === id);
  if (!currentSeries) return;

  currentSlideIndex = 0;
  seriesTitle.textContent = currentSeries.title;
  seriesDescription.textContent = currentSeries.description;
  updateSeriesImage();
  seriesModal.classList.add('open');
  seriesModal.setAttribute('aria-hidden', 'false');
}

function hideSeries() {
  seriesModal.classList.remove('open');
  seriesModal.setAttribute('aria-hidden', 'true');
  if (window.location.pathname.startsWith('/gallery/series/')) {
    navigate('/gallery');
  }
}

function updateSeriesImage() {
  if (!currentSeries) return;
  const currentImage = currentSeries.images[currentSlideIndex];
  seriesImage.src = currentImage.src;
  seriesImage.alt = currentImage.alt;
}

function nextSlide() {
  if (!currentSeries) return;
  currentSlideIndex = (currentSlideIndex + 1) % currentSeries.images.length;
  updateSeriesImage();
}

function prevSlide() {
  if (!currentSeries) return;
  currentSlideIndex =
    (currentSlideIndex - 1 + currentSeries.images.length) % currentSeries.images.length;
  updateSeriesImage();
}

nextSlideButton.addEventListener('click', nextSlide);
prevSlideButton.addEventListener('click', prevSlide);
closeSeriesButton.addEventListener('click', hideSeries);
backToGalleryButton.addEventListener('click', hideSeries);
seriesModal.querySelector('.modal__backdrop').addEventListener('click', hideSeries);

startGalleryButton.addEventListener('click', () => navigate('/gallery'));

window.addEventListener('popstate', renderRoute);

loadData().then(renderRoute);
