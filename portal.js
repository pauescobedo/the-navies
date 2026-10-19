const loginPanel = document.querySelector('#login');
const dashboard = document.querySelector('#member-dashboard');
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');
const memberName = document.querySelector('#member-name');

localStorage.removeItem('navies-demo-chat');
localStorage.removeItem('navies-demo-member');

const scoreRoot = 'scores';
const audioRoot = 'audios';
const scoreLibrary = {
  'shake-it-off': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'baby-one-more-time': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'sweet-caroline': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'dont-look-back-in-anger': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'the-final-countdown': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'have-you-ever-seen-the-rain': [
    ['General', 'general.pdf'], ['Letra', 'letra.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ],
  'the-final-countdown-reprise': [
    ['General', 'general.pdf'], ['Acordes', 'acordes.pdf'], ['Teclado', 'teclado.pdf'], ['Bajo', 'bajo.pdf']
  ]
};

document.querySelectorAll('[data-score-song]').forEach((container) => {
  const song = container.dataset.scoreSong;
  const songTitle = container.closest('.song-row').querySelector('strong').textContent;
  (scoreLibrary[song] || []).forEach(([label, filename]) => {
    const source = `${scoreRoot}/${song}/${filename}`;
    const item = document.createElement('span');
    item.className = 'score-file';
    item.innerHTML = `<a class="score-open" href="${source}" target="_blank" rel="noopener" aria-label="Abrir ${songTitle} · ${label}">${label}</a>`;
    container.append(item);
  });
  const audioSource = `${audioRoot}/${song}.mp3`;
  const divider = document.createElement('span');
  divider.className = 'audio-divider';
  divider.setAttribute('aria-hidden', 'true');
  container.append(divider);
  const audioButton = document.createElement('button');
  audioButton.className = 'audio-open';
  audioButton.type = 'button';
  audioButton.dataset.audioSrc = audioSource;
  audioButton.dataset.audioTitle = songTitle;
  audioButton.setAttribute('aria-label', `Escuchar ${songTitle}`);
  audioButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7.4v9.2L17 12 9 7.4Z"></path></svg>';
  container.append(audioButton);
});

const audioDialog = document.querySelector('#audio-dialog');
const audioPlayer = document.querySelector('#audio-player');
const audioDialogTitle = document.querySelector('#audio-dialog-title');
const audioDialogDownload = document.querySelector('#audio-dialog-download');
document.querySelectorAll('.audio-open').forEach((button) => button.addEventListener('click', () => {
  audioDialogTitle.textContent = button.dataset.audioTitle;
  audioPlayer.src = button.dataset.audioSrc;
  audioDialogDownload.href = button.dataset.audioSrc;
  audioDialogDownload.setAttribute('download', '');
  audioDialog.showModal();
}));
function closeAudioDialog() {
  audioPlayer.pause();
  audioPlayer.removeAttribute('src');
  audioPlayer.load();
  audioDialog.close();
}
document.querySelector('.audio-dialog-close').addEventListener('click', closeAudioDialog);
audioDialog.addEventListener('click', (event) => { if (event.target === audioDialog) closeAudioDialog(); });

function syncPortal() {
  const member = localStorage.getItem('navies-member-session');
  const isLoggedIn = ['pauescobedo', 'marionaescobedo', 'paufermosel', 'candelagonzalez', 'carlesgonzalez', 'ainasalmeron'].includes(member);
  loginPanel.hidden = isLoggedIn;
  dashboard.hidden = !isLoggedIn;
  document.querySelector('.space-shell').classList.toggle('is-authenticated', isLoggedIn);
  if (isLoggedIn) memberName.textContent = window.naviesMemberName(member);
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (window.naviesLogin(data.get('username'), data.get('password'))) {
    loginError.textContent = '';
    event.currentTarget.reset();
    syncPortal();
    if (window.matchMedia('(max-width: 900px)').matches) {
      requestAnimationFrame(() => window.scrollTo({ top:0, left:0, behavior:'instant' }));
    }
  } else {
    loginError.textContent = 'Usuario o contraseña incorrectos.';
  }
});

window.addEventListener('navies-auth-change', syncPortal);
syncPortal();
