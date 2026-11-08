const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const siteHeader = document.querySelector('.site-header');
const navigationParent = navigation.parentNode;
const navigationNextSibling = navigation.nextSibling;
let navigationRestoreTimer;
let lastScrollY = window.scrollY;
let keepHeaderVisibleUntil = 0;

function restoreNavigation() {
  clearTimeout(navigationRestoreTimer);
  if (navigation.parentNode !== navigationParent) navigationParent.insertBefore(navigation, navigationNextSibling);
  navigation.classList.remove('mobile-nav-overlay', 'selection-pending');
}

function closeMenu() {
  keepHeaderVisibleUntil = Date.now() + 700;
  siteHeader.classList.remove('header-hidden');
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  navigationRestoreTimer = setTimeout(() => {
    document.body.classList.remove('menu-open');
    restoreNavigation();
  }, 500);
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  siteHeader.classList.remove('header-hidden');
  if (isOpen) {
    closeMenu();
    return;
  }
  if (window.matchMedia('(max-width: 900px)').matches) {
    clearTimeout(navigationRestoreTimer);
    document.body.append(navigation);
    navigation.classList.add('mobile-nav-overlay');
    void navigation.offsetHeight;
  }
  menuButton.setAttribute('aria-expanded', 'true');
  navigation.classList.add('open');
  document.body.classList.add('menu-open');
});

const pageViews = [...document.querySelectorAll('[data-page-view]')];
let revealObserver = null;
let localizedSpaceTitle = 'Espacio Navy';
const routeDetails = {
  home: { hash:'#inicio', title:'The Navies' },
  'navies-live': { hash:'#navies-live', title:'Navies Live' },
  'espacio-navy': { hash:'#espacio-navy', title:'Espacio Navy' }
};

const countdownLanding = document.querySelector('#countdown-landing');
const countdownStart = document.querySelector('#countdown-start');
const countdownEnter = document.querySelector('#countdown-enter');
const countdownAudio = document.querySelector('#countdown-audio');
const countdownVolume = document.querySelector('#countdown-volume');
const concertMoment = new Date('2026-11-21T13:30:00+01:00').getTime();
const countdownTracks = [
  { file:'shake-it-off', artist:'Taylor Swift', title:'Shake It Off', start:163, end:216, fadeAtEnd:true },
  { file:'baby-one-more-time', artist:'Britney Spears', title:'…Baby One More Time', start:166, end:210, fadeAtEnd:true },
  { file:'sweet-caroline', artist:'Neil Diamond', title:'Sweet Caroline', start:128, end:160, fadeAtEnd:true },
  { file:'dont-look-back-in-anger', artist:'Oasis', title:"Don't Look Back in Anger", start:219 },
  { file:'the-final-countdown', artist:'Europe', title:'The Final Countdown', start:244, fadeAtEnd:true },
  { file:'have-you-ever-seen-the-rain', artist:'Creedence Clearwater Revival', title:'Have You Ever Seen the Rain?', start:101, fadeAtEnd:true }
];
const countdownMusicVolume = .24;
const countdownFadeInDuration = 1600;
const countdownFadeOutDuration = 2000;
let countdownTrackIndex = Math.floor(Math.random() * countdownTracks.length);
let countdownTimer = null;
let countdownFadeFrame = null;
let countdownEndFadeStarted = false;
let countdownLeaving = false;
let countdownHasPlayed = false;
let countdownChangingTrack = false;
let countdownStartConfirmed = false;
let countdownFadeInStarted = false;
let countdownMuted = false;
let countdownTrackQueue = [];
let countdownTrackNoticeTimer = null;
let countdownPreloadTimer = null;
let countdownPreparation = null;
let countdownPreparedIndex = -1;
let countdownPreparationId = 0;
const naviesIsIOS = /iP(?:hone|ad|od)/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let naviesMobileAudioContext = null;
const naviesMobileAudioGains = new WeakMap();
const naviesMobileAudioLevels = new WeakMap();
const naviesMobileAudioMuted = new WeakMap();
const naviesMobileAudioPending = new WeakSet();
const naviesMobileAudioPromises = new WeakMap();

function ensureAudioGain(audio) {
  if (!audio || !naviesIsIOS) return null;
  if (naviesMobileAudioGains.has(audio)) return naviesMobileAudioGains.get(audio);
  if (naviesMobileAudioPending.has(audio)) return naviesMobileAudioPromises.get(audio) || null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  naviesMobileAudioPending.add(audio);
  naviesMobileAudioLevels.set(audio, Number.isFinite(audio.volume) ? audio.volume : 1);
  const intendedMutedState = naviesMobileAudioMuted.get(audio) ?? audio.muted;
  naviesMobileAudioMuted.set(audio, intendedMutedState);
  audio.muted = true;
  try {
    if (!naviesMobileAudioContext) naviesMobileAudioContext = new AudioContextClass();
    const activate = naviesMobileAudioContext.state === 'running'
      ? Promise.resolve()
      : naviesMobileAudioContext.resume();
    const activationPromise = Promise.resolve(activate).then(() => {
      if (naviesMobileAudioContext.state !== 'running') throw new Error('Audio context unavailable');
      const source = naviesMobileAudioContext.createMediaElementSource(audio);
      const gain = naviesMobileAudioContext.createGain();
      gain.gain.value = intendedMutedState ? 0 : (naviesMobileAudioLevels.get(audio) ?? 1);
      source.connect(gain).connect(naviesMobileAudioContext.destination);
      audio.volume = 1;
      naviesMobileAudioGains.set(audio, gain);
      naviesMobileAudioPending.delete(audio);
      naviesMobileAudioPromises.delete(audio);
      audio.muted = intendedMutedState;
      return gain;
    }).catch(() => {
      naviesMobileAudioPending.delete(audio);
      naviesMobileAudioPromises.delete(audio);
      audio.muted = intendedMutedState;
      return null;
    });
    naviesMobileAudioPromises.set(audio, activationPromise);
    return activationPromise;
  } catch (error) {
    naviesMobileAudioPending.delete(audio);
    naviesMobileAudioPromises.delete(audio);
    audio.muted = intendedMutedState;
  }
  return null;
}

function resumeNaviesAudio() {
  if (naviesIsIOS && naviesMobileAudioContext?.state === 'suspended') {
    naviesMobileAudioContext.resume().catch(() => {});
  }
}

function getAudioLevel(audio) {
  const gain = naviesMobileAudioGains.get(audio);
  if (gain) return gain.gain.value;
  return naviesMobileAudioLevels.get(audio) ?? audio.volume;
}

function setAudioLevel(audio, level) {
  const safeLevel = Math.max(0, Math.min(1, level));
  naviesMobileAudioLevels.set(audio, safeLevel);
  const gain = naviesMobileAudioGains.get(audio);
  if (gain) gain.gain.value = naviesMobileAudioMuted.get(audio) ? 0 : safeLevel;
  else {
    try { audio.volume = safeLevel; } catch (error) {}
  }
}

function setAudioMuted(audio, muted) {
  const nextMuted = Boolean(muted);
  naviesMobileAudioMuted.set(audio, nextMuted);
  audio.muted = nextMuted;
  const gain = naviesMobileAudioGains.get(audio);
  if (gain) gain.gain.value = nextMuted ? 0 : (naviesMobileAudioLevels.get(audio) ?? 1);
}

function isAudioMuted(audio) {
  return naviesMobileAudioMuted.get(audio) ?? audio.muted;
}

function shuffledTrackIndexes(avoidFirstIndex = -1) {
  const indexes = countdownTracks.map((_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[randomIndex]] = [indexes[randomIndex], indexes[index]];
  }
  if (indexes.length > 1 && indexes[0] === avoidFirstIndex) [indexes[0], indexes[1]] = [indexes[1], indexes[0]];
  return indexes;
}

function showCountdownTrackNotice(duration = 4000) {
  const notice = document.querySelector('#countdown-track-notice');
  if (!notice) return;
  const track = countdownTracks[countdownTrackIndex];
  notice.textContent = `${track.artist} — ${track.title}`;
  notice.classList.add('is-visible');
  window.clearTimeout(countdownTrackNoticeTimer);
  if (duration > 0) countdownTrackNoticeTimer = window.setTimeout(() => notice.classList.remove('is-visible'), duration);
}

function updateCountdown() {
  const remaining = Math.max(0, concertMoment - Date.now());
  const values = {
    days:Math.floor(remaining / 86400000),
    hours:Math.floor((remaining % 86400000) / 3600000),
    minutes:Math.floor((remaining % 3600000) / 60000),
    seconds:Math.floor((remaining % 60000) / 1000)
  };
  Object.entries(values).forEach(([unit, value]) => {
    const element = countdownLanding?.querySelector(`[data-countdown-unit="${unit}"]`);
    if (element) element.textContent = String(value).padStart(2, '0');
  });
}

function countdownAudioSource() {
  const prefix = window.__naviesForcedLanguage ? '../' : '';
  return `${prefix}audios/${countdownTracks[countdownTrackIndex].file}.mp3`;
}

function stopCountdownFade() {
  if (countdownFadeFrame !== null) {
    window.cancelAnimationFrame(countdownFadeFrame);
    countdownFadeFrame = null;
  }
}

function fadeCountdownAudio(targetVolume, duration, onComplete) {
  if (!countdownAudio) return;
  stopCountdownFade();
  const initialVolume = getAudioLevel(countdownAudio);
  const startedAt = performance.now();
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = targetVolume > initialVolume
      ? progress * progress * (3 - (2 * progress))
      : 1 - Math.pow(1 - progress, 3);
    setAudioLevel(countdownAudio, initialVolume + ((targetVolume - initialVolume) * eased));
    if (progress < 1) countdownFadeFrame = window.requestAnimationFrame(animate);
    else {
      countdownFadeFrame = null;
      if (onComplete) onComplete();
    }
  };
  countdownFadeFrame = window.requestAnimationFrame(animate);
}

function chooseNextCountdownTrack() {
  if (countdownTracks.length < 2) return 0;
  if (!countdownTrackQueue.length) countdownTrackQueue = shuffledTrackIndexes(countdownTrackIndex);
  return countdownTrackQueue.shift();
}

function prepareCountdownTrack() {
  if (!countdownAudio) return Promise.reject(new Error('Audio unavailable'));
  if (countdownPreparation && countdownPreparedIndex === countdownTrackIndex) return countdownPreparation;
  const preparationId = ++countdownPreparationId;
  const preparedTrackIndex = countdownTrackIndex;
  const preparedTrack = countdownTracks[preparedTrackIndex];
  countdownEndFadeStarted = false;
  countdownHasPlayed = false;
  countdownStartConfirmed = false;
  countdownFadeInStarted = false;
  countdownAudio.src = countdownAudioSource();
  countdownAudio.load();
  countdownPreparedIndex = preparedTrackIndex;
  countdownPreparation = new Promise((resolve, reject) => {
    const setStartPoint = () => {
      cleanup();
      if (preparationId !== countdownPreparationId || preparedTrackIndex !== countdownTrackIndex) {
        reject(new Error('Stale audio preparation'));
        return;
      }
      countdownAudio.currentTime = Math.min(preparedTrack.start, Math.max(0, countdownAudio.duration - .25));
      resolve();
    };
    const reportError = () => {
      cleanup();
      countdownPreparation = null;
      countdownPreparedIndex = -1;
      reject(countdownAudio.error || new Error('Audio unavailable'));
    };
    const cleanup = () => {
      countdownAudio.removeEventListener('loadedmetadata', setStartPoint);
      countdownAudio.removeEventListener('error', reportError);
    };
    if (countdownAudio.readyState >= 1) setStartPoint();
    else {
      countdownAudio.addEventListener('loadedmetadata', setStartPoint, { once:true });
      countdownAudio.addEventListener('error', reportError, { once:true });
    }
  });
  return countdownPreparation;
}

async function playPreparedCountdownTrack() {
  if (!countdownAudio || countdownLeaving) return false;
  stopCountdownFade();
  resumeNaviesAudio();
  setAudioLevel(countdownAudio, 0);
  const intendedStart = countdownTracks[countdownTrackIndex].start;
  const isFirstPlay = !countdownHasPlayed;
  const trackIndexAtPlay = countdownTrackIndex;
  const enforceStartPoint = () => {
    if (!isFirstPlay || countdownLeaving || countdownTrackIndex !== trackIndexAtPlay) return;
    try {
      if (countdownAudio.currentTime < intendedStart - 1) countdownAudio.currentTime = intendedStart;
      else if (!countdownStartConfirmed) {
        countdownStartConfirmed = true;
      }
    } catch (error) {}
  };
  enforceStartPoint();
  try {
    await countdownAudio.play();
    enforceStartPoint();
    window.setTimeout(enforceStartPoint, 80);
    window.setTimeout(enforceStartPoint, 260);
    window.setTimeout(enforceStartPoint, 700);
    window.setTimeout(enforceStartPoint, 1500);
    countdownHasPlayed = true;
    countdownStartConfirmed = true;
    if (!countdownFadeInStarted) {
      countdownFadeInStarted = true;
      fadeCountdownAudio(countdownMusicVolume, countdownFadeInDuration);
    }
    showCountdownTrackNotice();
    return true;
  } catch (error) {
    return false;
  }
}

async function startCountdownTrack() {
  try {
    await prepareCountdownTrack();
    return await playPreparedCountdownTrack();
  } catch (error) {
    return false;
  }
}

async function advanceCountdownTrack() {
  if (countdownLeaving || countdownChangingTrack) return;
  countdownChangingTrack = true;
  countdownAudio.pause();
  countdownTrackIndex = chooseNextCountdownTrack();
  countdownPreparation = null;
  countdownPreparedIndex = -1;
  await startCountdownTrack();
  countdownChangingTrack = false;
}

async function revealCountdown() {
  sessionStorage.setItem('the-navies-countdown-revealed', '1');
  countdownStart.disabled = true;
  document.documentElement.classList.remove('countdown-welcome');
  await Promise.resolve(ensureAudioGain(countdownAudio));
  resumeNaviesAudio();
  await startCountdownTrack();
}

function setCountdownVolumeLabel() {
  if (!countdownVolume) return;
  const copy = translations[currentLanguage] || translations.es;
  countdownVolume.setAttribute('aria-pressed', String(countdownMuted));
  countdownVolume.setAttribute('aria-label', countdownMuted ? copy.countdownSoundOn : copy.countdownSoundOff);
  countdownVolume.classList.toggle('is-muted', countdownMuted);
}

function toggleCountdownVolume() {
  countdownMuted = !countdownMuted;
  setAudioMuted(countdownAudio, countdownMuted);
  setCountdownVolumeLabel();
}

function activateCountdownExperience() {
  updateCountdown();
  if (countdownTimer === null) countdownTimer = window.setInterval(updateCountdown, 1000);
  prepareCountdownTrack().catch(() => {});
}

function finishCountdownEntrance() {
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    document.documentElement.classList.remove('countdown-entering');
  }));
}

function startCountdownPreload() {
  window.clearTimeout(countdownPreloadTimer);
  document.documentElement.classList.remove('countdown-preloading');
  void document.documentElement.offsetHeight;
  document.documentElement.classList.add('countdown-preloading');
  countdownPreloadTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('countdown-preloading');
  }, 2500);
}

function resetCountdownWelcomeState() {
  if (typeof siteMusicAudio !== 'undefined' && siteMusicAudio && !siteMusicAudio.paused) siteMusicAudio.pause();
  stopCountdownFade();
  countdownAudio.pause();
  countdownAudio.currentTime = 0;
  countdownLeaving = false;
  countdownChangingTrack = false;
  countdownEndFadeStarted = false;
  countdownHasPlayed = false;
  countdownStartConfirmed = false;
  countdownFadeInStarted = false;
  countdownTrackIndex = Math.floor(Math.random() * countdownTracks.length);
  countdownPreparation = null;
  countdownPreparedIndex = -1;
  countdownPreparationId += 1;
  countdownTrackQueue = shuffledTrackIndexes().filter((index) => index !== countdownTrackIndex);
  countdownStart.disabled = false;
  sessionStorage.removeItem('the-navies-countdown-revealed');
  document.documentElement.classList.remove('countdown-exiting');
}

function openCountdownWelcome({ showPreloader = true } = {}) {
  if (document.documentElement.classList.contains('countdown-opening')) return;
  resetCountdownWelcomeState();
  if (!showPreloader) {
    const root = document.documentElement;
    root.classList.add('countdown-opening');
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      root.classList.add('countdown-opening-active');
    }));
    window.setTimeout(() => {
      root.classList.add('countdown-entry', 'countdown-welcome', 'countdown-welcome-arriving');
      root.classList.remove('countdown-opening', 'countdown-opening-active');
      history.replaceState({ route:'countdown' }, '', location.pathname);
      window.scrollTo({ top:0, behavior:'auto' });
      activateCountdownExperience();
      window.setTimeout(() => root.classList.remove('countdown-welcome-arriving'), 900);
    }, 900);
    return;
  }
  document.documentElement.classList.add('countdown-entry', 'countdown-welcome', 'countdown-entering');
  history.replaceState({ route:'countdown' }, '', location.pathname);
  window.scrollTo({ top:0, behavior:'auto' });
  activateCountdownExperience();
  startCountdownPreload();
  finishCountdownEntrance();
}

function leaveCountdown() {
  countdownLeaving = true;
  window.clearTimeout(countdownPreloadTimer);
  document.documentElement.classList.remove('countdown-preloading');
  const handoffIndex = countdownTrackIndex;
  prepareSiteMusicFromCountdown(handoffIndex);
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (countdownAudio) {
    if (countdownAudio.paused) {
      countdownAudio.currentTime = 0;
    } else {
      fadeCountdownAudio(0, countdownFadeOutDuration, () => {
        countdownAudio.pause();
        countdownAudio.currentTime = 0;
      });
    }
  }
  sessionStorage.removeItem('the-navies-countdown-revealed');
  history.replaceState({ route:'home' }, '', '#inicio');
  showPage('home', false);
  const homeView = pageViews.find((view) => view.dataset.pageView === 'home');
  homeView?.classList.remove('route-entering');
  homeView?.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  document.querySelector('.footer-quick-player')?.classList.remove('quick-route-entering');
  void document.documentElement.offsetHeight;
  document.documentElement.classList.add('countdown-exiting', 'site-returning');
  document.documentElement.classList.remove('countdown-entry', 'countdown-welcome');
  window.setTimeout(() => document.documentElement.classList.remove('countdown-exiting', 'site-returning'), 1100);
}

if (countdownLanding) {
  const countdownSoundControl = document.createElement('div');
  countdownSoundControl.className = 'countdown-sound-control';
  countdownVolume?.insertAdjacentElement('beforebegin', countdownSoundControl);
  if (countdownVolume) countdownSoundControl.append(countdownVolume);
  const countdownTrackNotice = document.createElement('span');
  countdownTrackNotice.id = 'countdown-track-notice';
  countdownTrackNotice.className = 'countdown-track-notice';
  countdownTrackNotice.setAttribute('aria-live', 'polite');
  countdownSoundControl.append(countdownTrackNotice);
  countdownStart?.addEventListener('click', revealCountdown);
  countdownEnter.addEventListener('click', leaveCountdown);
  countdownVolume?.addEventListener('click', toggleCountdownVolume);
  countdownVolume?.addEventListener('mouseenter', () => showCountdownTrackNotice(0));
  countdownVolume?.addEventListener('mouseleave', () => {
    window.clearTimeout(countdownTrackNoticeTimer);
    countdownTrackNoticeTimer = window.setTimeout(() => countdownTrackNotice.classList.remove('is-visible'), 180);
  });
  countdownAudio.addEventListener('timeupdate', () => {
    if (!countdownHasPlayed || countdownChangingTrack || countdownLeaving) return;
    const track = countdownTracks[countdownTrackIndex];
    const trackEnd = track.end || countdownAudio.duration;
    if (!Number.isFinite(trackEnd)) return;
    const remaining = trackEnd - countdownAudio.currentTime;
    if (track.fadeAtEnd && !countdownEndFadeStarted && remaining <= 2.1 && remaining > 0) {
      countdownEndFadeStarted = true;
      fadeCountdownAudio(0, Math.min(countdownFadeOutDuration, remaining * 1000));
    }
    if (track.end && remaining <= 0) advanceCountdownTrack();
  });
  countdownAudio.addEventListener('ended', () => {
    if (!countdownHasPlayed || countdownChangingTrack || countdownLeaving) return;
    advanceCountdownTrack();
  });
  if (document.documentElement.classList.contains('countdown-entry')) {
    activateCountdownExperience();
    if (document.documentElement.classList.contains('countdown-welcome')) startCountdownPreload();
    if (document.documentElement.classList.contains('countdown-entering')) finishCountdownEntrance();
  }
}

function routeFromHash() {
  if (location.hash === '#navies-live') return 'navies-live';
  if (location.hash === '#espacio-navy') return 'espacio-navy';
  return 'home';
}

function showPage(route, updateHistory = true) {
  const selectedRoute = routeDetails[route] ? route : 'home';
  const selectedView = pageViews.find((view) => view.dataset.pageView === selectedRoute);
  document.documentElement.dataset.route = selectedRoute;
  pageViews.forEach((view) => {
    view.classList.remove('route-entering');
    view.querySelectorAll('.reveal').forEach((element) => {
      if (revealObserver) revealObserver.unobserve(element);
      element.classList.remove('visible');
    });
    view.hidden = view !== selectedView;
  });
  if (selectedView) {
    void selectedView.offsetHeight;
    selectedView.classList.add('route-entering');
    selectedView.addEventListener('animationend', () => {
      selectedView.classList.remove('route-entering');
    }, { once:true });
  }
  const quickPlayer = document.querySelector('.footer-quick-player');
  if (quickPlayer) {
    quickPlayer.classList.remove('quick-route-entering');
    void quickPlayer.offsetHeight;
    quickPlayer.classList.add('quick-route-entering');
    quickPlayer.addEventListener('animationend', () => quickPlayer.classList.remove('quick-route-entering'), { once:true });
  }
  navigation.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === selectedRoute);
  });
  document.body.classList.toggle('route-media', selectedRoute === 'navies-live');
  document.body.classList.toggle('route-space', selectedRoute === 'espacio-navy');
  document.title = selectedRoute === 'espacio-navy' ? localizedSpaceTitle : routeDetails[selectedRoute].title;
  if (updateHistory) history.pushState({ route:selectedRoute }, '', routeDetails[selectedRoute].hash);
  window.scrollTo({ top:0, left:0, behavior:'instant' });
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('scroll'));
    if (!revealObserver || !selectedView) return;
    const revealElements = selectedView.querySelectorAll('.reveal');
    requestAnimationFrame(() => {
      revealElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight * .94 && bounds.bottom > 0) element.classList.add('visible');
        else revealObserver.observe(element);
      });
    });
  });
}

navigation.querySelectorAll('[data-route]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  const route = link.dataset.route;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile) navigation.classList.add('selection-pending');
  else navigation.querySelectorAll('[data-route]').forEach((item) => item.classList.toggle('active', item === link));
  closeMenu();
  setTimeout(() => showPage(route), isMobile ? 190 : 0);
}));
document.querySelectorAll('a.brand[data-route]').forEach((brand) => brand.addEventListener('click', (event) => {
  event.preventDefault();
  openCountdownWelcome({ showPreloader:false });
}));
document.querySelectorAll('[data-scroll-target]').forEach((link) => link.addEventListener('click', (event) => {
  const target = document.getElementById(link.dataset.scrollTarget);
  if (!target) return;
  event.preventDefault();
  const extraOffset = link.dataset.scrollTarget === 'directo' ? 24 : 0;
  window.scrollTo({
    top: window.scrollY + target.getBoundingClientRect().top + extraOffset,
    behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
  });
  history.replaceState(history.state, '', `#${link.dataset.scrollTarget}`);
}));
window.addEventListener('popstate', () => showPage(routeFromHash(), false));
showPage(routeFromHash(), false);
document.documentElement.classList.add('nav-ready');
window.addEventListener('pageshow', () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.scrollTo({ top:0, left:0, behavior:'instant' });
  }));
});
window.addEventListener('resize', () => {
  if (!window.matchMedia('(max-width: 900px)').matches) {
    closeMenu();
    restoreNavigation();
  }
});

let headerScrollFrame = null;
window.addEventListener('scroll', () => {
  if (headerScrollFrame !== null) return;
  headerScrollFrame = requestAnimationFrame(() => {
    const currentScrollY = window.scrollY;
    const movingDown = currentScrollY > lastScrollY + 5;
    const movingUp = currentScrollY < lastScrollY - 5;
    siteHeader.classList.toggle('header-scrolled', currentScrollY > 20);
    if (currentScrollY < 110 || menuButton.getAttribute('aria-expanded') === 'true' || Date.now() < keepHeaderVisibleUntil) {
      siteHeader.classList.remove('header-hidden');
    } else if (movingDown) {
      siteHeader.classList.add('header-hidden');
    } else if (movingUp) {
      siteHeader.classList.remove('header-hidden');
    }
    lastScrollY = currentScrollY;
    headerScrollFrame = null;
  });
}, { passive: true });

const smoothWheelEnabled = window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches;
let smoothWheelFrame = null;
let smoothWheelTarget = window.scrollY;
let smoothWheelPosition = window.scrollY;

function stopSmoothWheel() {
  if (smoothWheelFrame !== null) cancelAnimationFrame(smoothWheelFrame);
  smoothWheelFrame = null;
  smoothWheelTarget = window.scrollY;
  smoothWheelPosition = window.scrollY;
}

function animateSmoothWheel() {
  const distance = smoothWheelTarget - smoothWheelPosition;
  smoothWheelPosition += distance * .19;
  window.scrollTo({ top:smoothWheelPosition, left:0, behavior:'instant' });
  if (Math.abs(distance) > .45) smoothWheelFrame = requestAnimationFrame(animateSmoothWheel);
  else {
    window.scrollTo({ top:smoothWheelTarget, left:0, behavior:'instant' });
    smoothWheelPosition = smoothWheelTarget;
    smoothWheelFrame = null;
  }
}

if (smoothWheelEnabled) {
  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const rawDelta = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
    const delta = Math.max(-150, Math.min(150, rawDelta));
    const distanceToEdge = delta > 0 ? maxScroll - smoothWheelTarget : smoothWheelTarget;
    const braking = distanceToEdge < 300 ? Math.max(.38, distanceToEdge / 300) : 1;
    smoothWheelTarget = Math.max(0, Math.min(maxScroll, smoothWheelTarget + delta * braking));
    event.preventDefault();
    if (smoothWheelFrame === null) {
      smoothWheelPosition = window.scrollY;
      smoothWheelFrame = requestAnimationFrame(animateSmoothWheel);
    }
  }, { passive:false });
  window.addEventListener('mousedown', (event) => { if (event.button === 0) stopSmoothWheel(); }, { passive:true });
  window.addEventListener('keydown', stopSmoothWheel);
  window.addEventListener('resize', stopSmoothWheel, { passive:true });
  window.addEventListener('scroll', () => {
    if (smoothWheelFrame === null) {
      smoothWheelTarget = window.scrollY;
      smoothWheelPosition = window.scrollY;
    }
  }, { passive:true });
}

const translations = {
  es: { navLive:'Directo', navSound:'Sonido', navBand:'La banda', navContact:'Contacto', heroTitle:'Clásicos de siempre.<br><em>En directo, como nunca.</em>', heroIntro:'Somos siete músicos jóvenes unidos por las ganas de tocar en directo y llevar clásicos del rock y del pop a cada escenario con energía y personalidad.', nextShow:'Próximo concierto', hireBand:'Contrata a la banda', liveLabel:'En directo', liveTitle:'Nuestro próximo concierto<br>empieza aquí.', comingSoon:'Próximamente', venue:'Plaza Masadas', time:'13:00h', onlyDate:'Por ahora, esta es nuestra única fecha anunciada.', soundLabel:'Nuestro sonido', soundBody:'Una mezcla de clásicos del rock, grandes canciones pop y esos himnos que todo el mundo reconoce desde el primer acorde. Siete músicos, voces compartidas y un directo pensado para conectar, cantar y disfrutar juntos.', examples:'Ejemplos de repertorio', exampleNote:'Ejemplos orientativos; el repertorio puede variar.', bandTitle:'Siete músicos.<br>Una sola corriente.', bandBody:'Somos siete jóvenes apasionados por la música, unidos por las ganas de tocar, aprender y disfrutar juntos sobre el escenario.', vocals:'Voz', bass:'Bajo', guitar:'Guitarra', keys:'Teclados', drums:'Batería', contactTitle:'Hablemos.', contactBody:'Si quieres contarnos una propuesta o hablar con nosotros, escríbenos.' },
  ca: { navLive:'Directe', navSound:'So', navBand:'La banda', navContact:'Contacte', heroTitle:'Clàssics de sempre.<br><em>En directe, com mai.</em>', heroIntro:'Som set músics joves units per les ganes de tocar en directe i portar clàssics del rock i del pop a cada escenari amb energia i personalitat.', nextShow:'Pròxim concert', hireBand:'Contracta la banda', liveLabel:'En directe', liveTitle:'El nostre pròxim concert<br>comença aquí.', comingSoon:'Pròximament', venue:'Plaça Masadas', time:'13:00 h', onlyDate:'De moment, aquesta és l’única data anunciada.', soundLabel:'El nostre so', soundBody:'Una barreja de clàssics del rock, grans cançons pop i aquells himnes que tothom reconeix des del primer acord. Set músics, veus compartides i un directe pensat per connectar, cantar i gaudir junts.', examples:'Exemples de repertori', exampleNote:'Exemples orientatius; el repertori pot variar.', bandTitle:'Set músics.<br>Un sol corrent.', bandBody:'Tres cantants al davant i una banda completa al darrere. The Navies recupera grans cançons respectant-ne l’essència, amb personalitat pròpia i l’energia de set músics tocant junts.', vocals:'Veu', bass:'Baix', guitar:'Guitarra', keys:'Teclats', drums:'Bateria', contactTitle:'Muntem<br>la pròxima?', contactBody:'Concerts, sales, festes de barri, festivals i esdeveniments. Escriu-nos i en parlem.' },
  en: { navLive:'Live', navSound:'Sound', navBand:'The band', navContact:'Contact', heroTitle:'Timeless classics.<br><em>Live like never before.</em>', heroIntro:'We are seven young musicians brought together by a love of playing live and bringing rock and pop classics to every stage with energy and personality.', nextShow:'Next show', hireBand:'Book the band', liveLabel:'Live', liveTitle:'The next show<br>starts here.', comingSoon:'Coming up', venue:'Plaça Masadas', time:'1:00 pm', onlyDate:'For now, this is our only announced date.', soundLabel:'Our sound', soundBody:'A mix of rock classics, great pop songs and anthems everyone knows from the first chord. Seven musicians, shared vocals and a live show made for connecting, singing and enjoying together.', examples:'Setlist examples', exampleNote:'Illustrative examples; the setlist may vary.', bandTitle:'Seven musicians.<br>One current.', bandBody:'Three singers out front and a full band behind them. The Navies brings great songs back with respect for their essence, a personality of our own and the energy of seven musicians playing together.', vocals:'Vocals', bass:'Bass', guitar:'Guitar', keys:'Keys', drums:'Drums', contactTitle:'Shall we plan<br>the next one?', contactBody:'Concerts, venues, neighbourhood parties, festivals and events. Get in touch and let’s talk.' },
  it: { navLive:'Dal vivo', navSound:'Suono', navBand:'La band', navContact:'Contatti', heroTitle:'Classici senza tempo.<br><em>Dal vivo, come mai prima.</em>', heroIntro:'Siamo sette giovani musicisti uniti dalla voglia di suonare dal vivo e portare i classici del rock e del pop su ogni palco con energia e personalità.', nextShow:'Prossimo concerto', hireBand:'Ingaggia la band', liveLabel:'Dal vivo', liveTitle:'Il nostro prossimo concerto<br>inizia qui.', comingSoon:'Prossimamente', venue:'Plaça Masadas', time:'13:00', onlyDate:'Per ora, questa è la nostra unica data annunciata.', soundLabel:'Il nostro suono', soundBody:'Un mix di classici del rock, grandi canzoni pop e inni che tutti riconoscono dal primo accordo. Sette musicisti, voci condivise e un live fatto per incontrarsi, cantare e divertirsi insieme.', examples:'Esempi di repertorio', exampleNote:'Esempi indicativi; il repertorio può variare.', bandTitle:'Sette musicisti.<br>Un’unica corrente.', bandBody:'Tre cantanti davanti e una band completa alle spalle. The Navies ripropone grandi canzoni rispettandone l’essenza, con una personalità propria e l’energia di sette musicisti che suonano insieme.', vocals:'Voce', bass:'Basso', guitar:'Chitarra', keys:'Tastiere', drums:'Batteria', contactTitle:'Organizziamo<br>la prossima?', contactBody:'Concerti, locali, feste di quartiere, festival ed eventi. Scrivici e parliamone.' },
  fr: { navLive:'En concert', navSound:'Son', navBand:'Le groupe', navContact:'Contact', heroTitle:'Des classiques intemporels.<br><em>En concert, comme jamais.</em>', heroIntro:'Nous sommes sept jeunes musiciens réunis par l’envie de jouer en concert et de porter les classiques du rock et de la pop sur scène avec énergie et personnalité.', nextShow:'Prochain concert', hireBand:'Programmer le groupe', liveLabel:'En concert', liveTitle:'Notre prochain concert<br>commence ici.', comingSoon:'Prochainement', venue:'Plaça Masadas', time:'13 h', onlyDate:'Pour le moment, c’est notre seule date annoncée.', soundLabel:'Notre son', soundBody:'Un mélange de classiques du rock, de grandes chansons pop et de refrains que tout le monde reconnaît dès le premier accord. Sept musiciens, des voix partagées et un concert pensé pour se retrouver, chanter et profiter ensemble.', examples:'Exemples du répertoire', exampleNote:'Exemples indicatifs ; le répertoire peut varier.', bandTitle:'Sept musiciens.<br>Un seul courant.', bandBody:'Trois chanteuses devant et un groupe complet derrière. The Navies reprend de grandes chansons dans le respect de leur essence, avec sa propre personnalité et l’énergie de sept musiciens réunis.', vocals:'Chant', bass:'Basse', guitar:'Guitare', keys:'Claviers', drums:'Batterie', contactTitle:'On prépare<br>la prochaine?', contactBody:'Concerts, salles, fêtes de quartier, festivals et événements. Écrivez-nous pour en parler.' }
};

Object.assign(translations.es, { soundTitle:'Buenas canciones.<br><em>Mejor en directo.</em>' });
Object.assign(translations.ca, { soundTitle:'Bones cançons.<br><em>Millor en directe.</em>' });
Object.assign(translations.en, { soundTitle:'Good songs.<br><em>Better live.</em>' });
Object.assign(translations.it, { soundTitle:'Belle canzoni.<br><em>Meglio dal vivo.</em>' });
Object.assign(translations.fr, { soundTitle:'De bonnes chansons.<br><em>Encore meilleures en concert.</em>' });
Object.assign(translations.es, { soundSignature:'Siete músicos · Un único escenario' });
Object.assign(translations.ca, { soundSignature:'Set músics · Un únic escenari' });
Object.assign(translations.en, { soundSignature:'Seven musicians · One single stage' });
Object.assign(translations.it, { soundSignature:'Sette musicisti · Un unico palco' });
Object.assign(translations.fr, { soundSignature:'Sept musiciens · Une seule scène' });

Object.assign(translations.es, { genreLine:'Rock · Pop · Clásicos', christmasTitle:'Concierto de Navidad', christmasMonth:'DIC', datePending:'Fecha provisional', dateInfo:'Anunciaremos la fecha del concierto de Navidad próximamente.', classicRock:'ROCK CLÁSICO', stadiumRock:'ROCK DE ESTADIO', rockStyle:'Guitarras, raíces y canciones que nunca envejecen', popStyle:'Ritmo, melodía y un estribillo para cantar juntos', anthemStyle:'Teclados, épica y toda la energía del directo', meetMember:'Conócela ↗', meetMemberMale:'Conócelo ↗', memberLabel:'La banda', provisionalBio:'Biografía provisional.' });
Object.assign(translations.ca, { genreLine:'Rock · Pop · Clàssics', christmasTitle:'Concert de Nadal', christmasMonth:'DES', datePending:'Data provisional', dateInfo:'Anunciarem la data del concert de Nadal ben aviat.', classicRock:'ROCK CLÀSSIC', stadiumRock:'ROCK D’ESTADI', rockStyle:'Guitarres, arrels i cançons que mai no envelleixen', popStyle:'Ritme, melodia i una tornada per cantar plegats', anthemStyle:'Teclats, èpica i tota l’energia del directe', meetMember:'Coneix-la ↗', meetMemberMale:'Coneix-lo ↗', memberLabel:'La banda', provisionalBio:'Biografia provisional.' });
Object.assign(translations.en, { genreLine:'Rock · Pop · Classics', christmasTitle:'Christmas Concert', christmasMonth:'DEC', datePending:'Provisional date', dateInfo:'We’ll announce the Christmas concert date soon.', classicRock:'CLASSIC ROCK', stadiumRock:'STADIUM ROCK', rockStyle:'Guitars, roots and songs that never grow old', popStyle:'Rhythm, melody and a chorus made to sing together', anthemStyle:'Keys, drama and the full energy of a live show', meetMember:'Meet her ↗', meetMemberMale:'Meet him ↗', memberLabel:'The band', provisionalBio:'Provisional biography.' });
Object.assign(translations.it, { genreLine:'Rock · Pop · Classici', christmasTitle:'Concerto di Natale', christmasMonth:'DIC', datePending:'Data provvisoria', dateInfo:'Annunceremo presto la data del concerto di Natale.', classicRock:'ROCK CLASSICO', stadiumRock:'STADIUM ROCK', rockStyle:'Chitarre, radici e canzoni che non invecchiano mai', popStyle:'Ritmo, melodia e un ritornello da cantare insieme', anthemStyle:'Tastiere, epica e tutta l’energia del live', meetMember:'Conoscila ↗', meetMemberMale:'Conoscilo ↗', memberLabel:'La band', provisionalBio:'Biografia provvisoria.' });
Object.assign(translations.fr, { genreLine:'Rock · Pop · Classiques', christmasTitle:'Concert de Noël', christmasMonth:'DÉC', datePending:'Date provisoire', dateInfo:'Nous annoncerons bientôt la date du concert de Noël.', classicRock:'ROCK CLASSIQUE', stadiumRock:'ROCK DE STADE', rockStyle:'Des guitares, des racines et des chansons qui ne vieillissent jamais', popStyle:'Du rythme, de la mélodie et un refrain à chanter ensemble', anthemStyle:'Des claviers, du souffle et toute l’énergie du direct', meetMember:'La découvrir ↗', meetMemberMale:'Le découvrir ↗', memberLabel:'Le groupe', provisionalBio:'Biographie provisoire.' });
Object.assign(translations.es, { sagreraHomeName:'Fiestas de La Sagrera', aprilMonth:'ABR', juneMonth:'JUN', springFestTitle:'Fiestas de la Primavera', endCourseTitle:'Concierto de Final de Curso' });
Object.assign(translations.ca, { sagreraHomeName:'Festes de La Sagrera', aprilMonth:'ABR', juneMonth:'JUN', springFestTitle:'Festes de la Primavera', endCourseTitle:'Concert de Final de Curs' });
Object.assign(translations.en, { sagreraHomeName:'La Sagrera Neighbourhood Festival', aprilMonth:'APR', juneMonth:'JUN', springFestTitle:'Spring Festival', endCourseTitle:'End-of-Year Concert' });
Object.assign(translations.it, { sagreraHomeName:'Festa di quartiere de La Sagrera', aprilMonth:'APR', juneMonth:'GIU', springFestTitle:'Festa di primavera', endCourseTitle:'Concerto di Fine Corso' });
Object.assign(translations.fr, { sagreraHomeName:'Fête de quartier de La Sagrera', aprilMonth:'AVR', juneMonth:'JUIN', springFestTitle:'Fête du printemps', endCourseTitle:'Concert de Fin d’Année' });

Object.assign(translations.es, { classicLabel:'CLÁSICO', popStyle:'Pop enérgico, ritmo y un estribillo para cantar juntos', anthemStyle:'Guitarras, teclados y toda la fuerza de un gran himno', rockStyle:'Una canción atemporal, directa y reconocible desde el primer acorde' });
Object.assign(translations.ca, { classicLabel:'CLÀSSIC', popStyle:'Pop enèrgic, ritme i una tornada per cantar plegats', anthemStyle:'Guitarres, teclats i tota la força d’un gran himne', rockStyle:'Una cançó atemporal, directa i reconeixible des del primer acord' });
Object.assign(translations.en, { classicLabel:'CLASSIC', popStyle:'Energetic pop, rhythm and a chorus made to sing together', anthemStyle:'Guitars, keys and all the power of a great rock anthem', rockStyle:'A timeless, direct song you know from the very first chord' });
Object.assign(translations.it, { classicLabel:'CLASSICO', popStyle:'Pop energico, ritmo e un ritornello da cantare insieme', anthemStyle:'Chitarre, tastiere e tutta la forza di un grande inno rock', rockStyle:'Una canzone senza tempo, diretta e riconoscibile dal primo accordo' });
Object.assign(translations.fr, { classicLabel:'CLASSIQUE', popStyle:'Une pop énergique, du rythme et un refrain à chanter ensemble', anthemStyle:'Des guitares, des claviers et toute la force d’un grand hymne rock', rockStyle:'Une chanson intemporelle et directe, reconnaissable dès le premier accord' });

Object.assign(translations.es, { roleAina:'Una voz que conecta', roleCandela:'Carácter en cada canción', roleMariona:'Melodía y emoción', roleEmma:'El pulso de la banda', roleCarles:'Guitarras con carácter', roleFermito:'Texturas que hacen crecer el sonido', rolePau:'El motor del directo' });
Object.assign(translations.ca, { roleAina:'Una veu que connecta', roleCandela:'Caràcter a cada cançó', roleMariona:'Melodia i emoció', roleEmma:'El pols de la banda', roleCarles:'Guitarres amb caràcter', roleFermito:'Textures que fan créixer el so', rolePau:'El motor del directe' });
Object.assign(translations.en, { roleAina:'A voice that connects', roleCandela:'Character in every song', roleMariona:'Melody and emotion', roleEmma:'The pulse of the band', roleCarles:'Guitars with character', roleFermito:'Textures that make the sound grow', rolePau:'The engine of the live show' });
Object.assign(translations.it, { roleAina:'Una voce che crea connessione', roleCandela:'Carattere in ogni canzone', roleMariona:'Melodia ed emozione', roleEmma:'Il battito della band', roleCarles:'Chitarre con carattere', roleFermito:'Trame che fanno crescere il suono', rolePau:'Il motore del live' });
Object.assign(translations.fr, { roleAina:'Une voix qui crée le lien', roleCandela:'Du caractère dans chaque chanson', roleMariona:'Mélodie et émotion', roleEmma:'Le pouls du groupe', roleCarles:'Des guitares de caractère', roleFermito:'Des textures qui font grandir le son', rolePau:'Le moteur du concert' });

Object.assign(translations.es, { heroIntro:'Somos siete músicos jóvenes unidos por las ganas de tocar en directo y llevar clásicos del rock y del pop a cada escenario con energía y personalidad.', liveTitle:'Nuestro próximo concierto<br>empieza aquí.', bandBody:'Somos siete jóvenes apasionados por la música, unidos por las ganas de tocar, aprender y disfrutar juntos sobre el escenario. Cada voz y cada instrumento forman parte de The Navies con el mismo peso.', contactLabel:'Contacto', contactTitle:'Hablemos.', contactBody:'Si quieres contarnos una propuesta o hablar con nosotros, escríbenos. Te responderemos lo antes posible.' });
Object.assign(translations.ca, { heroIntro:'Som set músics joves units per les ganes de tocar en directe i portar clàssics del rock i del pop a cada escenari amb energia i personalitat.', liveTitle:'El nostre pròxim concert<br>comença aquí.', bandBody:'Som set joves apassionats per la música, units per les ganes de tocar, aprendre i gaudir junts sobre l’escenari. Cada veu i cada instrument formen part de The Navies amb el mateix pes.', contactLabel:'Contacte', contactTitle:'Parlem.', contactBody:'Si vols explicar-nos una proposta o parlar amb nosaltres, escriu-nos. Et respondrem tan aviat com sigui possible.' });
Object.assign(translations.en, { heroIntro:'We are seven young musicians brought together by a love of playing live and bringing rock and pop classics to every stage with energy and personality.', liveTitle:'Our next concert<br>starts here.', bandBody:'We are seven young musicians brought together by a passion for music and a desire to play, learn and enjoy the stage together. Every voice and every instrument has an equal place in The Navies.', contactLabel:'Contact', contactTitle:'Let\'s talk.', contactBody:'If you have a proposal or simply want to talk to us, send us a message. We will get back to you as soon as possible.' });
Object.assign(translations.it, { heroIntro:'Siamo sette giovani musicisti uniti dalla voglia di suonare dal vivo e portare i classici del rock e del pop su ogni palco con energia e personalità.', liveTitle:'Il nostro prossimo concerto<br>inizia qui.', bandBody:'Siamo sette giovani appassionati di musica, uniti dalla voglia di suonare, imparare e divertirci insieme sul palco. Ogni voce e ogni strumento hanno lo stesso valore nei The Navies.', contactLabel:'Contatti', contactTitle:'Parliamone.', contactBody:'Se vuoi proporci qualcosa o semplicemente parlare con noi, scrivici. Ti risponderemo il prima possibile.' });
Object.assign(translations.fr, { heroIntro:'Nous sommes sept jeunes musiciens réunis par l’envie de jouer en concert et de porter les classiques du rock et de la pop sur scène avec énergie et personnalité.', liveTitle:'Notre prochain concert<br>commence ici.', bandBody:'Nous sommes sept jeunes passionnés de musique, réunis par l’envie de jouer, d’apprendre et de partager la scène. Chaque voix et chaque instrument occupent la même place au sein de The Navies.', contactLabel:'Contact', contactTitle:'Parlons-en.', contactBody:'Si vous souhaitez nous faire une proposition ou simplement échanger avec nous, écrivez-nous. Nous vous répondrons dès que possible.' });

Object.assign(translations.es, { formName:'Nombre', formSurname:'Apellidos', formEmail:'Correo electrónico', formPhone:'Teléfono (opcional)', formPrefix:'Prefijo internacional', formPhoneNumber:'Número de teléfono', formMessage:'Mensaje', bookingDetails:'Datos de contratación (opcionales)', formDate:'Fecha', formTime:'Hora', formPlace:'Lugar', formSubmit:'Abrir correo preparado', formNote:'Revisarás y enviarás el mensaje desde tu aplicación de correo.' });
Object.assign(translations.ca, { formName:'Nom', formSurname:'Cognoms', formEmail:'Correu electrònic', formPhone:'Telèfon (opcional)', formPrefix:'Prefix internacional', formPhoneNumber:'Número de telèfon', formMessage:'Missatge', bookingDetails:'Dades de contractació (opcionals)', formDate:'Data', formTime:'Hora', formPlace:'Lloc', formSubmit:'Obrir el correu preparat', formNote:'Revisaràs i enviaràs el missatge des de la teva aplicació de correu.' });
Object.assign(translations.en, { formName:'First name', formSurname:'Last name', formEmail:'Email', formPhone:'Phone (optional)', formPrefix:'International dialling code', formPhoneNumber:'Phone number', formMessage:'Message', bookingDetails:'Booking details (optional)', formDate:'Date', formTime:'Time', formPlace:'Venue', formSubmit:'Open prepared email', formNote:'You’ll review and send the message from your email app.' });
Object.assign(translations.it, { formName:'Nome', formSurname:'Cognome', formEmail:'Email', formPhone:'Telefono (facoltativo)', formPrefix:'Prefisso internazionale', formPhoneNumber:'Numero di telefono', formMessage:'Messaggio', bookingDetails:'Dati per l’ingaggio (facoltativi)', formDate:'Data', formTime:'Ora', formPlace:'Luogo', formSubmit:'Apri l’e-mail preparata', formNote:'Potrai controllare e inviare il messaggio dalla tua app di posta.' });
Object.assign(translations.fr, { formName:'Prénom', formSurname:'Nom de famille', formEmail:'E-mail', formPhone:'Téléphone (facultatif)', formPrefix:'Indicatif international', formPhoneNumber:'Numéro de téléphone', formMessage:'Message', bookingDetails:'Informations d’engagement (facultatives)', formDate:'Date', formTime:'Heure', formPlace:'Lieu', formSubmit:'Ouvrir l’e-mail préparé', formNote:'Vous pourrez vérifier et envoyer le message depuis votre application de messagerie.' });

Object.assign(translations.es, { navHome:'Inicio', navVideos:'Vídeos', navSpace:'Espacio Navy', spaceTitle:'Espacio<br><em>Navy.</em>', signIn:'Iniciar sesión', searchLabel:'Buscar en The Navies', searchHelp:'Prueba con “conciertos”, “banda”, “vídeos” o “contacto”.' });
Object.assign(translations.ca, { navHome:'Inici', navVideos:'Vídeos', navSpace:'Espai Navy', spaceTitle:'Espai<br><em>Navy.</em>', signIn:'Iniciar sessió', searchLabel:'Cerca a The Navies', searchHelp:'Prova amb “concerts”, “banda”, “vídeos” o “contacte”.' });
Object.assign(translations.en, { navHome:'Home', navVideos:'Videos', navSpace:'Navy Space', spaceTitle:'Navy<br><em>Space.</em>', signIn:'Sign in', searchLabel:'Search The Navies', searchHelp:'Try “concerts”, “band”, “videos” or “contact”.' });
Object.assign(translations.it, { navHome:'Home', navVideos:'Video', navSpace:'Spazio Navy', spaceTitle:'Spazio<br><em>Navy.</em>', signIn:'Accedi', searchLabel:'Cerca in The Navies', searchHelp:'Prova “concerti”, “band”, “video” o “contatti”.' });
Object.assign(translations.fr, { navHome:'Accueil', navVideos:'Vidéos', navSpace:'Espace Navy', spaceTitle:'Espace<br><em>Navy.</em>', signIn:'Se connecter', searchLabel:'Rechercher sur The Navies', searchHelp:'Essayez « concerts », « groupe », « vidéos » ou « contact ».' });

Object.assign(translations.es, { videoLabel:'The Navies en pantalla', videoTitle:'El directo,<br><em>también aquí.</em>', videoIntro:'Un espacio para revivir conciertos, ensayos y momentos de la banda. Por ahora verás ejemplos preparados para sustituir por vuestros vídeos.', featuredVideo:'Vídeo destacado · Próximamente', featuredCopy:'Aquí irá el vídeo principal del último concierto de The Navies.', watchVideo:'Ver vídeo', liveVideos:'En directo', nextRecording:'Próxima grabación', behindScenes:'Ensayos & backstage', rehearsalRoom:'Desde la sala de ensayo', howItSounds:'Cómo suena The Navies', betweenSongs:'Entre canciones', videoPlaceholder:'Vídeo provisional. Sustituye esta tarjeta por un enlace de YouTube o un archivo de vídeo cuando esté disponible.', privateArea:'Área privada de la banda', spaceIntro:'Partituras, materiales y conversación interna en un mismo lugar.', demoVersion:'Versión de demostración', memberAccess:'Acceso de miembros', loginCopy:'Introduce tus credenciales para acceder al espacio interno.', enterSpace:'Entrar', memberArea:'Espacio de miembros', hello:'Hola', signOut:'Cerrar sesión', scores:'Partituras', scoresCopy:'Documentos provisionales preparados para enlazar los PDF definitivos.', chatCopy:'Demostración local: estos mensajes solo aparecen en este dispositivo.' });
Object.assign(translations.ca, { videoLabel:'The Navies en pantalla', videoTitle:'El directe,<br><em>també aquí.</em>', videoIntro:'Un espai per reviure concerts, assajos i moments de la banda. De moment hi trobaràs exemples preparats per substituir pels vostres vídeos.', featuredVideo:'Vídeo destacat · Pròximament', featuredCopy:'Aquí hi anirà el vídeo principal de l’últim concert de The Navies.', watchVideo:'Veure vídeo', liveVideos:'En directe', nextRecording:'Pròxima gravació', behindScenes:'Assajos & backstage', rehearsalRoom:'Des de la sala d’assaig', howItSounds:'Com sona The Navies', betweenSongs:'Entre cançons', videoPlaceholder:'Vídeo provisional. Substitueix aquesta targeta per un enllaç de YouTube o un arxiu de vídeo.', privateArea:'Àrea privada de la banda', spaceIntro:'Partitures, materials i conversa interna en un mateix lloc.', demoVersion:'Versió de demostració', memberAccess:'Accés de membres', loginCopy:'Introdueix les credencials per accedir a l’espai intern.', enterSpace:'Entrar', memberArea:'Espai de membres', hello:'Hola', signOut:'Tancar sessió', scores:'Partitures', scoresCopy:'Documents provisionals preparats per enllaçar els PDF definitius.', chatCopy:'Demostració local: aquests missatges només apareixen en aquest dispositiu.' });
Object.assign(translations.en, { videoLabel:'The Navies on screen', videoTitle:'The live show,<br><em>right here too.</em>', videoIntro:'A place to revisit concerts, rehearsals and moments with the band. For now, these are examples ready to be replaced with your videos.', featuredVideo:'Featured video · Coming soon', featuredCopy:'The main video from The Navies’ latest concert will appear here.', watchVideo:'Watch video', liveVideos:'Live', nextRecording:'Next recording', behindScenes:'Rehearsals & backstage', rehearsalRoom:'From the rehearsal room', howItSounds:'How The Navies sounds', betweenSongs:'Between songs', videoPlaceholder:'Placeholder video. Replace this card with a YouTube link or video file when available.', privateArea:'Private band area', spaceIntro:'Scores, resources and internal conversation in one place.', demoVersion:'Demo version', memberAccess:'Member access', loginCopy:'Enter your credentials to access the internal space.', enterSpace:'Enter', memberArea:'Member space', hello:'Hello', signOut:'Sign out', scores:'Scores', scoresCopy:'Placeholder documents ready to link to the final PDFs.', chatCopy:'Local demo: these messages only appear on this device.' });
Object.assign(translations.it, { videoLabel:'The Navies sullo schermo', videoTitle:'Il live,<br><em>anche qui.</em>', videoIntro:'Uno spazio per rivivere concerti, prove e momenti della band. Per ora troverai esempi da sostituire con i vostri video.', featuredVideo:'Video in evidenza · Prossimamente', featuredCopy:'Qui apparirà il video principale dell’ultimo concerto.', watchVideo:'Guarda il video', liveVideos:'Dal vivo', nextRecording:'Prossima registrazione', behindScenes:'Prove & backstage', rehearsalRoom:'Dalla sala prove', howItSounds:'Il suono dei The Navies', betweenSongs:'Tra le canzoni', videoPlaceholder:'Video provvisorio. Sostituisci questa scheda con un link YouTube o un file video.', privateArea:'Area privata della band', spaceIntro:'Spartiti, materiali e conversazione interna in un unico luogo.', demoVersion:'Versione dimostrativa', memberAccess:'Accesso membri', loginCopy:'Inserisci le credenziali per accedere allo spazio interno.', enterSpace:'Entra', memberArea:'Spazio membri', hello:'Ciao', signOut:'Esci', scores:'Spartiti', scoresCopy:'Documenti provvisori pronti per collegare i PDF definitivi.', chatCopy:'Demo locale: questi messaggi appaiono solo su questo dispositivo.' });
Object.assign(translations.fr, { videoLabel:'The Navies à l’écran', videoTitle:'Le live,<br><em>aussi ici.</em>', videoIntro:'Un espace pour revivre concerts, répétitions et moments du groupe. Pour l’instant, vous trouverez des exemples à remplacer par vos vidéos.', featuredVideo:'Vidéo à la une · Prochainement', featuredCopy:'La vidéo principale du dernier concert apparaîtra ici.', watchVideo:'Voir la vidéo', liveVideos:'En concert', nextRecording:'Prochain enregistrement', behindScenes:'Répétitions & coulisses', rehearsalRoom:'Depuis la salle de répétition', howItSounds:'Le son de The Navies', betweenSongs:'Entre les chansons', videoPlaceholder:'Vidéo provisoire. Remplacez cette carte par un lien YouTube ou un fichier vidéo.', privateArea:'Espace privé du groupe', spaceIntro:'Partitions, ressources et conversation interne au même endroit.', demoVersion:'Version de démonstration', memberAccess:'Accès membres', loginCopy:'Saisissez vos identifiants pour accéder à l’espace interne.', enterSpace:'Entrer', memberArea:'Espace membres', hello:'Bonjour', signOut:'Se déconnecter', scores:'Partitions', scoresCopy:'Documents provisoires prêts à accueillir les PDF définitifs.', chatCopy:'Démo locale : ces messages apparaissent uniquement sur cet appareil.' });

Object.assign(translations.es, { spaceIntro:'Partituras, repertorios y fechas importantes organizados en un mismo lugar.', concertScoresCopy:'Partituras y materiales organizados según el repertorio del concierto.', importantDates:'Fechas importantes', calendarCopy:'Ensayos y actuaciones previstas para preparar Festes de La Sagrera.', rehearsal:'Ensayo', extraRehearsal:'Ensayo Extra', rehearsalTime:'17:30h', dressRehearsal:'Ensayo General', today:'Hoy', lyrics:'Letra', chords:'Acordes', keyboard:'Teclado' });
Object.assign(translations.ca, { spaceIntro:'Partitures, repertoris i dates importants organitzats en un mateix lloc.', concertScoresCopy:'Partitures i materials organitzats segons el repertori del concert.', importantDates:'Dates importants', calendarCopy:'Assajos i actuacions previstes per preparar Festes de La Sagrera.', rehearsal:'Assaig', extraRehearsal:'Assaig Extra', rehearsalTime:'17:30h', dressRehearsal:'Assaig General', today:'Avui', lyrics:'Lletra', chords:'Acords', keyboard:'Teclat' });
Object.assign(translations.en, { spaceIntro:'Scores, setlists and important dates organised in one place.', concertScoresCopy:'Scores and materials organised around the concert setlist.', importantDates:'Important dates', calendarCopy:'Rehearsals and performances scheduled for Festes de La Sagrera.', rehearsal:'Rehearsal', extraRehearsal:'Extra Rehearsal', rehearsalTime:'17:30h', dressRehearsal:'Dress Rehearsal', today:'Today', lyrics:'Lyrics', chords:'Chords', keyboard:'Keys' });
Object.assign(translations.it, { spaceIntro:'Spartiti, repertori e date importanti organizzati in un unico luogo.', concertScoresCopy:'Spartiti e materiali organizzati secondo il repertorio del concerto.', importantDates:'Date importanti', calendarCopy:'Prove ed esibizioni previste per preparare Festes de La Sagrera.', rehearsal:'Prova', extraRehearsal:'Prova Extra', rehearsalTime:'17:30h', dressRehearsal:'Prova Generale', today:'Oggi', lyrics:'Testo', chords:'Accordi', keyboard:'Tastiere' });
Object.assign(translations.fr, { spaceIntro:'Partitions, répertoires et dates importantes réunies au même endroit.', concertScoresCopy:'Partitions et ressources organisées selon le programme du concert.', importantDates:'Dates importantes', calendarCopy:'Répétitions et concerts prévus pour préparer Festes de La Sagrera.', rehearsal:'Répétition', extraRehearsal:'Répétition Supplémentaire', rehearsalTime:'17:30h', dressRehearsal:'Répétition Générale', today:'Aujourd’hui', lyrics:'Paroles', chords:'Accords', keyboard:'Clavier' });

Object.assign(translations.es, { sagreraFestName:'Fiestas de La Sagrera 2026', calendarCopy:'Ensayos y actuaciones previstas para preparar las Fiestas de La Sagrera.' });
Object.assign(translations.ca, { sagreraFestName:'Festes de La Sagrera 2026', calendarCopy:'Assajos i actuacions previstes per preparar les Festes de La Sagrera.' });
Object.assign(translations.en, { sagreraFestName:'La Sagrera Neighbourhood Festival 2026', calendarCopy:'Rehearsals and performances scheduled for the La Sagrera neighbourhood festival.' });
Object.assign(translations.it, { sagreraFestName:'Festa di quartiere de La Sagrera 2026', calendarCopy:'Prove ed esibizioni previste per la festa di quartiere de La Sagrera.' });
Object.assign(translations.fr, { sagreraFestName:'Fête de quartier de La Sagrera 2026', calendarCopy:'Répétitions et concerts prévus pour la fête de quartier de La Sagrera.' });
Object.assign(translations.es, { usefulLinks:'Enlaces útiles', usefulLinksCopy:'Accesos directos a los recursos compartidos de la banda.', driveLinkCopy:'Archivos compartidos', spotifyLinkCopy:'Lista de The Navies', appleMusicLinkCopy:'Lista de The Navies' });
Object.assign(translations.ca, { usefulLinks:'Enllaços útils', usefulLinksCopy:'Accessos directes als recursos compartits de la banda.', driveLinkCopy:'Arxius compartits', spotifyLinkCopy:'Llista de The Navies', appleMusicLinkCopy:'Llista de The Navies' });
Object.assign(translations.en, { usefulLinks:'Useful links', usefulLinksCopy:'Quick access to the band’s shared resources.', driveLinkCopy:'Shared files', spotifyLinkCopy:'The Navies playlist', appleMusicLinkCopy:'The Navies playlist' });
Object.assign(translations.it, { usefulLinks:'Link utili', usefulLinksCopy:'Accesso rapido alle risorse condivise della band.', driveLinkCopy:'File condivisi', spotifyLinkCopy:'Playlist dei The Navies', appleMusicLinkCopy:'Playlist dei The Navies' });
Object.assign(translations.fr, { usefulLinks:'Liens utiles', usefulLinksCopy:'Accès direct aux ressources partagées du groupe.', driveLinkCopy:'Fichiers partagés', spotifyLinkCopy:'Playlist de The Navies', appleMusicLinkCopy:'Playlist de The Navies' });

const memberBios = {
  es: {
    aina:['Voz','Aina aporta una voz luminosa y una presencia natural sobre el escenario. Le gustan las melodías que empiezan cerca y terminan haciendo cantar a toda la plaza.'],
    candela:['Voz','Candela combina carácter, sensibilidad y una energía muy directa con el público. Su sitio favorito es justo donde una canción empieza a crecer.'],
    mariona:['Voz','Mariona completa el frente vocal con calidez y versatilidad. Disfruta construyendo armonías y encontrando una personalidad nueva en canciones conocidas.'],
    emma:['Bajo','Emma sostiene el pulso de The Navies con líneas sólidas y musicales. Es el punto de unión entre el ritmo, las voces y todo lo que ocurre en el escenario.'],
    carles:['Guitarra','Carles da forma al sonido de la banda con guitarras precisas, texturas y el punto justo de energía rock. Siempre al servicio de la canción.'],
    fermito:['Teclados','Fermito abre el paisaje sonoro con pianos, sintetizadores y arreglos que hacen crecer cada tema sin perder su esencia.'],
    pau:['Batería','Pau impulsa el directo desde la batería: sólido, dinámico y atento a cada cambio. Su objetivo es sencillo: que la banda respire como una sola.']
  }
};
memberBios.ca = {
  aina:['Veu','L’Aina aporta una veu lluminosa i una presència natural a l’escenari. Li agraden les melodies que comencen a prop i acaben fent cantar tota la plaça.'], candela:['Veu','La Candela combina caràcter, sensibilitat i una energia molt directa amb el públic. El seu lloc preferit és on una cançó comença a créixer.'], mariona:['Veu','La Mariona completa el front vocal amb calidesa i versatilitat. Gaudeix construint harmonies i trobant una nova personalitat en cançons conegudes.'], emma:['Baix','L’Emma sosté el pols de The Navies amb línies sòlides i musicals. És el punt d’unió entre el ritme, les veus i tot el que passa a l’escenari.'], carles:['Guitarra','En Carles dona forma al so de la banda amb guitarres precises, textures i el punt just d’energia rock. Sempre al servei de la cançó.'], fermito:['Teclats','En Fermito obre el paisatge sonor amb pianos, sintetitzadors i arranjaments que fan créixer cada tema sense perdre’n l’essència.'], pau:['Bateria','En Pau impulsa el directe des de la bateria: sòlid, dinàmic i atent a cada canvi. L’objectiu és que la banda respiri com una sola.']
};
memberBios.en = {
  aina:['Vocals','Aina brings a bright voice and a natural stage presence. She loves melodies that begin intimately and end with the whole square singing.'], candela:['Vocals','Candela combines character, sensitivity and a direct connection with the audience. Her favourite place is where a song begins to grow.'], mariona:['Vocals','Mariona completes the vocal line-up with warmth and versatility. She enjoys building harmonies and finding new character in familiar songs.'], emma:['Bass','Emma holds The Navies together with solid, musical bass lines, linking the rhythm, the voices and everything happening on stage.'], carles:['Guitar','Carles shapes the band’s sound with precise guitars, texture and just the right amount of rock energy—always serving the song.'], fermito:['Keys','Fermito expands the sound with piano, synths and arrangements that help every track grow without losing its essence.'], pau:['Drums','Pau drives the live show from the drums: solid, dynamic and alert to every change. His aim is simple—to make the band breathe as one.']
};
memberBios.it = { ...memberBios.en };
memberBios.fr = { ...memberBios.en };
Object.assign(memberBios.es, {
  vocals:['Tres voces','Tres cantantes comparten melodías, armonías y coros para dar fuerza y emoción a cada canción.'], bass:['Bajo','Una bajista sostiene la base grave y conecta el ritmo con la armonía.'], guitar:['Guitarra','Un guitarrista aporta riffs, acordes y el carácter rock del repertorio.'], keys:['Teclados','Se encarga de aportar pianos, sintetizadores y arreglos que amplían el sonido.'], drums:['Batería','Hace que la batería marque el pulso, mueva la energía y mantenga unida a la banda.']
});
Object.assign(memberBios.ca, {
  vocals:['Tres veus','Tres cantants comparteixen melodies, harmonies i cors per donar força i emoció a cada cançó.'], bass:['Baix','Una baixista sosté la base greu i connecta el ritme amb l’harmonia.'], guitar:['Guitarra','Un guitarrista aporta riffs, acords i el caràcter rock del repertori.'], keys:['Teclats','S’encarrega d’aportar pianos, sintetitzadors i arranjaments que amplien el so.'], drums:['Bateria','Fa que la bateria marqui el pols, mogui l’energia i mantingui unida la banda.']
});
Object.assign(memberBios.en, {
  vocals:['Three voices','Three singers share melodies, harmonies and choruses to bring power and emotion to every song.'], bass:['Bass','One bassist anchors the low end and connects rhythm with harmony.'], guitar:['Guitar','One guitarist brings riffs, chords and the rock character of the set.'], keys:['Keys','Takes care of adding piano, synthesisers and arrangements that expand the sound.'], drums:['Drums','Makes the drums set the pulse, drive the energy and hold the band together.']
});
memberBios.it = {
  vocals:['Tre voci','Tre cantanti condividono melodie, armonie e cori per dare forza ed emozione a ogni brano.'], bass:['Basso','Una bassista sostiene le frequenze basse e collega ritmo e armonia.'], guitar:['Chitarra','Un chitarrista porta riff, accordi e il carattere rock del repertorio.'], keys:['Tastiere','Si occupa di aggiungere pianoforti, sintetizzatori e arrangiamenti che ampliano il suono.'], drums:['Batteria','Fa sì che la batteria segni il ritmo, muova l’energia e tenga unita la band.']
};
memberBios.fr = {
  vocals:['Trois voix','Trois chanteuses partagent mélodies, harmonies et chœurs pour donner force et émotion à chaque morceau.'], bass:['Basse','Une bassiste soutient les graves et relie le rythme à l’harmonie.'], guitar:['Guitare','Un guitariste apporte riffs, accords et le caractère rock du répertoire.'], keys:['Claviers','Se charge d’ajouter pianos, synthétiseurs et arrangements pour élargir le son.'], drums:['Batterie','Fait en sorte que la batterie donne le rythme, porte l’énergie et maintienne le groupe uni.']
};

const languagePicker = document.querySelector('#language-picker');
const languageTrigger = languagePicker.querySelector('.language-trigger');
const languageMenu = languagePicker.querySelector('.language-menu');
const languageOptions = [...languageMenu.querySelectorAll('[data-language]')];
Object.assign(translations.es, { spring:'Primavera', summer:'Verano', autumn:'Otoño', winter:'Invierno' });
Object.assign(translations.ca, { spring:'Primavera', summer:'Estiu', autumn:'Tardor', winter:'Hivern' });
Object.assign(translations.en, { spring:'Spring', summer:'Summer', autumn:'Autumn', winter:'Winter' });
Object.assign(translations.it, { spring:'Primavera', summer:'Estate', autumn:'Autunno', winter:'Inverno' });
Object.assign(translations.fr, { spring:'Printemps', summer:'Été', autumn:'Automne', winter:'Hiver' });
Object.assign(translations.es, { visualVocals:'Voces', visualBass:'Bajo', visualGuitar:'Guitarra', visualKeys:'Teclados', visualDrums:'Batería', sessionActive:'Sesión iniciada', sessionClosed:'Sesión cerrada' });
Object.assign(translations.ca, { visualVocals:'Veus', visualBass:'Baix', visualGuitar:'Guitarra', visualKeys:'Teclats', visualDrums:'Bateria', sessionActive:'Sessió iniciada', sessionClosed:'Sessió tancada' });
Object.assign(translations.en, { visualVocals:'Vocals', visualBass:'Bass', visualGuitar:'Guitar', visualKeys:'Keyboards', visualDrums:'Drums', sessionActive:'Signed in', sessionClosed:'Signed out' });
Object.assign(translations.it, { visualVocals:'Voci', visualBass:'Basso', visualGuitar:'Chitarra', visualKeys:'Tastiere', visualDrums:'Batteria', sessionActive:'Accesso effettuato', sessionClosed:'Sessione chiusa' });
Object.assign(translations.fr, { visualVocals:'Voix', visualBass:'Basse', visualGuitar:'Guitare', visualKeys:'Claviers', visualDrums:'Batterie', sessionActive:'Session ouverte', sessionClosed:'Session fermée' });
Object.assign(translations.es, { adminAccess:'Acceder a administración' });
Object.assign(translations.ca, { adminAccess:'Accedir a administració' });
Object.assign(translations.en, { adminAccess:'Access administration' });
Object.assign(translations.it, { adminAccess:'Accedi all’amministrazione' });
Object.assign(translations.fr, { adminAccess:'Accéder à l’administration' });
Object.assign(translations.es, { groupVocals:'Tres cantantes', groupVocalsCopy:'Tres voces para melodías, armonías y coros.', groupBass:'Una bajista', groupBassCopy:'La base grave que une ritmo y armonía.', groupGuitar:'Un guitarrista', groupGuitarCopy:'Riffs, acordes y el carácter rock del grupo.', groupKeys:'Pau Fermosel', groupKeysCopy:'Pianos, sintetizadores y capas que amplían el sonido.', groupDrums:'Pau Escobedo', groupDrumsCopy:'El pulso que mueve la energía y mantiene unida a la banda.', provisionalBio:'Así se completa el sonido de The Navies.' });
Object.assign(translations.ca, { groupVocals:'Tres cantants', groupVocalsCopy:'Tres veus per a melodies, harmonies i cors.', groupBass:'Una baixista', groupBassCopy:'La base greu que uneix ritme i harmonia.', groupGuitar:'Un guitarrista', groupGuitarCopy:'Riffs, acords i el caràcter rock del grup.', groupKeys:'Pau Fermosel', groupKeysCopy:'Pianos, sintetitzadors i capes que amplien el so.', groupDrums:'Pau Escobedo', groupDrumsCopy:'El pols que mou l’energia i manté unida la banda.', provisionalBio:'Així es completa el so de The Navies.' });
Object.assign(translations.en, { groupVocals:'Three singers', groupVocalsCopy:'Three voices for melodies, harmonies and choruses.', groupBass:'One bassist', groupBassCopy:'The low-end foundation connecting rhythm and harmony.', groupGuitar:'One guitarist', groupGuitarCopy:'Riffs, chords and the band’s rock character.', groupKeys:'Pau Fermosel', groupKeysCopy:'Piano, synthesisers and layers that expand the sound.', groupDrums:'Pau Escobedo', groupDrumsCopy:'The pulse that drives the energy and holds the band together.', provisionalBio:'This is how The Navies completes its sound.' });
Object.assign(translations.it, { groupVocals:'Tre cantanti', groupVocalsCopy:'Tre voci per melodie, armonie e cori.', groupBass:'Una bassista', groupBassCopy:'La base grave che unisce ritmo e armonia.', groupGuitar:'Un chitarrista', groupGuitarCopy:'Riff, accordi e il carattere rock della band.', groupKeys:'Pau Fermosel', groupKeysCopy:'Pianoforti, sintetizzatori e strati che ampliano il suono.', groupDrums:'Pau Escobedo', groupDrumsCopy:'Il ritmo che muove l’energia e tiene unita la band.', provisionalBio:'Così si completa il suono dei The Navies.' });
Object.assign(translations.fr, { groupVocals:'Trois chanteuses', groupVocalsCopy:'Trois voix pour les mélodies, harmonies et chœurs.', groupBass:'Une bassiste', groupBassCopy:'La base grave qui relie rythme et harmonie.', groupGuitar:'Un guitariste', groupGuitarCopy:'Des riffs, des accords et le caractère rock du groupe.', groupKeys:'Pau Fermosel', groupKeysCopy:'Pianos, synthétiseurs et textures qui élargissent le son.', groupDrums:'Pau Escobedo', groupDrumsCopy:'Le rythme qui porte l’énergie et maintient le groupe uni.', provisionalBio:'Ainsi se construit le son de The Navies.' });

Object.assign(translations.es, { countdownWelcomeTitle:'Algo está a punto de sonar', countdownWelcomeCopy:'El 21 de noviembre, siete músicos y un escenario te esperan en Plaza Masadas. El resto, lo tendrás que descubrir en directo.', countdownWelcomeStart:'Descubrir', countdownEventDate:'21 DE NOVIEMBRE', countdownEventTime:'13:00', countdownPlaceLabel:'Lugar', countdownDays:'Días', countdownHours:'Horas', countdownMinutes:'Minutos', countdownSeconds:'Segundos', countdownEnter:'Ir a inicio', memberContinuation:'…a cargo de', memberDialogVocals:'En las <em>voces</em>…', memberDialogBass:'En el <em>bajo</em>…', memberDialogGuitar:'En la <em>guitarra</em>…', memberDialogKeys:'En los <em>teclados</em>…', memberDialogDrums:'En la <em>batería</em>…', countdownEventTime:'13:00', countdownEventVenue:'PLAZA MASADAS', countdownKicker:'Próximo concierto', countdownDateLabel:'Fecha', countdownTimeLabel:'Hora' });
Object.assign(translations.ca, { countdownWelcomeTitle:'Alguna cosa està a punt de sonar', countdownWelcomeCopy:'El 21 de novembre, set músics i un escenari t’esperen a Plaza Masadas. La resta, l’hauràs de descobrir en directe.', countdownWelcomeStart:'Descobrir', countdownEventDate:'21 DE NOVEMBRE', countdownEventTime:'13:00', countdownEventVenue:'PLAZA MASADAS', countdownKicker:'Pròxim concert', countdownDateLabel:'Data', countdownTimeLabel:'Hora', countdownPlaceLabel:'Lloc', countdownDays:'Dies', countdownHours:'Hores', countdownMinutes:'Minuts', countdownSeconds:'Segons', countdownEnter:'Anar a l’inici', memberInCharge:'A càrrec de', memberDialogKeys:'Als <em>teclats</em>', memberDialogDrums:'A la <em>bateria</em>' });
Object.assign(translations.en, { countdownWelcomeTitle:'Something is about to begin', countdownWelcomeCopy:'On 21 November, seven musicians and one stage await you at Plaza Masadas. The rest, you’ll have to discover live.', countdownWelcomeStart:'Discover', countdownEventDate:'21 NOVEMBER', countdownEventTime:'13:00', countdownEventVenue:'PLAZA MASADAS', countdownKicker:'Next show', countdownDateLabel:'Date', countdownTimeLabel:'Time', countdownPlaceLabel:'Venue', countdownDays:'Days', countdownHours:'Hours', countdownMinutes:'Minutes', countdownSeconds:'Seconds', countdownEnter:'Go to homepage', memberInCharge:'Featuring', memberDialogKeys:'On <em>keys</em>', memberDialogDrums:'On <em>drums</em>' });
Object.assign(translations.it, { countdownWelcomeTitle:'Qualcosa sta per iniziare', countdownWelcomeCopy:'Il 21 novembre, sette musicisti e un palco ti aspettano a Plaza Masadas. Il resto dovrai scoprirlo dal vivo.', countdownWelcomeStart:'Scopri', countdownEventDate:'21 NOVEMBRE', countdownEventTime:'13:00', countdownEventVenue:'PLAZA MASADAS', countdownKicker:'Prossimo concerto', countdownDateLabel:'Data', countdownTimeLabel:'Ora', countdownPlaceLabel:'Luogo', countdownDays:'Giorni', countdownHours:'Ore', countdownMinutes:'Minuti', countdownSeconds:'Secondi', countdownEnter:'Vai alla home', memberInCharge:'Con', memberDialogKeys:'Alle <em>tastiere</em>', memberDialogDrums:'Alla <em>batteria</em>' });
Object.assign(translations.fr, { countdownWelcomeTitle:'Quelque chose va commencer', countdownWelcomeCopy:'Le 21 novembre, sept musiciens et une scène vous attendent à Plaza Masadas. Le reste sera à découvrir en concert.', countdownWelcomeStart:'Découvrir', countdownEventDate:'21 NOVEMBRE', countdownEventTime:'13:00', countdownEventVenue:'PLAZA MASADAS', countdownKicker:'Prochain concert', countdownDateLabel:'Date', countdownTimeLabel:'Heure', countdownPlaceLabel:'Lieu', countdownDays:'Jours', countdownHours:'Heures', countdownMinutes:'Minutes', countdownSeconds:'Secondes', countdownEnter:'Aller à l’accueil', memberInCharge:'Avec', memberDialogKeys:'Aux <em>claviers</em>', memberDialogDrums:'À la <em>batterie</em>' });
Object.assign(translations.ca, { memberContinuation:'…a càrrec de', memberDialogVocals:'En les <em>veus</em>…', memberDialogBass:'En el <em>baix</em>…', memberDialogGuitar:'En la <em>guitarra</em>…', memberDialogKeys:'En els <em>teclats</em>…', memberDialogDrums:'En la <em>bateria</em>…' });
Object.assign(translations.en, { memberContinuation:'…featuring', memberDialogVocals:'On <em>vocals</em>…', memberDialogBass:'On <em>bass</em>…', memberDialogGuitar:'On <em>guitar</em>…', memberDialogKeys:'On <em>keyboards</em>…', memberDialogDrums:'On <em>drums</em>…' });
Object.assign(translations.it, { memberContinuation:'…con', memberDialogVocals:'Alle <em>voci</em>…', memberDialogBass:'Al <em>basso</em>…', memberDialogGuitar:'Alla <em>chitarra</em>…', memberDialogKeys:'Alle <em>tastiere</em>…', memberDialogDrums:'Alla <em>batteria</em>…' });
Object.assign(translations.fr, { memberContinuation:'…avec', memberDialogVocals:'Aux <em>voix</em>…', memberDialogBass:'À la <em>basse</em>…', memberDialogGuitar:'À la <em>guitare</em>…', memberDialogKeys:'Aux <em>claviers</em>…', memberDialogDrums:'À la <em>batterie</em>…' });
Object.assign(translations.es, { countdownSoundOff:'Silenciar música', countdownSoundOn:'Activar música' });
Object.assign(translations.ca, { countdownSoundOff:'Silenciar la música', countdownSoundOn:'Activar la música' });
Object.assign(translations.en, { countdownSoundOff:'Mute music', countdownSoundOn:'Turn music on' });
Object.assign(translations.it, { countdownSoundOff:'Disattiva la musica', countdownSoundOn:'Attiva la musica' });
Object.assign(translations.fr, { countdownSoundOff:'Couper la musique', countdownSoundOn:'Activer la musique' });

Object.assign(translations.es, { rightsReserved:'Todos los derechos reservados', collaboration:'Con la colaboración de' });
Object.assign(translations.ca, { rightsReserved:'Tots els drets reservats', collaboration:'Amb la col·laboració de' });
Object.assign(translations.en, { rightsReserved:'All rights reserved', collaboration:'In collaboration with' });
Object.assign(translations.it, { rightsReserved:'Tutti i diritti riservati', collaboration:'In collaborazione con' });
Object.assign(translations.fr, { rightsReserved:'Tous droits réservés', collaboration:'En collaboration avec' });
Object.assign(translations.es, { musicPrevious:'Canción anterior', musicPlay:'Reproducir música', musicPause:'Pausar música', musicNext:'Siguiente canción', musicMute:'Silenciar música', musicUnmute:'Activar sonido' });
Object.assign(translations.ca, { musicPrevious:'Cançó anterior', musicPlay:'Reprodueix música', musicPause:'Pausa la música', musicNext:'Cançó següent', musicMute:'Silencia la música', musicUnmute:'Activa el so' });
Object.assign(translations.en, { musicPrevious:'Previous song', musicPlay:'Play music', musicPause:'Pause music', musicNext:'Next song', musicMute:'Mute music', musicUnmute:'Turn sound on' });
Object.assign(translations.it, { musicPrevious:'Brano precedente', musicPlay:'Riproduci musica', musicPause:'Metti in pausa', musicNext:'Brano successivo', musicMute:'Disattiva la musica', musicUnmute:'Attiva il suono' });
Object.assign(translations.fr, { musicPrevious:'Chanson précédente', musicPlay:'Lancer la musique', musicPause:'Mettre en pause', musicNext:'Chanson suivante', musicMute:'Couper la musique', musicUnmute:'Activer le son' });
Object.assign(translations.es, { bcnIntro:'En este camino contamos con la colaboración de <strong class="bcn-highlight">BCN Fusió</strong>, que nos acompaña y nos ayuda a seguir creciendo como banda.' });
Object.assign(translations.ca, { bcnIntro:'En aquest camí comptem amb la col·laboració de <strong class="bcn-highlight">BCN Fusió</strong>, que ens acompanya i ens ajuda a continuar creixent com a banda.' });
Object.assign(translations.en, { bcnIntro:'Along the way, we have the support of <strong class="bcn-highlight">BCN Fusió</strong>, who are helping us continue to grow as a band.' });
Object.assign(translations.it, { bcnIntro:'In questo percorso contiamo sulla collaborazione di <strong class="bcn-highlight">BCN Fusió</strong>, che ci accompagna e ci aiuta a continuare a crescere come band.' });
Object.assign(translations.fr, { bcnIntro:'Dans cette aventure, nous bénéficions de la collaboration de <strong class="bcn-highlight">BCN Fusió</strong>, qui nous accompagne et nous aide à continuer de grandir en tant que groupe.' });

const seasonThemes = {
  spring: { color:'#F4A7C1', icon:'🌸' },
  summer: { color:'#FFD76A', icon:'☀️' },
  autumn: { color:'#C77B52', icon:'🍁' },
  winter: { color:'#A8DADC', icon:'❄️' }
};
let siteFooter = document.querySelector('footer');
if (!siteFooter) {
  siteFooter = document.createElement('footer');
  siteFooter.innerHTML = '<a class="brand" href="#inicio" data-route="home">THE NAVIES<span>.</span></a><p class="footer-copyright">© <span class="footer-year"></span> The Navies<span data-i18n="rightsReserved">Todos los derechos reservados</span></p><p class="footer-credit"><span data-i18n="collaboration">Con la colaboración de</span> <a href="https://bcnfusio.cat" target="_blank" rel="noopener">BCN Fusió ↗</a></p>';
  document.body.append(siteFooter);
}
const footerQuickPlayer = document.querySelector('.footer-quick-player');
const footerJump = footerQuickPlayer.querySelector('.footer-jump');
const footerQuickMenu = footerQuickPlayer.querySelector('.footer-quick-menu');
const footerQuickTrack = footerQuickPlayer.querySelector('.footer-quick-track');
footerQuickMenu.inert = true;
footerQuickPlayer.addEventListener('animationend', () => footerQuickPlayer.classList.remove('quick-route-entering'), { once:true });
window.setTimeout(() => footerQuickPlayer.classList.remove('quick-route-entering'), 900);
let footerQuickCloseTimer = null;
let footerQuickTrackTimer = null;
function showFooterQuickTrack() {
  if (siteMusicIndex < 0) return;
  const track = countdownTracks[siteMusicIndex];
  footerQuickTrack.textContent = `${track.artist} — ${track.title}`;
  window.clearTimeout(footerQuickTrackTimer);
  footerQuickTrack.classList.remove('is-visible');
  footerQuickPlayer.classList.remove('track-visible');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    footerQuickPlayer.classList.add('track-visible');
    footerQuickTrack.classList.add('is-visible');
    footerQuickTrackTimer = window.setTimeout(() => {
      footerQuickTrack.classList.remove('is-visible');
      footerQuickPlayer.classList.remove('track-visible');
    }, 4000);
  }));
}
function setFooterQuickOpen(open) {
  window.clearTimeout(footerQuickCloseTimer);
  footerQuickPlayer.classList.toggle('is-open', open);
  footerQuickMenu.inert = !open;
  footerJump.setAttribute('aria-expanded', String(open));
  footerJump.setAttribute('aria-label', open ? 'Ir al reproductor y al pie de página' : 'Abrir controles de música');
}
footerQuickPlayer.addEventListener('mouseenter', () => {
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) setFooterQuickOpen(true);
});
footerQuickPlayer.addEventListener('mouseleave', () => {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  footerQuickCloseTimer = window.setTimeout(() => setFooterQuickOpen(false), 160);
});
document.addEventListener('pointerdown', (event) => {
  if (!window.matchMedia('(hover:none), (pointer:coarse)').matches) return;
  if (!footerQuickPlayer.classList.contains('is-open') || footerQuickPlayer.contains(event.target)) return;
  setFooterQuickOpen(false);
});
footerJump.addEventListener('click', () => {
  const isOpen = footerQuickPlayer.classList.contains('is-open');
  if (!isOpen) {
    setFooterQuickOpen(true);
    return;
  }
  setFooterQuickOpen(false);
  siteFooter.scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block:'end' });
});
const seasonControl = document.createElement('div');
seasonControl.className = 'season-control';
seasonControl.innerHTML = `
  <div class="site-music-player" aria-label="The Navies music player">
    <div class="site-music-controls">
      <button type="button" class="site-music-button" data-music-action="previous" data-i18n-aria="musicPrevious" aria-label="Canción anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 7-7 5 7 5V7Zm7 0-7 5 7 5V7Z"/></svg>
      </button>
      <button type="button" class="site-music-button site-music-play" data-music-action="toggle" data-i18n-aria="musicPlay" aria-label="Reproducir música">
        <svg class="music-play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"/></svg>
        <svg class="music-pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
      </button>
      <button type="button" class="site-music-button" data-music-action="next" data-i18n-aria="musicNext" aria-label="Siguiente canción">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 7 7 5-7 5V7ZM5 7l7 5-7 5V7Z"/></svg>
      </button>
    </div>
    <div class="site-music-main">
      <span class="site-music-track-viewport"><span class="site-music-track" aria-live="polite">The Navies</span></span>
      <input class="site-music-progress" type="range" min="0" max="1000" value="0" aria-label="Posición de la canción">
    </div>
    <button type="button" class="site-music-button site-music-mute" data-music-action="mute" data-i18n-aria="musicMute" aria-label="Silenciar música">
      <svg class="music-sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path class="music-wave" d="M16 9.2a4 4 0 0 1 0 5.6M18.5 6.8a7.3 7.3 0 0 1 0 10.4"/></svg>
      <svg class="music-muted-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path class="music-slash" d="m16 9 5 5m0-5-5 5"/></svg>
    </button>
    <audio class="site-music-audio" preload="metadata" playsinline></audio>
  </div>
  <div class="season-options" role="group" aria-label="Tema estacional">
    ${Object.entries(seasonThemes).map(([season, theme]) => `<button class="season-option" type="button" data-season="${season}" aria-pressed="false"><span class="season-icon" aria-hidden="true">${theme.icon}</span><span data-i18n="${season}">${season}</span></button>`).join('')}
  </div>`;
siteFooter.prepend(seasonControl);

const siteMusicAudio = seasonControl.querySelector('.site-music-audio');
const siteMusicTrack = seasonControl.querySelector('.site-music-track');
const siteMusicTrackViewport = seasonControl.querySelector('.site-music-track-viewport');
const siteMusicToggle = seasonControl.querySelector('[data-music-action="toggle"]');
const siteMusicMute = seasonControl.querySelector('[data-music-action="mute"]');
const siteMusicProgress = seasonControl.querySelector('.site-music-progress');
const footerQuickToggle = footerQuickPlayer.querySelector('.footer-quick-toggle');
const footerQuickNext = footerQuickPlayer.querySelector('.footer-quick-next');
function updateSiteMusicMarquee() {
  siteMusicTrack.classList.remove('is-scrolling');
  siteMusicTrack.style.removeProperty('--track-shift');
  siteMusicTrack.style.removeProperty('--track-duration');
  requestAnimationFrame(() => {
    const overflow = Math.ceil(siteMusicTrack.scrollWidth - siteMusicTrackViewport.clientWidth);
    if (overflow <= 2) return;
    siteMusicTrack.style.setProperty('--track-shift', `${overflow}px`);
    siteMusicTrack.style.setProperty('--track-duration', `${Math.max(8, Math.min(15, 7 + overflow / 24))}s`);
    siteMusicTrack.classList.add('is-scrolling');
  });
}
window.addEventListener('resize', updateSiteMusicMarquee, { passive:true });
new IntersectionObserver(([entry]) => {
  footerQuickPlayer.classList.toggle('is-hidden', entry.isIntersecting);
  if (entry.isIntersecting) {
    setFooterQuickOpen(false);
  }
}, { threshold:.08 }).observe(seasonControl.querySelector('.site-music-player'));
let siteMusicIndex = -1;
let siteMusicQueue = shuffledTrackIndexes();
let siteMusicHistory = [];
let siteMusicFadeFrame = null;
let siteMusicEndFadeStarted = false;

function siteMusicSource(index) {
  const prefix = window.__naviesForcedLanguage ? '../' : '';
  return `${prefix}audios/${countdownTracks[index].file}.mp3`;
}

function updateSiteMusicUI() {
  const copy = translations[currentLanguage] || translations.es;
  const playing = siteMusicIndex >= 0 && !siteMusicAudio.paused;
  siteMusicToggle.classList.toggle('is-playing', playing);
  footerQuickToggle.classList.toggle('is-playing', playing);
  siteMusicToggle.setAttribute('aria-label', playing ? copy.musicPause : copy.musicPlay);
  footerQuickToggle.setAttribute('aria-label', playing ? copy.musicPause : copy.musicPlay);
  footerQuickNext.setAttribute('aria-label', copy.musicNext);
  const musicMuted = isAudioMuted(siteMusicAudio);
  siteMusicMute.classList.toggle('is-muted', musicMuted);
  siteMusicMute.setAttribute('aria-label', musicMuted ? copy.musicUnmute : copy.musicMute);
  if (siteMusicIndex >= 0) {
    const track = countdownTracks[siteMusicIndex];
    siteMusicTrack.textContent = `${track.artist} — ${track.title}`;
    updateSiteMusicMarquee();
  }
}

function nextSiteMusicIndex() {
  if (!siteMusicQueue.length) siteMusicQueue = shuffledTrackIndexes(siteMusicIndex);
  return siteMusicQueue.shift();
}

function fadeSiteMusicOut(onComplete, duration = 2000) {
  if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
  const initialVolume = getAudioLevel(siteMusicAudio);
  const startedAt = performance.now();
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    setAudioLevel(siteMusicAudio, initialVolume * (1 - (progress * progress * (3 - (2 * progress)))));
    if (progress < 1) siteMusicFadeFrame = requestAnimationFrame(animate);
    else {
      siteMusicFadeFrame = null;
      onComplete();
    }
  };
  siteMusicFadeFrame = requestAnimationFrame(animate);
}

function fadeSiteMusicIn(duration = 2000) {
  if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
  const startedAt = performance.now();
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress * progress * (3 - (2 * progress));
    setAudioLevel(siteMusicAudio, .34 * eased);
    if (progress < 1) siteMusicFadeFrame = requestAnimationFrame(animate);
    else siteMusicFadeFrame = null;
  };
  siteMusicFadeFrame = requestAnimationFrame(animate);
}

let siteMusicInterruptedByNavyAudio = false;
window.naviesPauseSiteMusicForNavyAudio = function naviesPauseSiteMusicForNavyAudio() {
  if (siteMusicIndex < 0 || siteMusicAudio.paused || siteMusicInterruptedByNavyAudio) return;
  siteMusicInterruptedByNavyAudio = true;
  fadeSiteMusicOut(() => {
    siteMusicAudio.pause();
    updateSiteMusicUI();
  }, 650);
};

window.naviesResumeSiteMusicAfterNavyAudio = function naviesResumeSiteMusicAfterNavyAudio() {
  if (!siteMusicInterruptedByNavyAudio || siteMusicIndex < 0) return;
  siteMusicInterruptedByNavyAudio = false;
  ensureAudioGain(siteMusicAudio);
  resumeNaviesAudio();
  setAudioLevel(siteMusicAudio, 0);
  siteMusicAudio.play().then(() => {
    fadeSiteMusicIn(750);
    showFooterQuickTrack();
    updateSiteMusicUI();
  }).catch(() => {
    setAudioLevel(siteMusicAudio, .34);
    updateSiteMusicUI();
  });
};

async function playSiteMusic(index, rememberCurrent = true) {
  if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
  ensureAudioGain(siteMusicAudio);
  resumeNaviesAudio();
  if (rememberCurrent && siteMusicIndex >= 0 && siteMusicIndex !== index) siteMusicHistory.push(siteMusicIndex);
  siteMusicIndex = index;
  siteMusicEndFadeStarted = false;
  const fadeFromStart = countdownTracks[index].file === 'have-you-ever-seen-the-rain';
  setAudioLevel(siteMusicAudio, fadeFromStart ? 0 : .34);
  siteMusicProgress.value = '0';
  siteMusicProgress.style.setProperty('--music-progress', '0%');
  siteMusicAudio.src = siteMusicSource(index);
  siteMusicAudio.load();
  updateSiteMusicUI();
  try {
    await siteMusicAudio.play();
    if (fadeFromStart) fadeSiteMusicIn();
    showFooterQuickTrack();
  } catch (error) {}
  updateSiteMusicUI();
}

function prepareSiteMusicFromCountdown(index) {
  if (index < 0 || index >= countdownTracks.length) return;
  if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
  siteMusicAudio.pause();
  siteMusicIndex = index;
  siteMusicEndFadeStarted = false;
  siteMusicQueue = siteMusicQueue.filter((trackIndex) => trackIndex !== index);
  const fadeFromStart = countdownTracks[index].file === 'have-you-ever-seen-the-rain';
  setAudioLevel(siteMusicAudio, fadeFromStart ? 0 : .34);
  setAudioMuted(siteMusicAudio, false);
  siteMusicProgress.value = '0';
  siteMusicProgress.style.setProperty('--music-progress', '0%');
  siteMusicAudio.src = siteMusicSource(index);
  siteMusicAudio.load();
  updateSiteMusicUI();
}

function playNextSiteMusic() {
  playSiteMusic(nextSiteMusicIndex());
}

function playPreviousSiteMusic() {
  if (siteMusicIndex >= 0 && siteMusicAudio.currentTime > 5) {
    playSiteMusic(siteMusicIndex, false);
    return;
  }
  if (!siteMusicHistory.length) {
    if (siteMusicIndex >= 0) playSiteMusic(siteMusicIndex, false);
    return;
  }
  const previousIndex = siteMusicHistory.pop();
  if (siteMusicIndex >= 0) siteMusicQueue.unshift(siteMusicIndex);
  playSiteMusic(previousIndex, false);
}

seasonControl.querySelector('[data-music-action="previous"]').addEventListener('click', playPreviousSiteMusic);
seasonControl.querySelector('[data-music-action="next"]').addEventListener('click', playNextSiteMusic);
footerQuickNext.addEventListener('click', playNextSiteMusic);
siteMusicMute.addEventListener('click', () => {
  setAudioMuted(siteMusicAudio, !isAudioMuted(siteMusicAudio));
  updateSiteMusicUI();
});
siteMusicProgress.addEventListener('input', () => {
  if (!Number.isFinite(siteMusicAudio.duration) || siteMusicAudio.duration <= 0) return;
  if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
  siteMusicFadeFrame = null;
  siteMusicEndFadeStarted = false;
  setAudioLevel(siteMusicAudio, .34);
  siteMusicAudio.currentTime = (Number(siteMusicProgress.value) / 1000) * siteMusicAudio.duration;
});
function toggleSiteMusicPlayback() {
  const reclaimedFromNavyAudio = window.naviesStopNavyAudioForSiteMusic?.() === true;
  if (reclaimedFromNavyAudio) {
    siteMusicInterruptedByNavyAudio = false;
    if (siteMusicFadeFrame !== null) cancelAnimationFrame(siteMusicFadeFrame);
    siteMusicFadeFrame = null;
    if (siteMusicIndex < 0) {
      playNextSiteMusic();
      return;
    }
    ensureAudioGain(siteMusicAudio);
    resumeNaviesAudio();
    setAudioLevel(siteMusicAudio, 0);
    siteMusicAudio.play().then(() => {
      fadeSiteMusicIn(750);
      showFooterQuickTrack();
      updateSiteMusicUI();
    }).catch(() => {
      setAudioLevel(siteMusicAudio, .34);
      updateSiteMusicUI();
    });
    return;
  }
  if (siteMusicIndex < 0) {
    ensureAudioGain(siteMusicAudio);
    resumeNaviesAudio();
    playNextSiteMusic();
    return;
  }
  ensureAudioGain(siteMusicAudio);
  resumeNaviesAudio();
  if (siteMusicAudio.paused) {
    const shouldFadeFromStart = siteMusicIndex >= 0
      && countdownTracks[siteMusicIndex].file === 'have-you-ever-seen-the-rain'
      && siteMusicAudio.currentTime < .35;
    if (shouldFadeFromStart) setAudioLevel(siteMusicAudio, 0);
    siteMusicAudio.play().then(() => {
      if (shouldFadeFromStart) fadeSiteMusicIn();
      showFooterQuickTrack();
      updateSiteMusicUI();
    }).catch(() => {});
  }
  else siteMusicAudio.pause();
  updateSiteMusicUI();
}
siteMusicToggle.addEventListener('click', toggleSiteMusicPlayback);
footerQuickToggle.addEventListener('click', toggleSiteMusicPlayback);
siteMusicAudio.addEventListener('play', updateSiteMusicUI);
siteMusicAudio.addEventListener('pause', updateSiteMusicUI);
siteMusicAudio.addEventListener('timeupdate', () => {
  if (siteMusicIndex < 0) return;
  if (Number.isFinite(siteMusicAudio.duration) && siteMusicAudio.duration > 0) {
    siteMusicProgress.value = String(Math.round((siteMusicAudio.currentTime / siteMusicAudio.duration) * 1000));
    siteMusicProgress.style.setProperty('--music-progress', `${(siteMusicAudio.currentTime / siteMusicAudio.duration) * 100}%`);
  }
  const track = countdownTracks[siteMusicIndex];
  const shouldFade = track.file === 'the-final-countdown' || track.file === 'have-you-ever-seen-the-rain';
  const remaining = siteMusicAudio.duration - siteMusicAudio.currentTime;
  if (shouldFade && Number.isFinite(remaining) && remaining <= 2.1 && remaining > 0 && !siteMusicEndFadeStarted) {
    siteMusicEndFadeStarted = true;
    fadeSiteMusicOut(() => {
      siteMusicAudio.pause();
      playNextSiteMusic();
    });
  }
});
siteMusicAudio.addEventListener('ended', () => {
  if (!siteMusicEndFadeStarted) playNextSiteMusic();
});

function setSeason(season, persist = true) {
  const selected = seasonThemes[season] ? season : 'autumn';
  document.documentElement.dataset.season = selected;
  document.documentElement.style.setProperty('--accent', seasonThemes[selected].color);
  const seasonalIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173c5b"/><circle cx="50" cy="14" r="6" fill="${seasonThemes[selected].color}"/><text x="9" y="42" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="-2">TN</text></svg>`;
  const seasonalFavicon = document.querySelector('#seasonal-favicon');
  const crawlerRequest = /bot|crawler|spider|slurp|bingpreview|google-inspectiontool/i.test(navigator.userAgent);
  if (seasonalFavicon && !crawlerRequest) seasonalFavicon.href = `data:image/svg+xml,${encodeURIComponent(seasonalIcon)}`;
  document.querySelectorAll('.season-option').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.season === selected)));
  if (persist) localStorage.setItem('the-navies-season', selected);
}
window.naviesSetSeason = setSeason;
setSeason(window.__naviesInitialSeason || localStorage.getItem('the-navies-season') || 'autumn', false);
requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));
seasonControl.querySelectorAll('.season-option').forEach((button) => button.addEventListener('click', () => setSeason(button.dataset.season)));
Object.assign(translations.es, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Estamos afinando<br><em>la pantalla.</em>', tvSoonCopy:'Próximamente publicaremos aquí los primeros vídeos de The Navies.' });
Object.assign(translations.ca, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Estem afinant<br><em>la pantalla.</em>', tvSoonCopy:'Aviat publicarem aquí els primers vídeos de The Navies.' });
Object.assign(translations.en, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'We’re tuning<br><em>the screen.</em>', tvSoonCopy:'The first videos from The Navies will be here soon.' });
Object.assign(translations.it, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Stiamo accordando<br><em>lo schermo.</em>', tvSoonCopy:'Presto pubblicheremo qui i primi video dei The Navies.' });
Object.assign(translations.fr, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Nous accordons<br><em>l’écran.</em>', tvSoonCopy:'Les premières vidéos de The Navies seront bientôt disponibles ici.' });
Object.values(translations).forEach((copy) => {
  copy.time = '13:30h';
  copy.countdownEventTime = '13:30';
});

const contactEmails = {
  ca: 'contacte@thenavies.com',
  es: 'contacto@thenavies.com',
  en: 'contact@thenavies.com',
  fr: 'contact@thenavies.com',
  it: 'contatto@thenavies.com'
};
let currentLanguage = 'es';
function closeLanguageMenu() {
  languageTrigger.setAttribute('aria-expanded', 'false');
  languageMenu.hidden = true;
}
const calendarLocales = { ca:'ca-ES', es:'es-ES', en:'en-GB', fr:'fr-FR', it:'it-IT' };
function syncCalendar(language) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const copy = translations[language] || translations.es;
  const locale = calendarLocales[language] || calendarLocales.es;

  document.querySelectorAll('.event-item time[datetime]').forEach((time) => {
    const item = time.closest('.event-item');
    const [year, month, day] = time.dateTime.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);
    item.hidden = eventDate < today;
    item.classList.remove('is-today');

    if (eventDate.getTime() === today.getTime() && !item.classList.contains('concert')) {
      item.classList.add('is-today');
      const formattedDate = new Intl.DateTimeFormat(locale, { day:'numeric', month:'short' })
        .format(eventDate)
        .replace(/\.$/, '');
      time.innerHTML = `<strong>${copy.today}</strong><small>${formattedDate}</small>`;
      return;
    }

    const monthLabel = new Intl.DateTimeFormat(locale, { month:'short' })
      .format(eventDate)
      .replace(/\.$/, '')
      .toUpperCase();
    time.innerHTML = `<strong>${String(day).padStart(2, '0')}</strong><span>${monthLabel}</span>`;
  });
}
function setLanguage(language, persist = false) {
  const copy = translations[language] || translations.es;
  currentLanguage = language;
  localizedSpaceTitle = copy.navSpace || translations.es.navSpace;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { if (copy[element.dataset.i18nHtml]) element.innerHTML = copy[element.dataset.i18nHtml]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { if (copy[element.dataset.i18nAria]) element.setAttribute('aria-label', copy[element.dataset.i18nAria]); });
  const activeOption = languageOptions.find((option) => option.dataset.language === language) || languageOptions[0];
  languageTrigger.querySelector('.flag').className = `flag flag-${language}`;
  languageTrigger.querySelector('strong').textContent = activeOption.querySelector('small').textContent;
  languageOptions.forEach((option) => option.setAttribute('aria-selected', String(option === activeOption)));
  const contactEmail = contactEmails[language] || contactEmails.es;
  const emailLink = document.querySelector('.email-link');
  if (emailLink) {
    emailLink.href = `mailto:${contactEmail}`;
    emailLink.innerHTML = `${contactEmail} <span>↗</span>`;
  }
  if (persist) {
    localStorage.setItem('the-navies-language', language);
    localStorage.setItem('the-navies-language-manual', '1');
  }
  if (document.documentElement.dataset.route === 'espacio-navy') document.title = localizedSpaceTitle;
  setCountdownVolumeLabel();
  updateSiteMusicUI();
  syncCalendar(language);
  if (document.querySelector('#account-dialog')) updateAccountUI();
}
const savedLanguage = localStorage.getItem('the-navies-language');
const hasManualLanguage = localStorage.getItem('the-navies-language-manual') === '1';
const supportedLanguages = Object.keys(translations);
const forcedLanguage = supportedLanguages.includes(window.__naviesForcedLanguage) ? window.__naviesForcedLanguage : null;
const browserLanguage = [navigator.language, ...(navigator.languages || [])]
  .filter(Boolean)
  .map((language) => language.toLowerCase().split('-')[0])
  .find((language) => supportedLanguages.includes(language)) || 'es';
const isSearchCrawler = /bot|crawler|spider|slurp|bingpreview|google-inspectiontool/i.test(navigator.userAgent);
const initialLanguage = forcedLanguage || (hasManualLanguage && savedLanguage && supportedLanguages.includes(savedLanguage)
  ? savedLanguage
  : (isSearchCrawler ? 'es' : browserLanguage));
setLanguage(initialLanguage);
languageTrigger.addEventListener('click', () => {
  const opening = languageTrigger.getAttribute('aria-expanded') !== 'true';
  languageTrigger.setAttribute('aria-expanded', String(opening));
  languageMenu.hidden = !opening;
  if (opening) languageOptions.find((option) => option.getAttribute('aria-selected') === 'true').focus();
});
languageOptions.forEach((option) => option.addEventListener('click', () => {
  const selectedLanguage = option.dataset.language;
  if (forcedLanguage) {
    localStorage.setItem('the-navies-language', selectedLanguage);
    localStorage.setItem('the-navies-language-manual', '1');
    sessionStorage.setItem('the-navies-internal-navigation', '1');
    const destinationHash = document.documentElement.classList.contains('countdown-entry') ? '' : (location.hash || '#inicio');
    location.href = `../${selectedLanguage}/${destinationHash}`;
    return;
  }
  setLanguage(selectedLanguage, true);
  closeLanguageMenu();
  languageTrigger.focus();
}));
document.addEventListener('click', (event) => { if (!languagePicker.contains(event.target)) closeLanguageMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLanguageMenu(); });

const memberDialog = document.querySelector('#member-dialog');
const dialogName = document.querySelector('#dialog-name');
const dialogBio = document.querySelector('#dialog-bio');
const dialogSocial = document.querySelector('#dialog-social');
const memberTitleKeys = { vocals:'visualVocals', bass:'visualBass', guitar:'visualGuitar', keys:'visualKeys', drums:'visualDrums' };
const memberDisplayNames = {
  es:{ vocals:'Aina, Candela y Mariona', bass:'Emma', guitar:'Carles', keys:'Pau Fermosel', drums:'Pau Escobedo' },
  ca:{ vocals:'Aina, Candela i Mariona', bass:'Emma', guitar:'Carles', keys:'Pau Fermosel', drums:'Pau Escobedo' },
  en:{ vocals:'Aina, Candela and Mariona', bass:'Emma', guitar:'Carles', keys:'Pau Fermosel', drums:'Pau Escobedo' },
  it:{ vocals:'Aina, Candela e Mariona', bass:'Emma', guitar:'Carles', keys:'Pau Fermosel', drums:'Pau Escobedo' },
  fr:{ vocals:'Aina, Candela et Mariona', bass:'Emma', guitar:'Carles', keys:'Pau Fermosel', drums:'Pau Escobedo' }
};
const memberDialogBios = {
  es: {
    vocals:'En las <em>voces</em>, Aina, Candela y Mariona comparten melodías, armonías y coros para dar fuerza y emoción a cada canción.',
    bass:'En el <em>bajo</em>, Emma sostiene la base grave y conecta el ritmo con la armonía.',
    guitar:'En la <em>guitarra</em>, Carles aporta riffs, acordes y el carácter rock del repertorio.',
    keys:'En los <em>teclados</em>, Pau Fermosel aporta pianos, sintetizadores y arreglos que amplían el sonido.',
    drums:'En la <em>batería</em>, Pau Escobedo marca el pulso, mueve la energía y mantiene unida a la banda.'
  },
  ca: {
    vocals:'A les <em>veus</em>, Aina, Candela i Mariona comparteixen melodies, harmonies i cors per donar força i emoció a cada cançó.',
    bass:'Al <em>baix</em>, Emma sosté la base greu i connecta el ritme amb l’harmonia.',
    guitar:'A la <em>guitarra</em>, Carles aporta riffs, acords i el caràcter rock del repertori.',
    keys:'Als <em>teclats</em>, Pau Fermosel aporta pianos, sintetitzadors i arranjaments que amplien el so.',
    drums:'A la <em>bateria</em>, Pau Escobedo marca el pols, mou l’energia i manté unida la banda.'
  },
  en: {
    vocals:'On <em>vocals</em>, Aina, Candela and Mariona share melodies, harmonies and choruses to bring power and emotion to every song.',
    bass:'On <em>bass</em>, Emma anchors the low end and connects rhythm with harmony.',
    guitar:'On <em>guitar</em>, Carles brings riffs, chords and the rock character of the set.',
    keys:'On <em>keyboards</em>, Pau Fermosel adds piano, synthesisers and arrangements that expand the sound.',
    drums:'On <em>drums</em>, Pau Escobedo sets the pulse, drives the energy and holds the band together.'
  },
  it: {
    vocals:'Alle <em>voci</em>, Aina, Candela e Mariona condividono melodie, armonie e cori per dare forza ed emozione a ogni brano.',
    bass:'Al <em>basso</em>, Emma sostiene le frequenze basse e collega ritmo e armonia.',
    guitar:'Alla <em>chitarra</em>, Carles porta riff, accordi e il carattere rock del repertorio.',
    keys:'Alle <em>tastiere</em>, Pau Fermosel aggiunge pianoforti, sintetizzatori e arrangiamenti che ampliano il suono.',
    drums:'Alla <em>batteria</em>, Pau Escobedo segna il ritmo, muove l’energia e tiene unita la band.'
  },
  fr: {
    vocals:'Aux <em>voix</em>, Aina, Candela et Mariona partagent mélodies, harmonies et chœurs pour donner force et émotion à chaque morceau.',
    bass:'À la <em>basse</em>, Emma soutient les graves et relie le rythme à l’harmonie.',
    guitar:'À la <em>guitare</em>, Carles apporte riffs, accords et le caractère rock du répertoire.',
    keys:'Aux <em>claviers</em>, Pau Fermosel ajoute pianos, synthétiseurs et arrangements pour élargir le son.',
    drums:'À la <em>batterie</em>, Pau Escobedo donne le rythme, porte l’énergie et maintient le groupe uni.'
  }
};
function openMember(member) {
  const displayNames = memberDisplayNames[currentLanguage] || memberDisplayNames.es;
  const editableTitle = currentLanguage === 'es' ? window.naviesEditableMemberTitles?.[member] : '';
  dialogName.textContent = editableTitle || displayNames[member] || (translations[currentLanguage] || translations.es)[memberTitleKeys[member]];
  const editableBio = currentLanguage === 'es' ? window.naviesEditableMemberBios?.[member] : '';
  dialogBio.innerHTML = editableBio || (memberDialogBios[currentLanguage] || memberDialogBios.es)[member];
  memberDialog.querySelectorAll('.dialog-social-extra').forEach((link) => link.remove());
  const editableSocials = currentLanguage === 'es' ? window.naviesEditableMemberSocials?.[member] : null;
  if (editableSocials?.length) {
    const [first, ...rest] = editableSocials;
    dialogSocial.href = first.url;
    dialogSocial.textContent = `${first.label || 'Enlace'} ↗`;
    dialogSocial.hidden = false;
    let anchor = dialogSocial;
    rest.forEach((social) => {
      const link = dialogSocial.cloneNode();
      link.id = '';
      link.classList.add('dialog-social-extra');
      link.href = social.url;
      link.textContent = `${social.label || 'Enlace'} ↗`;
      link.hidden = false;
      anchor.after(link);
      anchor = link;
    });
  } else {
    dialogSocial.hidden = member !== 'drums';
  }
  memberDialog.showModal();
}
document.querySelectorAll('[data-member]').forEach((card) => {
  card.addEventListener('click', () => openMember(card.dataset.member));
  card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openMember(card.dataset.member); } });
});
if (memberDialog) {
  document.querySelector('.dialog-close').addEventListener('click', () => memberDialog.close());
  memberDialog.addEventListener('click', (event) => { if (event.target === memberDialog) memberDialog.close(); });
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const details = [
    `Nombre: ${data.get('name')}`,
    `Apellidos: ${data.get('surname')}`,
    `Correo: ${data.get('email')}`,
    data.get('phone') ? `Teléfono: ${data.get('phonePrefix')} ${data.get('phone')}` : '',
    '',
    `Mensaje:\n${data.get('message')}`,
    ''
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
  const subject = `Contacto desde la web — ${data.get('name')}`;
  const recipient = contactEmails[currentLanguage] || contactEmails.es;
  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
});

const mobileReveal = window.matchMedia('(max-width: 900px)').matches;
revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: mobileReveal ? 0.04 : 0.12,
  rootMargin: mobileReveal ? '0px 0px -3% 0px' : '0px'
});

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
document.querySelectorAll('.footer-year').forEach((element) => { element.textContent = new Date().getFullYear(); });

const navyMembers = ['pauescobedo', 'marionaescobedo', 'paufermosel', 'candelagonzalez', 'carlesgonzalez', 'ainasalmeron', 'emmatuabu'];
const navyMemberNames = {
  pauescobedo: 'Pau',
  marionaescobedo: 'Mariona',
  paufermosel: 'Fermito',
  candelagonzalez: 'Candela',
  carlesgonzalez: 'Carles',
  ainasalmeron: 'Aina',
  emmatuabu: 'Emma'
};
const accountDialog = document.createElement('dialog');
accountDialog.className = 'account-dialog';
accountDialog.id = 'account-dialog';
accountDialog.innerHTML = `
  <button class="account-close" type="button" aria-label="Cerrar">×</button>
  <div class="account-login-view">
    <p class="eyebrow"><span></span> ESPACIO NAVY</p>
    <h2>Acceso de miembros</h2>
    <p>Introduce tus credenciales para acceder al espacio interno de la banda.</p>
    <form class="account-login-form">
      <label><span>Usuario</span><input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
      <label><span>Contraseña</span><input name="password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required></label>
      <button type="submit">Entrar</button>
    </form>
    <p class="account-error" aria-live="polite"></p>
  </div>
  <div class="account-member-view" hidden>
    <span class="account-member-icon" aria-hidden="true"></span>
    <p class="account-session-status">Sesión iniciada</p>
    <h2 class="account-member-greeting"></h2>
    <button class="account-logout" type="button">Cerrar sesión</button>
    <section class="account-admin-panel" hidden>
      <div class="account-admin-login">
        <p class="account-admin-kicker">VERIFICACIÓN</p>
        <h3>Modo administración</h3>
        <p>Introduce el código de seis dígitos de Google Authenticator.</p>
        <form class="account-admin-form">
          <input name="code" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="6" placeholder="000000" aria-label="Código de verificación" required>
          <button type="submit">Verificar código</button>
        </form>
        <p class="account-admin-error" aria-live="polite"></p>
      </div>
      <div class="account-admin-session" hidden>
        <span class="account-admin-state"><i aria-hidden="true"></i> Administración activa</span>
        <strong class="account-admin-time">10:00</strong>
        <small>Tiempo restante</small>
        <button class="account-admin-extend" type="button" hidden>Extender 10 minutos</button>
        <button class="account-admin-end" type="button">Salir del modo administración</button>
      </div>
    </section>
  </div>`;
document.body.append(accountDialog);
const authToast = document.createElement('div');
authToast.className = 'auth-toast';
authToast.setAttribute('role', 'status');
authToast.setAttribute('aria-live', 'polite');
authToast.setAttribute('popover', 'manual');
authToast.innerHTML = '<span class="auth-toast-indicator" aria-hidden="true"></span><span class="auth-toast-message"></span>';
document.body.append(authToast);
const authToastMessage = authToast.querySelector('.auth-toast-message');
let authToastTimer;
let authToastHideTimer;
let accountCloseTimer;

function showAuthToast(message, state = 'active', host = document.body) {
  clearTimeout(authToastTimer);
  clearTimeout(authToastHideTimer);
  authToast.classList.remove('visible');
  if (authToast.parentNode !== host) {
    if (typeof authToast.hidePopover === 'function' && authToast.matches(':popover-open')) authToast.hidePopover();
    host.append(authToast);
  }
  authToastMessage.textContent = message;
  authToast.classList.toggle('is-closed', state === 'closed');
  if (typeof authToast.showPopover === 'function' && !authToast.matches(':popover-open')) authToast.showPopover();
  void authToast.offsetWidth;
  requestAnimationFrame(() => authToast.classList.add('visible'));
  authToastTimer = setTimeout(() => {
    authToast.classList.remove('visible');
    authToastHideTimer = setTimeout(() => {
      if (typeof authToast.hidePopover === 'function' && authToast.matches(':popover-open')) authToast.hidePopover();
    }, 360);
  }, 2200);
}

function validNavyMember() {
  const member = localStorage.getItem('navies-member-session');
  return navyMembers.includes(member) ? member : null;
}

function updateAccountTriggers(member = validNavyMember(), animate = false) {
  document.querySelectorAll('.account-trigger').forEach((trigger) => {
    const guest = trigger.querySelector('.account-guest');
    const avatar = trigger.querySelector('.account-avatar');
    guest.hidden = Boolean(member);
    avatar.hidden = !member;
    avatar.textContent = member ? member.charAt(0).toUpperCase() : '';
    trigger.setAttribute('aria-label', member ? `Cuenta de ${navyMemberNames[member]}` : 'Iniciar sesión');
    if (member && animate) {
      avatar.classList.remove('account-avatar-entering');
      void avatar.offsetWidth;
      avatar.classList.add('account-avatar-entering');
    } else if (!member && animate) {
      guest.classList.remove('account-guest-entering');
      void guest.offsetWidth;
      guest.classList.add('account-guest-entering');
    }
  });
}

function updateAccountUI() {
  const member = validNavyMember();
  updateAccountTriggers(member);
  accountDialog.querySelector('.account-login-view').hidden = Boolean(member);
  accountDialog.querySelector('.account-member-view').hidden = !member;
  const copy = translations[currentLanguage] || translations.es;
  accountDialog.querySelector('.account-session-status').textContent = copy.sessionActive || translations.es.sessionActive;
  accountDialog.querySelector('.account-logout').textContent = copy.signOut || translations.es.signOut;
  const adminPanel = accountDialog.querySelector('.account-admin-panel');
  adminPanel.hidden = member !== 'pauescobedo';
  accountDialog.querySelector('.account-member-greeting').textContent = member ? `${copy.hello || translations.es.hello}, ${navyMemberNames[member]}.` : '';
  accountDialog.querySelector('.account-member-icon').textContent = member ? member.charAt(0).toUpperCase() : '';
}

function openAccountDialog() {
  clearTimeout(accountCloseTimer);
  accountDialog.classList.remove('is-visible');
  if (!accountDialog.open) accountDialog.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => accountDialog.classList.add('is-visible')));
}

function closeAccountDialog() {
  if (!accountDialog.open) return;
  clearTimeout(accountCloseTimer);
  accountDialog.classList.remove('is-visible');
  accountCloseTimer = setTimeout(() => accountDialog.close(), 300);
}

function animateMemberView() {
  const memberView = accountDialog.querySelector('.account-member-view');
  memberView.classList.remove('member-entering');
  void memberView.offsetWidth;
  memberView.classList.add('member-entering');
}

window.naviesLogin = (username, password, { openMemberPanel = false } = {}) => {
  const member = String(username).trim().toLowerCase();
  if (!navyMembers.includes(member) || password !== 'navies2026') return false;
  localStorage.setItem('navies-member-session', member);
  updateAccountTriggers(member, true);
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member } }));
  const copy = translations[currentLanguage] || translations.es;
  const finishLoginPresentation = () => {
    updateAccountUI();
    if (openMemberPanel) {
      if (!accountDialog.open) openAccountDialog();
      requestAnimationFrame(() => requestAnimationFrame(animateMemberView));
    }
    showAuthToast(copy.sessionActive || translations.es.sessionActive, 'active', openMemberPanel && accountDialog.open ? accountDialog : document.body);
  };
  const loginView = accountDialog.querySelector('.account-login-view');
  if (openMemberPanel && accountDialog.open && !loginView.hidden) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panelSwitchDuration = reducedMotion ? 20 : 300;
    accountDialog.classList.add('switching-view');
    accountDialog.classList.remove('is-visible');
    setTimeout(() => {
      if (!accountDialog.open) {
        accountDialog.classList.remove('switching-view');
        updateAccountUI();
        showAuthToast(copy.sessionActive || translations.es.sessionActive);
        return;
      }
      updateAccountUI();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        accountDialog.classList.add('is-visible');
        accountDialog.classList.remove('switching-view');
        animateMemberView();
        showAuthToast(copy.sessionActive || translations.es.sessionActive, 'active', accountDialog);
      }));
    }, panelSwitchDuration);
  } else {
    finishLoginPresentation();
  }
  if (window.matchMedia('(max-width: 900px)').matches) {
    requestAnimationFrame(() => window.scrollTo({ top:0, left:0, behavior:'instant' }));
  }
  return true;
};

window.naviesLogout = () => {
  localStorage.removeItem('navies-member-session');
  updateAccountTriggers(null, true);
  const dialogWasOpen = accountDialog.open;
  closeAccountDialog();
  if (dialogWasOpen) setTimeout(updateAccountUI, 300);
  else updateAccountUI();
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member: null } }));
  const copy = translations[currentLanguage] || translations.es;
  showAuthToast(copy.sessionClosed || translations.es.sessionClosed, 'closed');
};

document.querySelectorAll('.account-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
  updateAccountUI();
  openAccountDialog();
  if (!validNavyMember()) requestAnimationFrame(() => accountDialog.querySelector('input').focus());
}));
accountDialog.querySelector('.account-close').addEventListener('click', closeAccountDialog);
accountDialog.addEventListener('click', (event) => { if (event.target === accountDialog) closeAccountDialog(); });
accountDialog.addEventListener('cancel', (event) => { event.preventDefault(); closeAccountDialog(); });
accountDialog.querySelector('.account-login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const submittedForm = event.currentTarget;
  const data = new FormData(submittedForm);
  const success = window.naviesLogin(data.get('username'), data.get('password'), { openMemberPanel:true });
  accountDialog.querySelector('.account-error').textContent = success ? '' : 'Usuario o contraseña incorrectos.';
  if (success) {
    const resetDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 300;
    setTimeout(() => submittedForm.reset(), resetDelay);
  }
});
accountDialog.querySelector('.account-logout').addEventListener('click', window.naviesLogout);
updateAccountUI();
window.naviesMemberName = (member) => navyMemberNames[member] || member;
