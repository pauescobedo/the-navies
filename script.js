const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const siteHeader = document.querySelector('.site-header');
let lastScrollY = window.scrollY;

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  siteHeader.classList.remove('header-hidden');
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const movingDown = currentScrollY > lastScrollY + 6;
  const movingUp = currentScrollY < lastScrollY - 6;
  siteHeader.classList.toggle('header-scrolled', currentScrollY > 20);
  if (currentScrollY < 110 || menuButton.getAttribute('aria-expanded') === 'true') {
    siteHeader.classList.remove('header-hidden');
  } else if (movingDown) {
    siteHeader.classList.add('header-hidden');
  } else if (movingUp) {
    siteHeader.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY;
}, { passive: true });

const translations = {
  es: { navLive:'Directo', navSound:'Sonido', navBand:'La banda', navContact:'Contacto', heroTitle:'Clásicos de siempre.<br><em>En directo, como nunca.</em>', heroIntro:'Siete músicos, tres voces y una banda completa para llevar clásicos del rock y del pop al escenario con energía, elegancia y toda la fuerza del directo.', nextShow:'Próximo concierto', hireBand:'Contrata a la banda', liveLabel:'En directo', liveTitle:'La próxima cita<br>empieza aquí.', comingSoon:'Próximamente', venue:'Plaza Masadas', time:'13:00 h', onlyDate:'Por ahora, esta es nuestra única fecha anunciada.', soundLabel:'Nuestro sonido', soundBody:'Una mezcla de clásicos del rock, grandes canciones pop y esos himnos que todo el mundo reconoce desde el primer acorde. Siete músicos, voces compartidas y un directo pensado para conectar, cantar y disfrutar juntos.', examples:'Ejemplos de repertorio', exampleNote:'Ejemplos orientativos; el repertorio puede variar.', bandTitle:'Siete músicos.<br>Una sola corriente.', bandBody:'Somos siete jóvenes apasionados por la música, unidos por las ganas de tocar, aprender y disfrutar juntos sobre el escenario.', vocals:'Voz', bass:'Bajo', guitar:'Guitarra', keys:'Teclados', drums:'Batería', contactTitle:'Hablemos.', contactBody:'Si quieres contarnos una propuesta o hablar con nosotros, escríbenos.' },
  ca: { navLive:'Directe', navSound:'So', navBand:'La banda', navContact:'Contacte', heroTitle:'Clàssics de sempre.<br><em>En directe, com mai.</em>', heroIntro:'Set músics, tres veus i una banda completa per portar clàssics del rock i del pop a l’escenari amb energia, elegància i tota la força del directe.', nextShow:'Pròxim concert', hireBand:'Contracta la banda', liveLabel:'En directe', liveTitle:'La pròxima cita<br>comença aquí.', comingSoon:'Pròximament', venue:'Plaça Masadas', time:'13:00 h', onlyDate:'De moment, aquesta és l’única data anunciada.', soundLabel:'El nostre so', soundBody:'Una barreja de clàssics del rock, grans cançons pop i aquells himnes que tothom reconeix des del primer acord. Set músics, veus compartides i un directe pensat per connectar, cantar i gaudir junts.', examples:'Exemples de repertori', exampleNote:'Exemples orientatius; el repertori pot variar.', bandTitle:'Set músics.<br>Un sol corrent.', bandBody:'Tres cantants al davant i una banda completa al darrere. The Navies recupera grans cançons respectant-ne l’essència, amb personalitat pròpia i l’energia de set músics tocant junts.', vocals:'Veu', bass:'Baix', guitar:'Guitarra', keys:'Teclats', drums:'Bateria', contactTitle:'Muntem<br>la pròxima?', contactBody:'Concerts, sales, festes de barri, festivals i esdeveniments. Escriu-nos i en parlem.' },
  en: { navLive:'Live', navSound:'Sound', navBand:'The band', navContact:'Contact', heroTitle:'Timeless classics.<br><em>Live like never before.</em>', heroIntro:'Seven musicians, three voices and a full band bringing rock and pop classics to the stage with energy, elegance and the power of a real live show.', nextShow:'Next show', hireBand:'Book the band', liveLabel:'Live', liveTitle:'The next show<br>starts here.', comingSoon:'Coming up', venue:'Plaça Masadas', time:'1:00 pm', onlyDate:'For now, this is our only announced date.', soundLabel:'Our sound', soundBody:'A mix of rock classics, great pop songs and anthems everyone knows from the first chord. Seven musicians, shared vocals and a live show made for connecting, singing and enjoying together.', examples:'Setlist examples', exampleNote:'Illustrative examples; the setlist may vary.', bandTitle:'Seven musicians.<br>One current.', bandBody:'Three singers out front and a full band behind them. The Navies brings great songs back with respect for their essence, a personality of our own and the energy of seven musicians playing together.', vocals:'Vocals', bass:'Bass', guitar:'Guitar', keys:'Keys', drums:'Drums', contactTitle:'Shall we plan<br>the next one?', contactBody:'Concerts, venues, neighbourhood parties, festivals and events. Get in touch and let’s talk.' },
  it: { navLive:'Dal vivo', navSound:'Suono', navBand:'La band', navContact:'Contatti', heroTitle:'Classici senza tempo.<br><em>Dal vivo, come mai prima.</em>', heroIntro:'Sette musicisti, tre voci e una band completa portano sul palco i classici del rock e del pop con energia, eleganza e tutta la forza del live.', nextShow:'Prossimo concerto', hireBand:'Ingaggia la band', liveLabel:'Dal vivo', liveTitle:'Il prossimo appuntamento<br>inizia qui.', comingSoon:'Prossimamente', venue:'Plaça Masadas', time:'13:00', onlyDate:'Per ora, questa è la nostra unica data annunciata.', soundLabel:'Il nostro suono', soundBody:'Un mix di classici del rock, grandi canzoni pop e inni che tutti riconoscono dal primo accordo. Sette musicisti, voci condivise e un live fatto per incontrarsi, cantare e divertirsi insieme.', examples:'Esempi di repertorio', exampleNote:'Esempi indicativi; il repertorio può variare.', bandTitle:'Sette musicisti.<br>Un’unica corrente.', bandBody:'Tre cantanti davanti e una band completa alle spalle. The Navies ripropone grandi canzoni rispettandone l’essenza, con una personalità propria e l’energia di sette musicisti che suonano insieme.', vocals:'Voce', bass:'Basso', guitar:'Chitarra', keys:'Tastiere', drums:'Batteria', contactTitle:'Organizziamo<br>la prossima?', contactBody:'Concerti, locali, feste di quartiere, festival ed eventi. Scrivici e parliamone.' },
  fr: { navLive:'En concert', navSound:'Son', navBand:'Le groupe', navContact:'Contact', heroTitle:'Des classiques intemporels.<br><em>En concert, comme jamais.</em>', heroIntro:'Sept musiciens, trois voix et un groupe complet font vivre les classiques du rock et de la pop avec énergie, élégance et toute la force du direct.', nextShow:'Prochain concert', hireBand:'Programmer le groupe', liveLabel:'En concert', liveTitle:'Le prochain rendez-vous<br>commence ici.', comingSoon:'Prochainement', venue:'Plaça Masadas', time:'13 h', onlyDate:'Pour le moment, c’est notre seule date annoncée.', soundLabel:'Notre son', soundBody:'Un mélange de classiques du rock, de grandes chansons pop et de refrains que tout le monde reconnaît dès le premier accord. Sept musiciens, des voix partagées et un concert pensé pour se retrouver, chanter et profiter ensemble.', examples:'Exemples du répertoire', exampleNote:'Exemples indicatifs ; le répertoire peut varier.', bandTitle:'Sept musiciens.<br>Un seul courant.', bandBody:'Trois chanteuses devant et un groupe complet derrière. The Navies reprend de grandes chansons dans le respect de leur essence, avec sa propre personnalité et l’énergie de sept musiciens réunis.', vocals:'Chant', bass:'Basse', guitar:'Guitare', keys:'Claviers', drums:'Batterie', contactTitle:'On prépare<br>la prochaine?', contactBody:'Concerts, salles, fêtes de quartier, festivals et événements. Écrivez-nous pour en parler.' }
};

Object.assign(translations.es, { genreLine:'Rock · Pop · Clásicos', christmasTitle:'Concierto de Navidad', datePending:'Fecha por confirmar', dateInfo:'Anunciaremos la fecha del concierto de Navidad próximamente.', classicRock:'ROCK CLÁSICO', stadiumRock:'ROCK DE ESTADIO', rockStyle:'Guitarras, raíces y canciones que nunca envejecen', popStyle:'Ritmo, melodía y un estribillo para cantar juntos', anthemStyle:'Teclados, épica y toda la energía del directo', meetMember:'Conócela ↗', meetMemberMale:'Conócelo ↗', memberLabel:'La banda', provisionalBio:'Biografía provisional.' });
Object.assign(translations.ca, { genreLine:'Rock · Pop · Clàssics', christmasTitle:'Concert de Nadal', datePending:'Data per confirmar', dateInfo:'Anunciarem la data del concert de Nadal ben aviat.', classicRock:'ROCK CLÀSSIC', stadiumRock:'ROCK D’ESTADI', rockStyle:'Guitarres, arrels i cançons que mai no envelleixen', popStyle:'Ritme, melodia i una tornada per cantar plegats', anthemStyle:'Teclats, èpica i tota l’energia del directe', meetMember:'Coneix-la ↗', meetMemberMale:'Coneix-lo ↗', memberLabel:'La banda', provisionalBio:'Biografia provisional.' });
Object.assign(translations.en, { genreLine:'Rock · Pop · Classics', christmasTitle:'Christmas Concert', datePending:'Date to be confirmed', dateInfo:'We’ll announce the Christmas concert date soon.', classicRock:'CLASSIC ROCK', stadiumRock:'STADIUM ROCK', rockStyle:'Guitars, roots and songs that never grow old', popStyle:'Rhythm, melody and a chorus made to sing together', anthemStyle:'Keys, drama and the full energy of a live show', meetMember:'Meet her ↗', meetMemberMale:'Meet him ↗', memberLabel:'The band', provisionalBio:'Provisional biography.' });
Object.assign(translations.it, { genreLine:'Rock · Pop · Classici', christmasTitle:'Concerto di Natale', datePending:'Data da confermare', dateInfo:'Annunceremo presto la data del concerto di Natale.', classicRock:'ROCK CLASSICO', stadiumRock:'STADIUM ROCK', rockStyle:'Chitarre, radici e canzoni che non invecchiano mai', popStyle:'Ritmo, melodia e un ritornello da cantare insieme', anthemStyle:'Tastiere, epica e tutta l’energia del live', meetMember:'Conoscila ↗', meetMemberMale:'Conoscilo ↗', memberLabel:'La band', provisionalBio:'Biografia provvisoria.' });
Object.assign(translations.fr, { genreLine:'Rock · Pop · Classiques', christmasTitle:'Concert de Noël', datePending:'Date à confirmer', dateInfo:'Nous annoncerons bientôt la date du concert de Noël.', classicRock:'ROCK CLASSIQUE', stadiumRock:'ROCK DE STADE', rockStyle:'Des guitares, des racines et des chansons qui ne vieillissent jamais', popStyle:'Du rythme, de la mélodie et un refrain à chanter ensemble', anthemStyle:'Des claviers, du souffle et toute l’énergie du direct', meetMember:'La découvrir ↗', meetMemberMale:'Le découvrir ↗', memberLabel:'Le groupe', provisionalBio:'Biographie provisoire.' });

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

Object.assign(translations.es, { heroIntro:'Siete músicos compartiendo escenario para llevar clásicos del rock y del pop al directo con energía, personalidad y un sonido propio.', bandBody:'Somos siete jóvenes apasionados por la música, unidos por las ganas de tocar, aprender y disfrutar juntos sobre el escenario. Cada voz y cada instrumento forman parte de The Navies con el mismo peso.', contactLabel:'Contacto', contactTitle:'Hablemos.', contactBody:'Si quieres contarnos una propuesta o hablar con nosotros, escríbenos. Te responderemos lo antes posible.' });
Object.assign(translations.ca, { heroIntro:'Set músics compartint escenari per portar clàssics del rock i del pop al directe amb energia, personalitat i un so propi.', bandBody:'Som set joves apassionats per la música, units per les ganes de tocar, aprendre i gaudir junts sobre l’escenari. Cada veu i cada instrument formen part de The Navies amb el mateix pes.', contactLabel:'Contacte', contactTitle:'Parlem.', contactBody:'Si vols explicar-nos una proposta o parlar amb nosaltres, escriu-nos. Et respondrem tan aviat com sigui possible.' });
Object.assign(translations.en, { heroIntro:'Seven musicians sharing one stage, bringing rock and pop classics to life with energy, personality and a sound of our own.', bandBody:'We are seven young musicians brought together by a passion for music and a desire to play, learn and enjoy the stage together. Every voice and every instrument has an equal place in The Navies.', contactLabel:'Contact', contactTitle:'Let\'s talk.', contactBody:'If you have a proposal or simply want to talk to us, send us a message. We will get back to you as soon as possible.' });
Object.assign(translations.it, { heroIntro:'Sette musicisti sullo stesso palco per portare dal vivo i classici del rock e del pop con energia, personalità e un suono tutto nostro.', bandBody:'Siamo sette giovani appassionati di musica, uniti dalla voglia di suonare, imparare e divertirci insieme sul palco. Ogni voce e ogni strumento hanno lo stesso valore nei The Navies.', contactLabel:'Contatti', contactTitle:'Parliamone.', contactBody:'Se vuoi proporci qualcosa o semplicemente parlare con noi, scrivici. Ti risponderemo il prima possibile.' });
Object.assign(translations.fr, { heroIntro:'Sept musiciens sur une même scène pour faire vivre les classiques du rock et de la pop avec énergie, personnalité et un son bien à nous.', bandBody:'Nous sommes sept jeunes passionnés de musique, réunis par l’envie de jouer, d’apprendre et de partager la scène. Chaque voix et chaque instrument occupent la même place au sein de The Navies.', contactLabel:'Contact', contactTitle:'Parlons-en.', contactBody:'Si vous souhaitez nous faire une proposition ou simplement échanger avec nous, écrivez-nous. Nous vous répondrons dès que possible.' });

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

Object.assign(translations.es, { spaceIntro:'Partituras, repertorios y fechas importantes organizados en un mismo lugar.', concertScoresCopy:'Partituras y materiales organizados según el repertorio del concierto.', importantDates:'Fechas importantes', calendarCopy:'Ensayos y actuaciones previstas para preparar Festes de La Sagrera.', rehearsal:'Ensayo', rehearsalTime:'17:30–18:45', dressRehearsal:'Ensayo general', generalScore:'General', lyrics:'Letra', chords:'Acordes', keyboard:'Teclado' });
Object.assign(translations.ca, { spaceIntro:'Partitures, repertoris i dates importants organitzats en un mateix lloc.', concertScoresCopy:'Partitures i materials organitzats segons el repertori del concert.', importantDates:'Dates importants', calendarCopy:'Assajos i actuacions previstes per preparar Festes de La Sagrera.', rehearsal:'Assaig', rehearsalTime:'17:30–18:45', dressRehearsal:'Assaig general', generalScore:'General', lyrics:'Lletra', chords:'Acords', keyboard:'Teclat' });
Object.assign(translations.en, { spaceIntro:'Scores, setlists and important dates organised in one place.', concertScoresCopy:'Scores and materials organised around the concert setlist.', importantDates:'Important dates', calendarCopy:'Rehearsals and performances scheduled for Festes de La Sagrera.', rehearsal:'Rehearsal', rehearsalTime:'17:30–18:45', dressRehearsal:'Dress rehearsal', generalScore:'Full score', lyrics:'Lyrics', chords:'Chords', keyboard:'Keys' });
Object.assign(translations.it, { spaceIntro:'Spartiti, repertori e date importanti organizzati in un unico luogo.', concertScoresCopy:'Spartiti e materiali organizzati secondo il repertorio del concerto.', importantDates:'Date importanti', calendarCopy:'Prove ed esibizioni previste per preparare Festes de La Sagrera.', rehearsal:'Prova', rehearsalTime:'17:30–18:45', dressRehearsal:'Prova generale', generalScore:'Partitura generale', lyrics:'Testo', chords:'Accordi', keyboard:'Tastiere' });
Object.assign(translations.fr, { spaceIntro:'Partitions, répertoires et dates importantes réunis au même endroit.', concertScoresCopy:'Partitions et ressources organisées selon le programme du concert.', importantDates:'Dates importantes', calendarCopy:'Répétitions et concerts prévus pour préparer Festes de La Sagrera.', rehearsal:'Répétition', rehearsalTime:'17 h 30–18 h 45', dressRehearsal:'Répétition générale', generalScore:'Partition générale', lyrics:'Paroles', chords:'Accords', keyboard:'Clavier' });

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
  vocals:['Tres voces','The Navies cuenta con tres cantantes. Juntas reparten melodías, armonías y coros para dar variedad, fuerza y emoción a cada canción.'], bass:['Bajo','Una bajista sostiene la base grave del grupo y conecta la batería con la armonía para que cada tema avance con solidez.'], guitar:['Guitarra','Un guitarrista aporta riffs, acordes, texturas y ese punto de carácter rock que atraviesa el repertorio.'], keys:['Teclados','Un teclista amplía el sonido con pianos, sintetizadores y arreglos que completan cada canción sin perder su esencia.'], drums:['Batería','Un batería marca el pulso, dirige la energía y mantiene unidos a los siete músicos durante todo el directo.']
});
Object.assign(memberBios.ca, {
  vocals:['Tres veus','The Navies compta amb tres cantants. Juntes reparteixen melodies, harmonies i cors per donar varietat, força i emoció a cada cançó.'], bass:['Baix','Una baixista sosté la base greu del grup i connecta la bateria amb l’harmonia perquè cada tema avanci amb solidesa.'], guitar:['Guitarra','Un guitarrista aporta riffs, acords, textures i el punt de caràcter rock que travessa el repertori.'], keys:['Teclats','Un teclista amplia el so amb pianos, sintetitzadors i arranjaments que completen cada cançó.'], drums:['Bateria','Un bateria marca el pols, dirigeix l’energia i manté units els set músics durant tot el directe.']
});
Object.assign(memberBios.en, {
  vocals:['Three voices','The Navies has three singers sharing melodies, harmonies and choruses to bring variety, power and emotion to every song.'], bass:['Bass','One bassist anchors the low end and connects drums and harmony, giving every song a solid foundation.'], guitar:['Guitar','One guitarist brings riffs, chords, texture and the rock character running through the set.'], keys:['Keys','One keyboardist expands the sound with piano, synthesisers and arrangements that complete each song.'], drums:['Drums','One drummer sets the pulse, drives the energy and keeps all seven musicians together throughout the show.']
});
memberBios.it = memberBios.en;
memberBios.fr = memberBios.en;

const languagePicker = document.querySelector('#language-picker');
const languageTrigger = languagePicker.querySelector('.language-trigger');
const languageMenu = languagePicker.querySelector('.language-menu');
const languageOptions = [...languageMenu.querySelectorAll('[data-language]')];
Object.assign(translations.es, { seasonTitle:'Tema estacional', spring:'Primavera', summer:'Verano', autumn:'Otoño', winter:'Invierno' });
Object.assign(translations.ca, { seasonTitle:'Tema estacional', spring:'Primavera', summer:'Estiu', autumn:'Tardor', winter:'Hivern' });
Object.assign(translations.en, { seasonTitle:'Seasonal theme', spring:'Spring', summer:'Summer', autumn:'Autumn', winter:'Winter' });
Object.assign(translations.it, { seasonTitle:'Tema stagionale', spring:'Primavera', summer:'Estate', autumn:'Autunno', winter:'Inverno' });
Object.assign(translations.fr, { seasonTitle:'Thème saisonnier', spring:'Printemps', summer:'Été', autumn:'Automne', winter:'Hiver' });
Object.assign(translations.es, { visualVocals:'Voces', visualBass:'Bajo', visualGuitar:'Guitarra', visualKeys:'Teclados', visualDrums:'Batería', sessionActive:'Sesión iniciada' });
Object.assign(translations.ca, { visualVocals:'Veus', visualBass:'Baix', visualGuitar:'Guitarra', visualKeys:'Teclats', visualDrums:'Bateria', sessionActive:'Sessió iniciada' });
Object.assign(translations.en, { visualVocals:'Vocals', visualBass:'Bass', visualGuitar:'Guitar', visualKeys:'Keyboards', visualDrums:'Drums', sessionActive:'Signed in' });
Object.assign(translations.it, { visualVocals:'Voci', visualBass:'Basso', visualGuitar:'Chitarra', visualKeys:'Tastiere', visualDrums:'Batteria', sessionActive:'Accesso effettuato' });
Object.assign(translations.fr, { visualVocals:'Voix', visualBass:'Basse', visualGuitar:'Guitare', visualKeys:'Claviers', visualDrums:'Batterie', sessionActive:'Session ouverte' });
Object.assign(translations.es, { groupVocals:'3 cantantes', groupVocalsCopy:'Tres voces para melodías, armonías y coros.', groupBass:'1 bajista', groupBassCopy:'La base grave que une ritmo y armonía.', groupGuitar:'1 guitarrista', groupGuitarCopy:'Riffs, acordes y el carácter rock del grupo.', groupKeys:'1 teclista', groupKeysCopy:'Pianos, sintetizadores y capas de sonido.', groupDrums:'1 batería', groupDrumsCopy:'El pulso que sostiene y empuja todo el directo.', provisionalBio:'Así se completa el sonido de The Navies.' });
Object.assign(translations.ca, { groupVocals:'3 cantants', groupVocalsCopy:'Tres veus per a melodies, harmonies i cors.', groupBass:'1 baixista', groupBassCopy:'La base greu que uneix ritme i harmonia.', groupGuitar:'1 guitarrista', groupGuitarCopy:'Riffs, acords i el caràcter rock del grup.', groupKeys:'1 teclista', groupKeysCopy:'Pianos, sintetitzadors i capes de so.', groupDrums:'1 bateria', groupDrumsCopy:'El pols que sosté i impulsa tot el directe.', provisionalBio:'Així es completa el so de The Navies.' });
Object.assign(translations.en, { groupVocals:'3 singers', groupVocalsCopy:'Three voices for melodies, harmonies and choruses.', groupBass:'1 bassist', groupBassCopy:'The low-end foundation joining rhythm and harmony.', groupGuitar:'1 guitarist', groupGuitarCopy:'Riffs, chords and the band’s rock character.', groupKeys:'1 keyboardist', groupKeysCopy:'Pianos, synthesisers and layers of sound.', groupDrums:'1 drummer', groupDrumsCopy:'The pulse driving the whole live show.', provisionalBio:'This is how The Navies completes its sound.' });
Object.assign(translations.it, { groupVocals:'3 cantanti', groupVocalsCopy:'Tre voci per melodie, armonie e cori.', groupBass:'1 bassista', groupBassCopy:'La base grave che unisce ritmo e armonia.', groupGuitar:'1 chitarrista', groupGuitarCopy:'Riff, accordi e il carattere rock della band.', groupKeys:'1 tastierista', groupKeysCopy:'Pianoforti, sintetizzatori e strati sonori.', groupDrums:'1 batterista', groupDrumsCopy:'Il ritmo che sostiene e spinge tutto il live.', provisionalBio:'Così si completa il suono dei The Navies.' });
Object.assign(translations.fr, { groupVocals:'3 chanteuses', groupVocalsCopy:'Trois voix pour les mélodies, harmonies et chœurs.', groupBass:'1 bassiste', groupBassCopy:'La base grave qui relie rythme et harmonie.', groupGuitar:'1 guitariste', groupGuitarCopy:'Des riffs, des accords et le caractère rock du groupe.', groupKeys:'1 claviériste', groupKeysCopy:'Pianos, synthétiseurs et textures sonores.', groupDrums:'1 batteur', groupDrumsCopy:'Le rythme qui porte tout le concert.', provisionalBio:'Ainsi se construit le son de The Navies.' });

const seasonThemes = {
  spring: { color:'#F4A7C1', icon:'<svg viewBox="0 0 24 24"><path d="M12 9.2C9.2 5.6 10.4 2.5 12 2.5s2.8 3.1 0 6.7Zm2.8 2.8c3.6-2.8 6.7-1.6 6.7 0s-3.1 2.8-6.7 0ZM12 14.8c2.8 3.6 1.6 6.7 0 6.7s-2.8-3.1 0-6.7ZM9.2 12c-3.6 2.8-6.7 1.6-6.7 0s3.1-2.8 6.7 0Z"/><circle cx="12" cy="12" r="2.2"/></svg>' },
  summer: { color:'#FFD76A', icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>' },
  autumn: { color:'#C77B52', icon:'<svg viewBox="0 0 24 24"><path d="M19.5 4.5C12 4.7 6.5 8.1 5 15.2c3.7.7 7.2-.2 9.8-2.8 2.3-2.3 3.7-5.2 4.7-7.9Z"/><path d="M4.5 19.5c2.2-4.5 5.6-7.5 10.4-9.2"/></svg>' },
  winter: { color:'#A8DADC', icon:'<svg viewBox="0 0 24 24"><path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9 4l3 3 3-3M9 20l3-3 3 3M4.8 10.2 9 9l-1.2-4.2M19.2 13.8 15 15l1.2 4.2M19.2 10.2 15 9l1.2-4.2M4.8 13.8 9 15l-1.2 4.2"/></svg>' }
};
let siteFooter = document.querySelector('footer');
if (!siteFooter) {
  siteFooter = document.createElement('footer');
  siteFooter.innerHTML = '<a class="brand" href="index.html">THE NAVIES<span>.</span></a><p data-i18n="genreLine">Rock · Pop · Clásicos</p><p>© <span class="footer-year"></span> The Navies</p>';
  document.body.append(siteFooter);
}
const seasonControl = document.createElement('div');
seasonControl.className = 'season-control';
seasonControl.innerHTML = `
  <p class="season-control-label" data-i18n="seasonTitle">Tema estacional</p>
  <div class="season-options" role="group" aria-label="Tema estacional">
    ${Object.entries(seasonThemes).map(([season, theme]) => `<button class="season-option" type="button" data-season="${season}" aria-pressed="false"><span class="season-icon" aria-hidden="true">${theme.icon}</span><span data-i18n="${season}">${season}</span></button>`).join('')}
  </div>`;
siteFooter.prepend(seasonControl);

function setSeason(season, persist = true) {
  const selected = seasonThemes[season] ? season : 'autumn';
  document.documentElement.dataset.season = selected;
  document.documentElement.style.setProperty('--accent', seasonThemes[selected].color);
  const seasonalIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173c5b"/><circle cx="50" cy="14" r="6" fill="${seasonThemes[selected].color}"/><text x="9" y="42" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="-2">TN</text></svg>`;
  document.querySelector('link[rel="icon"]').href = `data:image/svg+xml,${encodeURIComponent(seasonalIcon)}`;
  document.querySelectorAll('.season-option').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.season === selected)));
  if (persist) localStorage.removeItem('the-navies-season');
}
localStorage.removeItem('the-navies-season');
setSeason('autumn', false);
requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));
seasonControl.querySelectorAll('.season-option').forEach((button) => button.addEventListener('click', () => setSeason(button.dataset.season)));
Object.assign(translations.es, { navVideos:'Navies Live', time:'13:00 h', tvSoonTitle:'Estamos afinando<br><em>la pantalla.</em>', tvSoonCopy:'Próximamente publicaremos aquí los primeros vídeos de The Navies.' });
Object.assign(translations.ca, { navVideos:'Navies Live', time:'13:00 h', tvSoonTitle:'Estem afinant<br><em>la pantalla.</em>', tvSoonCopy:'Aviat publicarem aquí els primers vídeos de The Navies.' });
Object.assign(translations.en, { navVideos:'Navies Live', time:'1:00 pm', tvSoonTitle:'We’re tuning<br><em>the screen.</em>', tvSoonCopy:'The first videos from The Navies will be here soon.' });
Object.assign(translations.it, { navVideos:'Navies Live', time:'13:00', tvSoonTitle:'Stiamo accordando<br><em>lo schermo.</em>', tvSoonCopy:'Presto pubblicheremo qui i primi video dei The Navies.' });
Object.assign(translations.fr, { navVideos:'Navies Live', time:'13 h', tvSoonTitle:'Nous accordons<br><em>l’écran.</em>', tvSoonCopy:'Les premières vidéos de The Navies seront bientôt disponibles ici.' });

let currentLanguage = 'es';
function closeLanguageMenu() {
  languageTrigger.setAttribute('aria-expanded', 'false');
  languageMenu.hidden = true;
}
function setLanguage(language) {
  const copy = translations[language] || translations.es;
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { if (copy[element.dataset.i18nHtml]) element.innerHTML = copy[element.dataset.i18nHtml]; });
  const activeOption = languageOptions.find((option) => option.dataset.language === language) || languageOptions[0];
  languageTrigger.querySelector('.flag').className = `flag flag-${language}`;
  languageTrigger.querySelector('strong').textContent = activeOption.querySelector('small').textContent;
  languageOptions.forEach((option) => option.setAttribute('aria-selected', String(option === activeOption)));
  localStorage.setItem('the-navies-language', language);
  if (document.querySelector('#account-dialog')) updateAccountUI();
}
const savedLanguage = localStorage.getItem('the-navies-language') || 'es';
setLanguage(savedLanguage);
languageTrigger.addEventListener('click', () => {
  const opening = languageTrigger.getAttribute('aria-expanded') !== 'true';
  languageTrigger.setAttribute('aria-expanded', String(opening));
  languageMenu.hidden = !opening;
  if (opening) languageOptions.find((option) => option.getAttribute('aria-selected') === 'true').focus();
});
languageOptions.forEach((option) => option.addEventListener('click', () => {
  setLanguage(option.dataset.language);
  closeLanguageMenu();
  languageTrigger.focus();
}));
document.addEventListener('click', (event) => { if (!languagePicker.contains(event.target)) closeLanguageMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLanguageMenu(); });

const memberDialog = document.querySelector('#member-dialog');
const dialogName = document.querySelector('#dialog-name');
const dialogBio = document.querySelector('#dialog-bio');
const memberTitleKeys = { vocals:'visualVocals', bass:'visualBass', guitar:'visualGuitar', keys:'visualKeys', drums:'visualDrums' };
function openMember(member) {
  const profile = (memberBios[currentLanguage] || memberBios.es)[member];
  dialogName.textContent = (translations[currentLanguage] || translations.es)[memberTitleKeys[member]];
  dialogBio.textContent = profile[1];
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
  window.location.href = `mailto:contacto@thenavies.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
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
      <label><span>Usuario</span><input name="username" autocomplete="username" required></label>
      <label><span>Contraseña</span><input name="password" type="password" autocomplete="current-password" required></label>
      <button type="submit">Entrar</button>
    </form>
    <p class="account-error" aria-live="polite"></p>
  </div>
  <div class="account-member-view" hidden>
    <span class="account-member-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.25"></circle><path d="M5.5 19c.65-3.6 3-5.5 6.5-5.5s5.85 1.9 6.5 5.5"></path></svg>
    </span>
    <p class="account-session-status">Sesión iniciada</p>
    <h2 class="account-member-greeting"></h2>
    <button class="account-logout" type="button">Cerrar sesión</button>
  </div>`;
document.body.append(accountDialog);

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
}

window.naviesLogin = (username, password) => {
  const member = String(username).trim().toLowerCase();
  if (!navyMembers.includes(member) || password !== 'navies2026') return false;
  localStorage.setItem('navies-member-session', member);
  updateAccountUI();
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member } }));
  if (accountDialog.open) accountDialog.close();
  return true;
};

window.naviesLogout = () => {
  localStorage.removeItem('navies-member-session');
  updateAccountUI();
  window.dispatchEvent(new CustomEvent('navies-auth-change', { detail: { member: null } }));
  if (accountDialog.open) accountDialog.close();
};

document.querySelectorAll('.account-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
  updateAccountUI();
  accountDialog.showModal();
  if (!validNavyMember()) requestAnimationFrame(() => accountDialog.querySelector('input').focus());
}));
accountDialog.querySelector('.account-close').addEventListener('click', () => accountDialog.close());
accountDialog.addEventListener('click', (event) => { if (event.target === accountDialog) accountDialog.close(); });
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
