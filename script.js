document.documentElement.classList.add('nav-ready');
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
  navigation.classList.remove('mobile-nav-overlay');
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
const routeDetails = {
  home: { hash:'#inicio', title:'The Navies' },
  'navies-live': { hash:'#navies-live', title:'Navies Live' },
  'espacio-navy': { hash:'#espacio-navy', title:'Espacio Navy' }
};

function routeFromHash() {
  if (location.hash === '#navies-live') return 'navies-live';
  if (location.hash === '#espacio-navy') return 'espacio-navy';
  return 'home';
}

function showPage(route, updateHistory = true) {
  const selectedRoute = routeDetails[route] ? route : 'home';
  const selectedView = pageViews.find((view) => view.dataset.pageView === selectedRoute);
  document.documentElement.dataset.route = selectedRoute;
  pageViews.forEach((view) => { view.hidden = view.dataset.pageView !== selectedRoute; });
  navigation.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === selectedRoute);
  });
  document.body.classList.toggle('route-media', selectedRoute === 'navies-live');
  document.body.classList.toggle('route-space', selectedRoute === 'espacio-navy');
  document.title = routeDetails[selectedRoute].title;
  if (updateHistory) history.pushState({ route:selectedRoute }, '', routeDetails[selectedRoute].hash);
  window.scrollTo({ top:0, left:0, behavior:'instant' });
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('scroll'));
    if (!revealObserver || !selectedView) return;
    const revealElements = selectedView.querySelectorAll('.reveal');
    revealElements.forEach((element) => {
      revealObserver.unobserve(element);
      element.classList.remove('visible');
    });
    void selectedView.offsetHeight;
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
  navigation.querySelectorAll('[data-route]').forEach((item) => item.classList.toggle('active', item === link));
  closeMenu();
  setTimeout(() => showPage(route), window.matchMedia('(max-width: 900px)').matches ? 190 : 0);
}));
document.querySelectorAll('a.brand[data-route]').forEach((brand) => brand.addEventListener('click', (event) => {
  event.preventDefault();
  showPage('home');
}));
window.addEventListener('popstate', () => showPage(routeFromHash(), false));
showPage(routeFromHash(), false);
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

const smoothTouchEnabled = window.matchMedia('(pointer:coarse)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches;
let touchScrollLastY = 0;
let touchScrollLastX = 0;
let touchScrollLastTime = 0;
let touchScrollVelocity = 0;
let touchScrollAxis = null;
let touchScrollFrame = null;

function stopTouchScroll() {
  if (touchScrollFrame !== null) cancelAnimationFrame(touchScrollFrame);
  touchScrollFrame = null;
  touchScrollVelocity = 0;
}

function animateTouchScroll() {
  const scroller = document.scrollingElement;
  const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight);
  const distanceToEdge = touchScrollVelocity > 0 ? maxScroll - scroller.scrollTop : scroller.scrollTop;
  const edgeBrake = distanceToEdge < 180 ? .72 + .28 * Math.max(0, distanceToEdge) / 180 : 1;
  touchScrollVelocity *= .94 * edgeBrake;
  const nextPosition = Math.max(0, Math.min(maxScroll, scroller.scrollTop + touchScrollVelocity * 16));
  scroller.scrollTop = nextPosition;
  if (Math.abs(touchScrollVelocity) > .03 && nextPosition > 0 && nextPosition < maxScroll) touchScrollFrame = requestAnimationFrame(animateTouchScroll);
  else stopTouchScroll();
}

if (smoothTouchEnabled) {
  document.documentElement.classList.add('smooth-touch');
  window.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1 || document.querySelector('dialog[open]') || document.body.classList.contains('menu-open')) return;
    stopTouchScroll();
    touchScrollLastY = event.touches[0].clientY;
    touchScrollLastX = event.touches[0].clientX;
    touchScrollLastTime = performance.now();
    touchScrollVelocity = 0;
    touchScrollAxis = null;
  }, { passive:true });
  window.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 1 || document.querySelector('dialog[open]') || document.body.classList.contains('menu-open')) return;
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const verticalDelta = touchScrollLastY - currentY;
    const horizontalDelta = touchScrollLastX - currentX;
    if (!touchScrollAxis) {
      if (Math.max(Math.abs(verticalDelta), Math.abs(horizontalDelta)) < 3) return;
      touchScrollAxis = Math.abs(verticalDelta) >= Math.abs(horizontalDelta) ? 'vertical' : 'horizontal';
    }
    event.preventDefault();
    if (touchScrollAxis === 'horizontal') return;
    const now = performance.now();
    const elapsed = Math.max(8, now - touchScrollLastTime);
    const scroller = document.scrollingElement;
    const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight);
    const distanceToEdge = verticalDelta > 0 ? maxScroll - scroller.scrollTop : scroller.scrollTop;
    const edgeResistance = distanceToEdge < 110 ? .68 + .32 * Math.max(0, distanceToEdge) / 110 : 1;
    const adjustedDelta = verticalDelta * edgeResistance;
    scroller.scrollTop = Math.max(0, Math.min(maxScroll, scroller.scrollTop + adjustedDelta));
    const instantVelocity = adjustedDelta / elapsed;
    touchScrollVelocity = Math.max(-2.4, Math.min(2.4, touchScrollVelocity * .62 + instantVelocity * .38));
    touchScrollLastY = currentY;
    touchScrollLastX = currentX;
    touchScrollLastTime = now;
  }, { passive:false });
  window.addEventListener('touchend', () => {
    if (touchScrollAxis === 'vertical' && performance.now() - touchScrollLastTime < 80 && Math.abs(touchScrollVelocity) > .035) {
      touchScrollFrame = requestAnimationFrame(animateTouchScroll);
    }
    touchScrollAxis = null;
  }, { passive:true });
  window.addEventListener('touchcancel', () => {
    touchScrollAxis = null;
    stopTouchScroll();
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

Object.assign(translations.es, { navHome:'Inicio', navVideos:'Vídeos', navSpace:'Espacio Navy', signIn:'Iniciar sesión', searchLabel:'Buscar en The Navies', searchHelp:'Prueba con “conciertos”, “banda”, “vídeos” o “contacto”.' });
Object.assign(translations.ca, { navHome:'Inici', navVideos:'Vídeos', navSpace:'Espai Navy', signIn:'Iniciar sessió', searchLabel:'Cerca a The Navies', searchHelp:'Prova amb “concerts”, “banda”, “vídeos” o “contacte”.' });
Object.assign(translations.en, { navHome:'Home', navVideos:'Videos', navSpace:'Navy Space', signIn:'Sign in', searchLabel:'Search The Navies', searchHelp:'Try “concerts”, “band”, “videos” or “contact”.' });
Object.assign(translations.it, { navHome:'Home', navVideos:'Video', navSpace:'Spazio Navy', signIn:'Accedi', searchLabel:'Cerca in The Navies', searchHelp:'Prova “concerti”, “band”, “video” o “contatti”.' });
Object.assign(translations.fr, { navHome:'Accueil', navVideos:'Vidéos', navSpace:'Espace Navy', signIn:'Se connecter', searchLabel:'Rechercher sur The Navies', searchHelp:'Essayez « concerts », « groupe », « vidéos » ou « contact ».' });

Object.assign(translations.es, { videoLabel:'The Navies en pantalla', videoTitle:'El directo,<br><em>también aquí.</em>', videoIntro:'Un espacio para revivir conciertos, ensayos y momentos de la banda. Por ahora verás ejemplos preparados para sustituir por vuestros vídeos.', featuredVideo:'Vídeo destacado · Próximamente', featuredCopy:'Aquí irá el vídeo principal del último concierto de The Navies.', watchVideo:'Ver vídeo', liveVideos:'En directo', nextRecording:'Próxima grabación', behindScenes:'Ensayos & backstage', rehearsalRoom:'Desde la sala de ensayo', howItSounds:'Cómo suena The Navies', betweenSongs:'Entre canciones', videoPlaceholder:'Vídeo provisional. Sustituye esta tarjeta por un enlace de YouTube o un archivo de vídeo cuando esté disponible.', privateArea:'Área privada de la banda', spaceIntro:'Partituras, materiales y conversación interna en un mismo lugar.', demoVersion:'Versión de demostración', memberAccess:'Acceso de miembros', loginCopy:'Introduce tus credenciales para acceder al espacio interno.', enterSpace:'Entrar', memberArea:'Espacio de miembros', hello:'Hola', signOut:'Cerrar sesión', scores:'Partituras', scoresCopy:'Documentos provisionales preparados para enlazar los PDF definitivos.', chatCopy:'Demostración local: estos mensajes solo aparecen en este dispositivo.' });
Object.assign(translations.ca, { videoLabel:'The Navies en pantalla', videoTitle:'El directe,<br><em>també aquí.</em>', videoIntro:'Un espai per reviure concerts, assajos i moments de la banda. De moment hi trobaràs exemples preparats per substituir pels vostres vídeos.', featuredVideo:'Vídeo destacat · Pròximament', featuredCopy:'Aquí hi anirà el vídeo principal de l’últim concert de The Navies.', watchVideo:'Veure vídeo', liveVideos:'En directe', nextRecording:'Pròxima gravació', behindScenes:'Assajos & backstage', rehearsalRoom:'Des de la sala d’assaig', howItSounds:'Com sona The Navies', betweenSongs:'Entre cançons', videoPlaceholder:'Vídeo provisional. Substitueix aquesta targeta per un enllaç de YouTube o un arxiu de vídeo.', privateArea:'Àrea privada de la banda', spaceIntro:'Partitures, materials i conversa interna en un mateix lloc.', demoVersion:'Versió de demostració', memberAccess:'Accés de membres', loginCopy:'Introdueix les credencials per accedir a l’espai intern.', enterSpace:'Entrar', memberArea:'Espai de membres', hello:'Hola', signOut:'Tancar sessió', scores:'Partitures', scoresCopy:'Documents provisionals preparats per enllaçar els PDF definitius.', chatCopy:'Demostració local: aquests missatges només apareixen en aquest dispositiu.' });
Object.assign(translations.en, { videoLabel:'The Navies on screen', videoTitle:'The live show,<br><em>right here too.</em>', videoIntro:'A place to revisit concerts, rehearsals and moments with the band. For now, these are examples ready to be replaced with your videos.', featuredVideo:'Featured video · Coming soon', featuredCopy:'The main video from The Navies’ latest concert will appear here.', watchVideo:'Watch video', liveVideos:'Live', nextRecording:'Next recording', behindScenes:'Rehearsals & backstage', rehearsalRoom:'From the rehearsal room', howItSounds:'How The Navies sounds', betweenSongs:'Between songs', videoPlaceholder:'Placeholder video. Replace this card with a YouTube link or video file when available.', privateArea:'Private band area', spaceIntro:'Scores, resources and internal conversation in one place.', demoVersion:'Demo version', memberAccess:'Member access', loginCopy:'Enter your credentials to access the internal space.', enterSpace:'Enter', memberArea:'Member space', hello:'Hello', signOut:'Sign out', scores:'Scores', scoresCopy:'Placeholder documents ready to link to the final PDFs.', chatCopy:'Local demo: these messages only appear on this device.' });
Object.assign(translations.it, { videoLabel:'The Navies sullo schermo', videoTitle:'Il live,<br><em>anche qui.</em>', videoIntro:'Uno spazio per rivivere concerti, prove e momenti della band. Per ora troverai esempi da sostituire con i vostri video.', featuredVideo:'Video in evidenza · Prossimamente', featuredCopy:'Qui apparirà il video principale dell’ultimo concerto.', watchVideo:'Guarda il video', liveVideos:'Dal vivo', nextRecording:'Prossima registrazione', behindScenes:'Prove & backstage', rehearsalRoom:'Dalla sala prove', howItSounds:'Il suono dei The Navies', betweenSongs:'Tra le canzoni', videoPlaceholder:'Video provvisorio. Sostituisci questa scheda con un link YouTube o un file video.', privateArea:'Area privata della band', spaceIntro:'Spartiti, materiali e conversazione interna in un unico luogo.', demoVersion:'Versione dimostrativa', memberAccess:'Accesso membri', loginCopy:'Inserisci le credenziali per accedere allo spazio interno.', enterSpace:'Entra', memberArea:'Spazio membri', hello:'Ciao', signOut:'Esci', scores:'Spartiti', scoresCopy:'Documenti provvisori pronti per collegare i PDF definitivi.', chatCopy:'Demo locale: questi messaggi appaiono solo su questo dispositivo.' });
Object.assign(translations.fr, { videoLabel:'The Navies à l’écran', videoTitle:'Le live,<br><em>aussi ici.</em>', videoIntro:'Un espace pour revivre concerts, répétitions et moments du groupe. Pour l’instant, vous trouverez des exemples à remplacer par vos vidéos.', featuredVideo:'Vidéo à la une · Prochainement', featuredCopy:'La vidéo principale du dernier concert apparaîtra ici.', watchVideo:'Voir la vidéo', liveVideos:'En concert', nextRecording:'Prochain enregistrement', behindScenes:'Répétitions & coulisses', rehearsalRoom:'Depuis la salle de répétition', howItSounds:'Le son de The Navies', betweenSongs:'Entre les chansons', videoPlaceholder:'Vidéo provisoire. Remplacez cette carte par un lien YouTube ou un fichier vidéo.', privateArea:'Espace privé du groupe', spaceIntro:'Partitions, ressources et conversation interne au même endroit.', demoVersion:'Version de démonstration', memberAccess:'Accès membres', loginCopy:'Saisissez vos identifiants pour accéder à l’espace interne.', enterSpace:'Entrer', memberArea:'Espace membres', hello:'Bonjour', signOut:'Se déconnecter', scores:'Partitions', scoresCopy:'Documents provisoires prêts à accueillir les PDF définitifs.', chatCopy:'Démo locale : ces messages apparaissent uniquement sur cet appareil.' });

Object.assign(translations.es, { spaceIntro:'Partituras, repertorios y fechas importantes organizados en un mismo lugar.', concertScoresCopy:'Partituras y materiales organizados según el repertorio del concierto.', importantDates:'Fechas importantes', calendarCopy:'Ensayos y actuaciones previstas para preparar Festes de La Sagrera.', rehearsal:'Ensayo', rehearsalTime:'17:30h', dressRehearsal:'Ensayo General', today:'Hoy', generalScore:'General', lyrics:'Letra', chords:'Acordes', keyboard:'Teclado' });
Object.assign(translations.ca, { spaceIntro:'Partitures, repertoris i dates importants organitzats en un mateix lloc.', concertScoresCopy:'Partitures i materials organitzats segons el repertori del concert.', importantDates:'Dates importants', calendarCopy:'Assajos i actuacions previstes per preparar Festes de La Sagrera.', rehearsal:'Assaig', rehearsalTime:'17:30h', dressRehearsal:'Assaig General', today:'Avui', generalScore:'General', lyrics:'Lletra', chords:'Acords', keyboard:'Teclat' });
Object.assign(translations.en, { spaceIntro:'Scores, setlists and important dates organised in one place.', concertScoresCopy:'Scores and materials organised around the concert setlist.', importantDates:'Important dates', calendarCopy:'Rehearsals and performances scheduled for Festes de La Sagrera.', rehearsal:'Rehearsal', rehearsalTime:'17:30h', dressRehearsal:'Dress Rehearsal', today:'Today', generalScore:'Full score', lyrics:'Lyrics', chords:'Chords', keyboard:'Keys' });
Object.assign(translations.it, { spaceIntro:'Spartiti, repertori e date importanti organizzati in un unico luogo.', concertScoresCopy:'Spartiti e materiali organizzati secondo il repertorio del concerto.', importantDates:'Date importanti', calendarCopy:'Prove ed esibizioni previste per preparare Festes de La Sagrera.', rehearsal:'Prova', rehearsalTime:'17:30h', dressRehearsal:'Prova Generale', today:'Oggi', generalScore:'Partitura generale', lyrics:'Testo', chords:'Accordi', keyboard:'Tastiere' });
Object.assign(translations.fr, { spaceIntro:'Partitions, répertoires et dates importantes réunis au même endroit.', concertScoresCopy:'Partitions et ressources organisées selon le programme du concert.', importantDates:'Dates importantes', calendarCopy:'Répétitions et concerts prévus pour préparer Festes de La Sagrera.', rehearsal:'Répétition', rehearsalTime:'17:30h', dressRehearsal:'Répétition Générale', today:'Aujourd’hui', generalScore:'Partition générale', lyrics:'Paroles', chords:'Accords', keyboard:'Clavier' });

Object.assign(translations.es, { sagreraFestName:'Fiestas de La Sagrera 2026', calendarCopy:'Ensayos y actuaciones previstas para preparar las Fiestas de La Sagrera.' });
Object.assign(translations.ca, { sagreraFestName:'Festes de La Sagrera 2026', calendarCopy:'Assajos i actuacions previstes per preparar les Festes de La Sagrera.' });
Object.assign(translations.en, { sagreraFestName:'La Sagrera Neighbourhood Festival 2026', calendarCopy:'Rehearsals and performances scheduled for the La Sagrera neighbourhood festival.' });
Object.assign(translations.it, { sagreraFestName:'Festa di quartiere de La Sagrera 2026', calendarCopy:'Prove ed esibizioni previste per la festa di quartiere de La Sagrera.' });
Object.assign(translations.fr, { sagreraFestName:'Fête de quartier de La Sagrera 2026', calendarCopy:'Répétitions et concerts prévus pour la fête de quartier de La Sagrera.' });

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
memberBios.it = memberBios.en;
memberBios.fr = memberBios.en;
Object.assign(memberBios.es, {
  vocals:['Tres voces','The Navies cuenta con tres cantantes. Juntas reparten melodías, armonías y coros para dar variedad, fuerza y emoción a cada canción.'], bass:['Bajo','Una bajista sostiene la base grave del grupo y conecta la batería con la armonía para que cada tema avance con solidez.'], guitar:['Guitarra','Un guitarrista aporta riffs, acordes, texturas y ese punto de carácter rock que atraviesa el repertorio.'], keys:['Teclados','Un teclista amplía el sonido con pianos, sintetizadores y arreglos que completan cada canción sin perder su esencia.'], drums:['Batería','Pau Escobedo marca el pulso desde la batería, dirige la energía y mantiene unidos a los siete músicos durante todo el directo.']
});
Object.assign(memberBios.ca, {
  vocals:['Tres veus','The Navies compta amb tres cantants. Juntes reparteixen melodies, harmonies i cors per donar varietat, força i emoció a cada cançó.'], bass:['Baix','Una baixista sosté la base greu del grup i connecta la bateria amb l’harmonia perquè cada tema avanci amb solidesa.'], guitar:['Guitarra','Un guitarrista aporta riffs, acords, textures i el punt de caràcter rock que travessa el repertori.'], keys:['Teclats','Un teclista amplia el so amb pianos, sintetitzadors i arranjaments que completen cada cançó.'], drums:['Bateria','En Pau Escobedo marca el pols des de la bateria, dirigeix l’energia i manté units els set músics durant tot el directe.']
});
Object.assign(memberBios.en, {
  vocals:['Three voices','The Navies has three singers sharing melodies, harmonies and choruses to bring variety, power and emotion to every song.'], bass:['Bass','One bassist anchors the low end and connects drums and harmony, giving every song a solid foundation.'], guitar:['Guitar','One guitarist brings riffs, chords, texture and the rock character running through the set.'], keys:['Keys','One keyboardist expands the sound with piano, synthesisers and arrangements that complete each song.'], drums:['Drums','Pau Escobedo sets the pulse from the drums, drives the energy and keeps all seven musicians together throughout the show.']
});
memberBios.it = memberBios.en;
memberBios.fr = memberBios.en;

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
Object.assign(translations.es, { groupVocals:'Tres cantantes', groupVocalsCopy:'Tres voces para melodías, armonías y coros.', groupBass:'Una bajista', groupBassCopy:'La base grave que une ritmo y armonía.', groupGuitar:'Un guitarrista', groupGuitarCopy:'Riffs, acordes y el carácter rock del grupo.', groupKeys:'Un teclista', groupKeysCopy:'Pianos, sintetizadores y capas de sonido.', groupDrums:'Un batería', groupDrumsCopy:'El pulso que sostiene y empuja todo el directo.', provisionalBio:'Así se completa el sonido de The Navies.' });
Object.assign(translations.ca, { groupVocals:'Tres cantants', groupVocalsCopy:'Tres veus per a melodies, harmonies i cors.', groupBass:'Una baixista', groupBassCopy:'La base greu que uneix ritme i harmonia.', groupGuitar:'Un guitarrista', groupGuitarCopy:'Riffs, acords i el caràcter rock del grup.', groupKeys:'Un teclista', groupKeysCopy:'Pianos, sintetitzadors i capes de so.', groupDrums:'Un bateria', groupDrumsCopy:'El pols que sosté i impulsa tot el directe.', provisionalBio:'Així es completa el so de The Navies.' });
Object.assign(translations.en, { groupVocals:'Three singers', groupVocalsCopy:'Three voices for melodies, harmonies and choruses.', groupBass:'One bassist', groupBassCopy:'The low-end foundation joining rhythm and harmony.', groupGuitar:'One guitarist', groupGuitarCopy:'Riffs, chords and the band’s rock character.', groupKeys:'One keyboardist', groupKeysCopy:'Pianos, synthesisers and layers of sound.', groupDrums:'One drummer', groupDrumsCopy:'The pulse driving the whole live show.', provisionalBio:'This is how The Navies completes its sound.' });
Object.assign(translations.it, { groupVocals:'Tre cantanti', groupVocalsCopy:'Tre voci per melodie, armonie e cori.', groupBass:'Una bassista', groupBassCopy:'La base grave che unisce ritmo e armonia.', groupGuitar:'Un chitarrista', groupGuitarCopy:'Riff, accordi e il carattere rock della band.', groupKeys:'Un tastierista', groupKeysCopy:'Pianoforti, sintetizzatori e strati sonori.', groupDrums:'Un batterista', groupDrumsCopy:'Il ritmo che sostiene e spinge tutto il live.', provisionalBio:'Così si completa il suono dei The Navies.' });
Object.assign(translations.fr, { groupVocals:'Trois chanteuses', groupVocalsCopy:'Trois voix pour les mélodies, harmonies et chœurs.', groupBass:'Une bassiste', groupBassCopy:'La base grave qui relie rythme et harmonie.', groupGuitar:'Un guitariste', groupGuitarCopy:'Des riffs, des accords et le caractère rock du groupe.', groupKeys:'Un claviériste', groupKeysCopy:'Pianos, synthétiseurs et textures sonores.', groupDrums:'Un batteur', groupDrumsCopy:'Le rythme qui porte tout le concert.', provisionalBio:'Ainsi se construit le son de The Navies.' });

Object.assign(translations.es, { rightsReserved:'Todos los derechos reservados', collaboration:'Con la colaboración de' });
Object.assign(translations.ca, { rightsReserved:'Tots els drets reservats', collaboration:'Amb la col·laboració de' });
Object.assign(translations.en, { rightsReserved:'All rights reserved', collaboration:'In collaboration with' });
Object.assign(translations.it, { rightsReserved:'Tutti i diritti riservati', collaboration:'In collaborazione con' });
Object.assign(translations.fr, { rightsReserved:'Tous droits réservés', collaboration:'En collaboration avec' });
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
const seasonControl = document.createElement('div');
seasonControl.className = 'season-control';
seasonControl.innerHTML = `
  <div class="season-options" role="group" aria-label="Tema estacional">
    ${Object.entries(seasonThemes).map(([season, theme]) => `<button class="season-option" type="button" data-season="${season}" aria-pressed="false"><span class="season-icon" aria-hidden="true">${theme.icon}</span><span data-i18n="${season}">${season}</span></button>`).join('')}
  </div>`;
siteFooter.prepend(seasonControl);

function setSeason(season, persist = true) {
  const selected = seasonThemes[season] ? season : 'autumn';
  document.documentElement.dataset.season = selected;
  document.documentElement.style.setProperty('--accent', seasonThemes[selected].color);
  const seasonalIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173c5b"/><circle cx="50" cy="14" r="6" fill="${seasonThemes[selected].color}"/><text x="9" y="42" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="-2">TN</text></svg>`;
  document.querySelector('link[rel="icon"]').href = `data:image/svg+xml,${encodeURIComponent(seasonalIcon)}`;
  document.querySelectorAll('.season-option').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.season === selected)));
  if (persist) localStorage.setItem('the-navies-season', selected);
}
setSeason(window.__naviesInitialSeason || localStorage.getItem('the-navies-season') || 'autumn', false);
requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));
seasonControl.querySelectorAll('.season-option').forEach((button) => button.addEventListener('click', () => setSeason(button.dataset.season)));
Object.assign(translations.es, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Estamos afinando<br><em>la pantalla.</em>', tvSoonCopy:'Próximamente publicaremos aquí los primeros vídeos de The Navies.' });
Object.assign(translations.ca, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Estem afinant<br><em>la pantalla.</em>', tvSoonCopy:'Aviat publicarem aquí els primers vídeos de The Navies.' });
Object.assign(translations.en, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'We’re tuning<br><em>the screen.</em>', tvSoonCopy:'The first videos from The Navies will be here soon.' });
Object.assign(translations.it, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Stiamo accordando<br><em>lo schermo.</em>', tvSoonCopy:'Presto pubblicheremo qui i primi video dei The Navies.' });
Object.assign(translations.fr, { navVideos:'Navies Live', time:'13:00h', tvSoonTitle:'Nous accordons<br><em>l’écran.</em>', tvSoonCopy:'Les premières vidéos de The Navies seront bientôt disponibles ici.' });

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
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { if (copy[element.dataset.i18nHtml]) element.innerHTML = copy[element.dataset.i18nHtml]; });
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
  syncCalendar(language);
  if (document.querySelector('#account-dialog')) updateAccountUI();
}
const savedLanguage = localStorage.getItem('the-navies-language');
const hasManualLanguage = localStorage.getItem('the-navies-language-manual') === '1';
const supportedLanguages = Object.keys(translations);
const browserLanguage = [navigator.language, ...(navigator.languages || [])]
  .filter(Boolean)
  .map((language) => language.toLowerCase().split('-')[0])
  .find((language) => supportedLanguages.includes(language)) || 'es';
setLanguage(hasManualLanguage && savedLanguage && supportedLanguages.includes(savedLanguage) ? savedLanguage : browserLanguage);
languageTrigger.addEventListener('click', () => {
  const opening = languageTrigger.getAttribute('aria-expanded') !== 'true';
  languageTrigger.setAttribute('aria-expanded', String(opening));
  languageMenu.hidden = !opening;
  if (opening) languageOptions.find((option) => option.getAttribute('aria-selected') === 'true').focus();
});
languageOptions.forEach((option) => option.addEventListener('click', () => {
  setLanguage(option.dataset.language, true);
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
function openMember(member) {
  const profile = (memberBios[currentLanguage] || memberBios.es)[member];
  dialogName.textContent = (translations[currentLanguage] || translations.es)[memberTitleKeys[member]];
  dialogBio.textContent = profile[1];
  dialogSocial.hidden = member !== 'drums';
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

revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
document.querySelectorAll('.footer-year').forEach((element) => { element.textContent = new Date().getFullYear(); });

const navyMembers = ['pauescobedo', 'marionaescobedo', 'paufermosel', 'candelagonzalez', 'carlesgonzalez', 'ainasalmeron'];
const navyMemberNames = {
  pauescobedo: 'Pau',
  marionaescobedo: 'Mariona',
  paufermosel: 'Fermito',
  candelagonzalez: 'Candela',
  carlesgonzalez: 'Carles',
  ainasalmeron: 'Aina'
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
  </div>`;
document.body.append(accountDialog);
const authToast = document.createElement('div');
authToast.className = 'auth-toast';
authToast.setAttribute('role', 'status');
authToast.setAttribute('aria-live', 'polite');
document.body.append(authToast);
let authToastTimer;
let accountCloseTimer;

function showAuthToast(message) {
  clearTimeout(authToastTimer);
  authToast.textContent = message;
  authToast.classList.add('visible');
  authToastTimer = setTimeout(() => authToast.classList.remove('visible'), 2200);
}

function validNavyMember() {
  const member = localStorage.getItem('navies-member-session');
  return navyMembers.includes(member) ? member : null;
}

function updateAccountUI() {
  const member = validNavyMember();
  document.querySelectorAll('.account-trigger').forEach((trigger) => {
    const guest = trigger.querySelector('.account-guest');
    const avatar = trigger.querySelector('.account-avatar');
    guest.hidden = Boolean(member);
    avatar.hidden = !member;
    avatar.textContent = member ? member.charAt(0).toUpperCase() : '';
    trigger.setAttribute('aria-label', member ? `Cuenta de ${navyMemberNames[member]}` : 'Iniciar sesión');
  });
  accountDialog.querySelector('.account-login-view').hidden = Boolean(member);
  accountDialog.querySelector('.account-member-view').hidden = !member;
  const copy = translations[currentLanguage] || translations.es;
  accountDialog.querySelector('.account-session-status').textContent = copy.sessionActive || translations.es.sessionActive;
  accountDialog.querySelector('.account-logout').textContent = copy.signOut || translations.es.signOut;
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

window.naviesLogin = (username, password) => {
  const member = String(username).trim().toLowerCase();
  if (!navyMembers.includes(member) || password !== 'navies2026') return false;
  localStorage.setItem('navies-member-session', member);
  const dialogWasOpen = accountDialog.open;
  closeAccountDialog();
  if (dialogWasOpen) setTimeout(updateAccountUI, 300);
  else updateAccountUI();
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member } }));
  const copy = translations[currentLanguage] || translations.es;
  showAuthToast(copy.sessionActive || translations.es.sessionActive);
  if (window.matchMedia('(max-width: 900px)').matches) {
    requestAnimationFrame(() => window.scrollTo({ top:0, left:0, behavior:'instant' }));
  }
  return true;
};

window.naviesLogout = () => {
  localStorage.removeItem('navies-member-session');
  const dialogWasOpen = accountDialog.open;
  closeAccountDialog();
  if (dialogWasOpen) setTimeout(updateAccountUI, 300);
  else updateAccountUI();
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member: null } }));
  const copy = translations[currentLanguage] || translations.es;
  showAuthToast(copy.sessionClosed || translations.es.sessionClosed);
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
  const data = new FormData(event.currentTarget);
  const success = window.naviesLogin(data.get('username'), data.get('password'));
  accountDialog.querySelector('.account-error').textContent = success ? '' : 'Usuario o contraseña incorrectos.';
  if (success) event.currentTarget.reset();
});
accountDialog.querySelector('.account-logout').addEventListener('click', window.naviesLogout);
updateAccountUI();
window.naviesMemberName = (member) => navyMemberNames[member] || member;
