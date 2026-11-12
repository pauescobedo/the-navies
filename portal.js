const loginPanel = document.querySelector('#login');
const dashboard = document.querySelector('#member-dashboard');
const spaceEntry = document.querySelector('.space-entry');
const loginForm = document.querySelector('#login-form');
if (new URLSearchParams(location.search).has('username') || new URLSearchParams(location.search).has('password')) {
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('username');
  cleanUrl.searchParams.delete('password');
  history.replaceState(history.state, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
}
const loginError = document.querySelector('#login-error');
const memberName = document.querySelector('#member-name');
const dashboardBar = document.querySelector('.dashboard-bar');
const portalApiUrl = String(window.NAVIES_ADMIN_API_URL || '').replace(/\/$/, '');
const portalAdminSessionKey = 'navies-admin-session';
const portalLanguage = (document.documentElement.lang || 'es').slice(0, 2);
const editorCopies = {
  es:{ edit:'Editar página', tools:'Herramientas de administración', title:'Editar página', intro:'Gestiona el contenido publicado en Inicio y Espacio Navy.', back:'Volver a Espacio Navy', home:'Inicio', space:'Espacio Navy', mainTexts:'Textos principales', mainTextsCopy:'Contenido en castellano, el idioma principal de la web.', concerts:'Conciertos', concertsCopy:'El primero será el concierto destacado de Inicio.', addConcert:'Añadir concierto', members:'Tarjetas de músicos', membersCopy:'Título, instrumento, descripción breve y texto ampliado.', dates:'Fechas internas', datesCopy:'Ensayos, ensayos generales, extras, conciertos y grabaciones.', addDate:'Añadir fecha', setlist:'Repertorio', setlistCopy:'El orden guardado será el que verá toda la banda.', addSong:'Añadir canción', links:'Enlaces útiles', linksCopy:'Accesos compartidos de la banda.', addLink:'Añadir enlace', save:'Guardar cambios', remove:'Eliminar', up:'Subir', down:'Bajar', type:'Tipo', altName:'Nombre alternativo', altPlaceholder:'Opcional, salvo en Otro', date:'Fecha', time:'Hora', place:'Lugar', song:'Canción', name:'Nombre', web:'Dirección web', instrument:'Instrumento', cardTitle:'Título', short:'Descripción breve', long:'Descripción ampliada', presentation:'Presentación principal', sound:'Descripción del sonido', band:'Presentación de la banda', day:'Día (opcional)', month:'Mes', year:'Año', rehearsal:'Ensayo', extra:'Ensayo Extra', general:'Ensayo General', concert:'Concierto', recording:'Grabación', other:'Otro', saving:'Guardando…', saved:'Cambios guardados.', loadError:'No se ha podido cargar el contenido.', expired:'La sesión de administración ha caducado.', expiredAgain:'La sesión ha caducado. Vuelve a introducir el código.', saveError:'No se han podido guardar los cambios.', confirmDelete:'¿Seguro que quieres eliminar este elemento?', newConcert:'Nuevo concierto' },
  ca:{ edit:'Editar pàgina', tools:'Eines d’administració', title:'Editar pàgina', intro:'Gestiona el contingut publicat a Inici i Espai Navy.', back:'Tornar a Espai Navy', home:'Inici', space:'Espai Navy', mainTexts:'Textos principals', mainTextsCopy:'Contingut en castellà, l’idioma principal del web.', concerts:'Concerts', concertsCopy:'El primer serà el concert destacat d’Inici.', addConcert:'Afegir concert', members:'Targetes de músics', membersCopy:'Títol, instrument, descripció breu i text ampliat.', dates:'Dates internes', datesCopy:'Assajos, assajos generals, extres, concerts i gravacions.', addDate:'Afegir data', setlist:'Repertori', setlistCopy:'L’ordre desat serà el que veurà tota la banda.', addSong:'Afegir cançó', links:'Enllaços útils', linksCopy:'Accessos compartits de la banda.', addLink:'Afegir enllaç', save:'Desar canvis', remove:'Eliminar', up:'Pujar', down:'Baixar', type:'Tipus', altName:'Nom alternatiu', altPlaceholder:'Opcional, excepte a Altres', date:'Data', time:'Hora', place:'Lloc', song:'Cançó', name:'Nom', web:'Adreça web', instrument:'Instrument', cardTitle:'Títol', short:'Descripció breu', long:'Descripció ampliada', presentation:'Presentació principal', sound:'Descripció del so', band:'Presentació de la banda', day:'Dia (opcional)', month:'Mes', year:'Any', rehearsal:'Assaig', extra:'Assaig extra', general:'Assaig general', concert:'Concert', recording:'Gravació', other:'Altres', saving:'Desant…', saved:'Canvis desats.', loadError:'No s’ha pogut carregar el contingut.', expired:'La sessió d’administració ha caducat.', expiredAgain:'La sessió ha caducat. Torna a introduir el codi.', saveError:'No s’han pogut desar els canvis.', confirmDelete:'Segur que vols eliminar aquest element?', newConcert:'Concert nou' },
  en:{ edit:'Edit page', tools:'Administration tools', title:'Edit page', intro:'Manage the content published on Home and Navy Space.', back:'Back to Navy Space', home:'Home', space:'Navy Space', mainTexts:'Main text', mainTextsCopy:'Content in Spanish, the website’s primary language.', concerts:'Shows', concertsCopy:'The first one will be the featured show on Home.', addConcert:'Add show', members:'Musician cards', membersCopy:'Title, instrument, short description and expanded text.', dates:'Internal dates', datesCopy:'Rehearsals, dress rehearsals, extras, shows and recordings.', addDate:'Add date', setlist:'Setlist', setlistCopy:'The saved order is what the whole band will see.', addSong:'Add song', links:'Useful links', linksCopy:'Shared band resources.', addLink:'Add link', save:'Save changes', remove:'Delete', up:'Move up', down:'Move down', type:'Type', altName:'Alternative name', altPlaceholder:'Optional, except for Other', date:'Date', time:'Time', place:'Location', song:'Song', name:'Name', web:'Web address', instrument:'Instrument', cardTitle:'Title', short:'Short description', long:'Expanded description', presentation:'Main introduction', sound:'Sound description', band:'Band introduction', day:'Day (optional)', month:'Month', year:'Year', rehearsal:'Rehearsal', extra:'Extra rehearsal', general:'Dress rehearsal', concert:'Show', recording:'Recording', other:'Other', saving:'Saving…', saved:'Changes saved.', loadError:'The content could not be loaded.', expired:'The administration session has expired.', expiredAgain:'The session has expired. Enter the code again.', saveError:'The changes could not be saved.', confirmDelete:'Are you sure you want to delete this item?', newConcert:'New show' },
  fr:{ edit:'Modifier la page', tools:'Outils d’administration', title:'Modifier la page', intro:'Gérez le contenu publié sur l’Accueil et l’Espace Navy.', back:'Retour à l’Espace Navy', home:'Accueil', space:'Espace Navy', mainTexts:'Textes principaux', mainTextsCopy:'Contenu en espagnol, la langue principale du site.', concerts:'Concerts', concertsCopy:'Le premier sera le concert mis en avant sur l’Accueil.', addConcert:'Ajouter un concert', members:'Cartes des musiciens', membersCopy:'Titre, instrument, description courte et texte détaillé.', dates:'Dates internes', datesCopy:'Répétitions, générales, extras, concerts et enregistrements.', addDate:'Ajouter une date', setlist:'Répertoire', setlistCopy:'L’ordre enregistré sera visible par tout le groupe.', addSong:'Ajouter une chanson', links:'Liens utiles', linksCopy:'Ressources partagées du groupe.', addLink:'Ajouter un lien', save:'Enregistrer', remove:'Supprimer', up:'Monter', down:'Descendre', type:'Type', altName:'Nom alternatif', altPlaceholder:'Facultatif, sauf pour Autre', date:'Date', time:'Heure', place:'Lieu', song:'Chanson', name:'Nom', web:'Adresse web', instrument:'Instrument', cardTitle:'Titre', short:'Description courte', long:'Description détaillée', presentation:'Présentation principale', sound:'Description du son', band:'Présentation du groupe', day:'Jour (facultatif)', month:'Mois', year:'Année', rehearsal:'Répétition', extra:'Répétition supplémentaire', general:'Répétition générale', concert:'Concert', recording:'Enregistrement', other:'Autre', saving:'Enregistrement…', saved:'Modifications enregistrées.', loadError:'Impossible de charger le contenu.', expired:'La session d’administration a expiré.', expiredAgain:'La session a expiré. Saisissez de nouveau le code.', saveError:'Impossible d’enregistrer les modifications.', confirmDelete:'Voulez-vous vraiment supprimer cet élément ?', newConcert:'Nouveau concert' },
  it:{ edit:'Modifica pagina', tools:'Strumenti di amministrazione', title:'Modifica pagina', intro:'Gestisci i contenuti pubblicati su Home e Spazio Navy.', back:'Torna a Spazio Navy', home:'Home', space:'Spazio Navy', mainTexts:'Testi principali', mainTextsCopy:'Contenuto in spagnolo, la lingua principale del sito.', concerts:'Concerti', concertsCopy:'Il primo sarà il concerto in evidenza nella Home.', addConcert:'Aggiungi concerto', members:'Schede dei musicisti', membersCopy:'Titolo, strumento, descrizione breve e testo esteso.', dates:'Date interne', datesCopy:'Prove, prove generali, extra, concerti e registrazioni.', addDate:'Aggiungi data', setlist:'Repertorio', setlistCopy:'L’ordine salvato sarà visibile a tutta la band.', addSong:'Aggiungi brano', links:'Link utili', linksCopy:'Risorse condivise della band.', addLink:'Aggiungi link', save:'Salva modifiche', remove:'Elimina', up:'Sposta su', down:'Sposta giù', type:'Tipo', altName:'Nome alternativo', altPlaceholder:'Facoltativo, tranne per Altro', date:'Data', time:'Ora', place:'Luogo', song:'Brano', name:'Nome', web:'Indirizzo web', instrument:'Strumento', cardTitle:'Titolo', short:'Descrizione breve', long:'Descrizione estesa', presentation:'Presentazione principale', sound:'Descrizione del suono', band:'Presentazione della band', day:'Giorno (facoltativo)', month:'Mese', year:'Anno', rehearsal:'Prova', extra:'Prova extra', general:'Prova generale', concert:'Concerto', recording:'Registrazione', other:'Altro', saving:'Salvataggio…', saved:'Modifiche salvate.', loadError:'Impossibile caricare il contenuto.', expired:'La sessione di amministrazione è scaduta.', expiredAgain:'La sessione è scaduta. Inserisci di nuovo il codice.', saveError:'Impossibile salvare le modifiche.', confirmDelete:'Vuoi davvero eliminare questo elemento?', newConcert:'Nuovo concerto' }
};
const editorText = editorCopies[portalLanguage] || editorCopies.es;
Object.assign(editorText, ({
  es:{ live:'Navies Live', liveTitle:'Título de Navies Live', liveDescription:'Descripción de Navies Live', socialNetworks:'Redes sociales', socialNetworksCopy:'Enlaces públicos mostrados en la página de Inicio.', addSocial:'Añadir red', dialogTitle:'Título interior', socialLabel:'Texto del enlace', socialUrl:'Enlace personal', siteEditing:'Edición del Sitio', general:'Ajustes generales', generalCopy:'Preferencias comunes para toda la web.', defaultSeason:'Tema predeterminado', initialPlayback:'Primera canción del reproductor', randomPlayback:'Aleatoria', customPlayback:'Canción personalizada', initialSong:'Canción inicial', countdownSetting:'Landing y cuenta atrás', enabled:'Activada', disabled:'Desactivada', initialVolume:'Volumen inicial', lowVolume:'Bajo', mediumVolume:'Medio', highVolume:'Alto', fallbackLanguage:'Idioma de respaldo', faviconMode:'Icono de la pestaña', dynamicFavicon:'Dinámico · color estacional', staticFavicon:'Estático · punto verde', saveBeforeExit:'Hay cambios sin guardar. ¿Quieres guardarlos antes de salir?', singer:'Cantante' },
  ca:{ live:'Navies Live', liveTitle:'Títol de Navies Live', liveDescription:'Descripció de Navies Live', socialNetworks:'Xarxes socials', socialNetworksCopy:'Enllaços públics mostrats a la pàgina d’Inici.', addSocial:'Afegir xarxa', dialogTitle:'Títol interior', socialLabel:'Text de l’enllaç', socialUrl:'Enllaç personal', siteEditing:'Edició del Lloc', general:'Configuració general', generalCopy:'Preferències comunes per a tot el web.', defaultSeason:'Tema predeterminat', initialPlayback:'Primera cançó del reproductor', randomPlayback:'Aleatòria', customPlayback:'Cançó personalitzada', initialSong:'Cançó inicial', countdownSetting:'Landing i compte enrere', enabled:'Activat', disabled:'Desactivat', initialVolume:'Volum inicial', lowVolume:'Baix', mediumVolume:'Mitjà', highVolume:'Alt', fallbackLanguage:'Idioma de reserva', faviconMode:'Icona de la pestanya', dynamicFavicon:'Dinàmica · color estacional', staticFavicon:'Estàtica · punt verd', saveBeforeExit:'Hi ha canvis sense desar. Vols desar-los abans de sortir?', singer:'Cantant' },
  en:{ live:'Navies Live', liveTitle:'Navies Live title', liveDescription:'Navies Live description', socialNetworks:'Social media', socialNetworksCopy:'Public links shown on the Home page.', addSocial:'Add social link', dialogTitle:'Inner title', socialLabel:'Link text', socialUrl:'Personal link', siteEditing:'Site Editing', general:'General settings', generalCopy:'Shared preferences for the whole website.', defaultSeason:'Default theme', initialPlayback:'First player track', randomPlayback:'Random', customPlayback:'Custom track', initialSong:'First track', countdownSetting:'Landing and countdown', enabled:'Enabled', disabled:'Disabled', initialVolume:'Initial volume', lowVolume:'Low', mediumVolume:'Medium', highVolume:'High', fallbackLanguage:'Fallback language', faviconMode:'Browser tab icon', dynamicFavicon:'Dynamic · seasonal colour', staticFavicon:'Static · green dot', saveBeforeExit:'There are unsaved changes. Save them before leaving?', singer:'Singer' },
  fr:{ live:'Navies Live', liveTitle:'Titre de Navies Live', liveDescription:'Description de Navies Live', socialNetworks:'Réseaux sociaux', socialNetworksCopy:'Liens publics affichés sur la page d’accueil.', addSocial:'Ajouter un réseau', dialogTitle:'Titre intérieur', socialLabel:'Texte du lien', socialUrl:'Lien personnel', siteEditing:'Édition du Site', general:'Réglages généraux', generalCopy:'Préférences communes à tout le site.', defaultSeason:'Thème par défaut', initialPlayback:'Premier morceau du lecteur', randomPlayback:'Aléatoire', customPlayback:'Morceau personnalisé', initialSong:'Morceau initial', countdownSetting:'Accueil et compte à rebours', enabled:'Activé', disabled:'Désactivé', initialVolume:'Volume initial', lowVolume:'Faible', mediumVolume:'Moyen', highVolume:'Élevé', fallbackLanguage:'Langue de secours', faviconMode:'Icône de l’onglet', dynamicFavicon:'Dynamique · couleur saisonnière', staticFavicon:'Statique · point vert', saveBeforeExit:'Des modifications ne sont pas enregistrées. Les enregistrer avant de quitter ?', singer:'Chanteuse' },
  it:{ live:'Navies Live', liveTitle:'Titolo di Navies Live', liveDescription:'Descrizione di Navies Live', socialNetworks:'Social media', socialNetworksCopy:'Link pubblici mostrati nella pagina Home.', addSocial:'Aggiungi social', dialogTitle:'Titolo interno', socialLabel:'Testo del link', socialUrl:'Link personale', siteEditing:'Modifica del Sito', general:'Impostazioni generali', generalCopy:'Preferenze comuni per tutto il sito.', defaultSeason:'Tema predefinito', initialPlayback:'Primo brano del lettore', randomPlayback:'Casuale', customPlayback:'Brano personalizzato', initialSong:'Brano iniziale', countdownSetting:'Landing e conto alla rovescia', enabled:'Attivato', disabled:'Disattivato', initialVolume:'Volum iniziale', lowVolume:'Basso', mediumVolume:'Medio', highVolume:'Alto', fallbackLanguage:'Lingua di riserva', faviconMode:'Icona della scheda', dynamicFavicon:'Dinamica · colore stagionale', staticFavicon:'Statica · punto verde', saveBeforeExit:'Ci sono modifiche non salvate. Vuoi salvarle prima di uscire?', singer:'Cantante' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ sessionInactivity:'Cierre por inactividad', inactivityHours:'Tiempo sin actividad', hours:'horas' },
  ca:{ sessionInactivity:'Tancament per inactivitat', inactivityHours:'Temps sense activitat', hours:'hores' },
  en:{ sessionInactivity:'Sign out after inactivity', inactivityHours:'Inactive time', hours:'hours' },
  fr:{ sessionInactivity:'Déconnexion pour inactivité', inactivityHours:'Durée d’inactivité', hours:'heures' },
  it:{ sessionInactivity:'Disconnessione per inattività', inactivityHours:'Tempo di inattività', hours:'ore' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ customPlayback:'Personalizada', dynamicFavicon:'Dinámico', staticFavicon:'Estático' },
  ca:{ customPlayback:'Personalitzada', dynamicFavicon:'Dinàmic', staticFavicon:'Estàtic' },
  en:{ customPlayback:'Custom', dynamicFavicon:'Dynamic', staticFavicon:'Static' },
  fr:{ customPlayback:'Personnalisée', dynamicFavicon:'Dynamique', staticFavicon:'Statique' },
  it:{ customPlayback:'Personalizzata', dynamicFavicon:'Dinamico', staticFavicon:'Statico' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ links:'Listas de reproducción', linksCopy:'Listas musicales asociadas a esta formación.', addLink:'Añadir lista' },
  ca:{ links:'Llistes de reproducció', linksCopy:'Llistes musicals associades a aquesta formació.', addLink:'Afegir llista' },
  en:{ links:'Playlists', linksCopy:'Music playlists associated with this ensemble.', addLink:'Add playlist' },
  fr:{ links:'Listes de lecture', linksCopy:'Listes musicales associées à cette formation.', addLink:'Ajouter une liste' },
  it:{ links:'Playlist', linksCopy:'Playlist musicali associate a questa formazione.', addLink:'Aggiungi playlist' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ ensembleEditing:'Formación', ensembleEditingCopy:'Elige qué grupo quieres editar.' },
  ca:{ ensembleEditing:'Formació', ensembleEditingCopy:'Tria quin grup vols editar.' },
  en:{ ensembleEditing:'Ensemble', ensembleEditingCopy:'Choose which group you want to edit.' },
  fr:{ ensembleEditing:'Formation', ensembleEditingCopy:'Choisissez le groupe que vous souhaitez modifier.' },
  it:{ ensembleEditing:'Formazione', ensembleEditingCopy:'Scegli quale gruppo vuoi modificare.' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ siteProperties:'Propiedades del sitio' },
  ca:{ siteProperties:'Propietats del lloc' },
  en:{ siteProperties:'Site properties' },
  fr:{ siteProperties:'Propriétés du site' },
  it:{ siteProperties:'Proprietà del sito' }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ users:'Usuarios', usersCopy:'Gestiona credenciales y acceso a cada formación.', addUser:'Añadir usuario', username:'Usuario', displayName:'Nombre visible', newPassword:'Nueva contraseña', accessNavies:'The Navies', accessCorBand:'Cor-Band', accessStrings:'Conjunto de Cuerdas' },
  ca:{ users:'Usuaris', usersCopy:'Gestiona credencials i accés a cada formació.', addUser:'Afegir usuari', username:'Usuari', displayName:'Nom visible', newPassword:'Contrasenya nova', accessNavies:'The Navies', accessCorBand:'Cor-Band', accessStrings:'Conjunt de Cordes' },
  en:{ users:'Users', usersCopy:'Manage credentials and access to each ensemble.', addUser:'Add user', username:'Username', displayName:'Display name', newPassword:'New password', accessNavies:'The Navies', accessCorBand:'Cor-Band', accessStrings:'String Ensemble' },
  fr:{ users:'Utilisateurs', usersCopy:'Gérez les identifiants et les accès à chaque formation.', addUser:'Ajouter', username:'Utilisateur', displayName:'Nom affiché', newPassword:'Nouveau mot de passe', accessNavies:'The Navies', accessCorBand:'Cor-Band', accessStrings:'Ensemble à cordes' },
  it:{ users:'Utenti', usersCopy:'Gestisci credenziali e accesso a ogni formazione.', addUser:'Aggiungi utente', username:'Utente', displayName:'Nome visibile', newPassword:'Nuova password', accessNavies:'The Navies', accessCorBand:'Cor-Band', accessStrings:"Ensemble d’archi" }
}[portalLanguage] || {}));
Object.assign(editorText, ({
  es:{ unsavedTitle:'¿Quieres guardar los cambios?', unsavedCopy:'Tienes cambios sin guardar. Elige qué quieres hacer antes de salir de la edición.', saveAndExit:'Guardar y salir', exitWithoutSaving:'Salir sin guardar', returnToEditing:'Volver a la edición' },
  ca:{ unsavedTitle:'Vols desar els canvis?', unsavedCopy:'Tens canvis sense desar. Tria què vols fer abans de sortir de l’edició.', saveAndExit:'Desar i sortir', exitWithoutSaving:'Sortir sense desar', returnToEditing:'Tornar a l’edició' },
  en:{ unsavedTitle:'Save your changes?', unsavedCopy:'You have unsaved changes. Choose what to do before leaving the editor.', saveAndExit:'Save and leave', exitWithoutSaving:'Leave without saving', returnToEditing:'Return to editing' },
  fr:{ unsavedTitle:'Enregistrer les modifications ?', unsavedCopy:'Des modifications ne sont pas enregistrées. Choisissez quoi faire avant de quitter l’édition.', saveAndExit:'Enregistrer et quitter', exitWithoutSaving:'Quitter sans enregistrer', returnToEditing:'Revenir à l’édition' },
  it:{ unsavedTitle:'Salvare le modifiche?', unsavedCopy:'Ci sono modifiche non salvate. Scegli cosa fare prima di uscire dalla modifica.', saveAndExit:'Salva ed esci', exitWithoutSaving:'Esci senza salvare', returnToEditing:'Torna alla modifica' }
}[portalLanguage] || {}));

localStorage.removeItem('navies-demo-chat');
localStorage.removeItem('navies-demo-member');

const portalAssetPrefix = window.__naviesForcedLanguage ? '../' : '';
const scoreRoot = `${portalAssetPrefix}scores`;
const audioRoot = `${portalAssetPrefix}audios`;
const scoreLibrary = {
  'shake-it-off': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['general', 'general.pdf']
  ],
  'baby-one-more-time': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['chordsAm', 'acordes-am.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['general', 'general.pdf']
  ],
  'sweet-caroline': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['chordsC', 'acordes-c.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['general', 'general.pdf']
  ],
  'dont-look-back-in-anger': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['bass', 'bajo.pdf'], ['general', 'general.pdf']
  ],
  'the-final-countdown': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['general', 'general.pdf']
  ],
  'have-you-ever-seen-the-rain': [
    ['lyrics', 'letra.pdf'], ['chords', 'acordes.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['violin', 'violin.pdf'], ['viola', 'viola.pdf'], ['general', 'general.pdf']
  ],
  'the-final-countdown-reprise': [
    ['chords', 'acordes.pdf'], ['keyboard', 'teclado.pdf'], ['bass', 'bajo.pdf'], ['violin', 'violin.pdf'], ['viola', 'viola.pdf'], ['general', 'general.pdf']
  ],
  'cor-band/billie-jean':[['lyrics','lletra.pdf']],
  'cor-band/stayin-alive':[['lyrics','lletra.pdf']],
  'cor-band/mystical-magical':[['lyrics','lletra.pdf'],['chords','acords.pdf']],
  'cor-band/texas-hold-em':[['lyrics','lletra.pdf'],['chords','acords.pdf']],
  'cor-band/training-season':[['lyrics','lletra.pdf'],['chords','acords.pdf']],
  'cor-band/livin-on-a-prayer':[['lyrics','lletra.pdf'],['keyboard','teclat.pdf']],
  'conjunt-de-cordes/balfourd-road':[['standard','estandard.pdf']],
  'conjunt-de-cordes/calliope-house':[['violin','violi.pdf'],['viola','viola.pdf'],['chords','acords.pdf']]
};

const auxiliarySongIds = new Set(Object.keys(scoreLibrary).filter((id) => id.includes('/')));
const ensembleCopies = {
  es:{ strings:'Conjunto de Cuerdas' }, ca:{ strings:'Conjunt de Cordes' }, en:{ strings:'String Ensemble' }, fr:{ strings:'Ensemble à cordes' }, it:{ strings:'Ensemble d’archi' }
};
const ensembleCopy = ensembleCopies[portalLanguage] || ensembleCopies.es;
const editorEnsembleNames = { 'the-navies':'The Navies', 'cor-band':'Cor-Band', strings:ensembleCopy.strings };
const repertoireTitle = document.querySelector('.repertoire-card .card-heading h3');
if (repertoireTitle) repertoireTitle.dataset.concertTitle = repertoireTitle.textContent.trim();
const ensembleContent = {
  'cor-band':{
    numbered:false,
    links:[],
    songs:[
      { id:'cor-band/billie-jean', title:'Billie Jean' }, { id:'cor-band/stayin-alive', title:"Stayin’ Alive" },
      { id:'cor-band/mystical-magical', title:'Mystical Magical' }, { id:'cor-band/texas-hold-em', title:"Texas Hold’Em" },
      { id:'cor-band/training-season', title:'Training Season' }, { id:'cor-band/livin-on-a-prayer', title:"Livin’ On A Prayer" }
    ],
    events:[
      { id:'cor-band-2026-11-13', type:'rehearsal', name:'Ensayo', date:'2026-11-13', time:'19:30–21:30', location:'BCN Fusió Sant Andreu' },
      { id:'cor-band-2026-11-20', type:'general', name:'Ensayo General', date:'2026-11-20', time:'19:30–21:30', location:'BCN Fusió Sant Andreu' },
      { id:'cor-band-concert-2026-11-21', type:'concert', name:'Fiestas de La Sagrera 2026', date:'2026-11-21', time:'13:30', location:'Plaza Masadas' }
    ]
  },
  strings:{
    numbered:true,
    links:[],
    songs:[
      { id:'conjunt-de-cordes/balfourd-road', title:'Balfourd Road' },
      { id:'conjunt-de-cordes/calliope-house', title:'Calliope House' }
    ],
    events:[
      { id:'strings-2026-11-18', type:'rehearsal', name:'Ensayo', date:'2026-11-18', time:'20:00–20:30', location:'BCN Fusió La Sagrera' },
      { id:'strings-concert-2026-11-21', type:'concert', name:'Fiestas de La Sagrera 2026', date:'2026-11-21', time:'13:20', location:'Plaza Masadas' }
    ]
  }
};
let selectedEnsemble = 'the-navies';

let navyContent = null;
let editorUsers = [];

function contentSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(portalAdminSessionKey));
    return session?.token && session.expiresAt > Date.now() ? session : null;
  } catch (_) { return null; }
}

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || `item-${Date.now()}`;
}

function localToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Madrid', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

const rehearsalEventTypes = new Set(['rehearsal','extra','general']);
function eventDateValue(event) {
  if (!event?.date) return Number.MAX_SAFE_INTEGER;
  const time = String(event.time || '23:59').match(/^\d{1,2}:\d{2}/)?.[0] || '23:59';
  const value = Date.parse(`${event.date}T${time}:00`);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}
function orderedEditableEvents(events = []) {
  const today = localToday();
  return [...events]
    .filter((event) => !(rehearsalEventTypes.has(event.type) && event.date && event.date < today))
    .sort((a, b) => eventDateValue(a) - eventDateValue(b));
}
function eventFromEditorRow(row) {
  return {
    id:row.dataset.id || `event-${Date.now()}`,
    type:row.querySelector('[name="type"]').value,
    name:row.querySelector('[name="name"]').value.trim(),
    date:row.querySelector('[name="date"]').value,
    time:row.querySelector('[name="time"]').value,
    location:row.querySelector('[name="location"]').value.trim()
  };
}
function sortEventEditorRows(list) {
  const rows = [...list.querySelectorAll('.editor-event-row')];
  rows.sort((a, b) => eventDateValue(eventFromEditorRow(a)) - eventDateValue(eventFromEditorRow(b)));
  rows.forEach((row) => list.append(row));
}

const eventTypeKeys = ['rehearsal','extra','general','concert','recording','other'];
function eventTypeLabel(type, language = portalLanguage) {
  const source = editorCopies[language] || editorCopies.es;
  const fixed = {
    es:{ rehearsal:'Ensayo', extra:'Ensayo Extra', general:'Ensayo General', concert:'Concierto', recording:'Grabación', other:'Otro' },
    ca:{ rehearsal:'Assaig', extra:'Assaig Extra', general:'Assaig General', concert:'Concert', recording:'Gravació', other:'Altres' },
    en:{ rehearsal:'Rehearsal', extra:'Extra Rehearsal', general:'Dress Rehearsal', concert:'Show', recording:'Recording', other:'Other' },
    fr:{ rehearsal:'Répétition', extra:'Répétition supplémentaire', general:'Répétition générale', concert:'Concert', recording:'Enregistrement', other:'Autre' },
    it:{ rehearsal:'Prova', extra:'Prova extra', general:'Prova generale', concert:'Concerto', recording:'Registrazione', other:'Altro' }
  };
  return fixed[language]?.[type] || fixed.es[type] || source[type] || source.other;
}
function isCanonicalEventName(name) {
  return eventTypeKeys.some((type) => ['es','ca','en','fr','it'].some((language) => eventTypeLabel(type, language) === name));
}

function renderSetlist(songs, numbered = true) {
  const setlist = document.querySelector('.setlist');
  if (!setlist) return;
  setlist.replaceChildren();
  setlist.classList.toggle('setlist-unnumbered', !numbered);
  songs.forEach((song, index) => {
    const row = document.createElement('div');
    row.className = 'song-row';
    const number = document.createElement('span');
    number.className = 'song-number';
    number.textContent = numbered ? String(index + 1).padStart(2, '0') : '';
    const title = document.createElement('strong');
    title.textContent = song.title;
    const materials = document.createElement('div');
    materials.className = 'material-tags';
    materials.dataset.scoreSong = song.id;
    row.append(number, title, materials);
    setlist.append(row);
  });
  decorateScoreSongs();
}

function renderEvents(events) {
  const list = document.querySelector('.event-list');
  if (!list) return;
  list.replaceChildren();
  const today = localToday();
  const locale = document.documentElement.lang || 'es';
  events.filter((event) => event.date >= today).sort((a, b) => `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`)).forEach((event) => {
    const item = document.createElement('div');
    item.className = `event-item${event.type === 'general' ? ' highlight' : ''}${event.type === 'concert' ? ' concert' : ''}${event.date === today ? ' is-today' : ''}`;
    const date = new Date(`${event.date}T12:00:00`);
    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat(locale, { month:'short' }).format(date).replace('.', '').toUpperCase();
    const time = document.createElement('time');
    time.dateTime = event.date;
    if (event.date === today) {
      const todayLabel = document.createElement('strong');
      todayLabel.textContent = ({ ca:'Avui', en:'Today', fr:"Aujourd’hui", it:'Oggi' })[locale.slice(0, 2)] || 'Hoy';
      const compactDate = document.createElement('small');
      compactDate.textContent = `${day} ${month}`;
      time.append(todayLabel, compactDate);
    } else {
      const dayNode = document.createElement('strong');
      dayNode.textContent = day;
      const monthNode = document.createElement('span');
      monthNode.textContent = month;
      time.append(dayNode, monthNode);
    }
    const details = document.createElement('div');
    const name = document.createElement('b');
    name.textContent = event.name && !isCanonicalEventName(event.name) ? event.name : eventTypeLabel(event.type, locale.slice(0, 2));
    details.append(name);
    const meta = [event.time ? `${event.time}h` : '', event.location].filter(Boolean).join(' · ');
    if (meta) {
      const small = document.createElement('small');
      small.textContent = meta;
      details.append(small);
    }
    item.append(time, details);
    list.append(item);
  });
}

function renderLinks(links) {
  const list = document.querySelector('.useful-links-list');
  if (!list) return;
  list.replaceChildren();
  links.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    const label = document.createElement('b');
    label.textContent = link.label;
    const arrow = document.createElement('i');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    anchor.append(label, arrow);
    list.append(anchor);
  });
}

const builtInConcertNames = {
  'sagrera-2026':{ es:'Fiestas de La Sagrera', ca:'Festes de La Sagrera', en:'La Sagrera Neighbourhood Festival', fr:'Fête de quartier de La Sagrera', it:'Festa di quartiere de La Sagrera' },
  'christmas-2026':{ es:'Concierto de Navidad', ca:'Concert de Nadal', en:'Christmas Concert', fr:'Concert de Noël', it:'Concerto di Natale' },
  'spring-2027':{ es:'Fiestas de la Primavera', ca:'Festes de la Primavera', en:'Spring Festival', fr:'Fête du Printemps', it:'Festa di Primavera' },
  'end-course-2027':{ es:'Concierto de Final de Curso', ca:'Concert de Final de Curs', en:'End-of-year Concert', fr:'Concert de fin d’année', it:'Concerto di fine anno' }
};

function concertName(concert) {
  const language = (document.documentElement.lang || 'es').slice(0, 2);
  const defaults = builtInConcertNames[concert.id];
  return defaults && concert.name === defaults.es ? (defaults[language] || defaults.es) : concert.name;
}

function renderHomeContent(home) {
  if (!home) return;
  if (home.settings?.defaultSeason) window.naviesSetSeason?.(home.settings.defaultSeason, false);
  window.naviesConfigureSiteMusic?.(home.settings);
  window.naviesApplyGeneralSettings?.(home.settings);
  const language = (document.documentElement.lang || 'es').slice(0, 2);
  if (language === 'es') {
    const textTargets = { heroIntro:'.hero-intro', soundBody:'#sonido .sound-copy [data-i18n="soundBody"]', bandBody:'#banda .about-copy [data-i18n="bandBody"]' };
    Object.entries(textTargets).forEach(([key, selector]) => {
      const target = document.querySelector(selector);
      if (target && home.texts[key]) target.textContent = home.texts[key];
    });
    home.members.forEach((member) => {
      const card = document.querySelector(`[data-member="${member.id}"]`);
      if (!card) return;
      const instrument = card.querySelector('.instrument-word');
      const title = card.querySelector('h3');
      const summary = card.querySelector('p');
      if (instrument) instrument.textContent = member.instrument;
      if (title) title.textContent = member.title;
      if (summary) summary.textContent = member.summary;
    });
    window.naviesEditableMemberBios = Object.fromEntries(home.members.map((member) => [member.id, member.bio]));
    window.naviesEditableMemberTitles = Object.fromEntries(home.members.map((member) => [member.id, member.dialogTitle]));
    window.naviesEditableMemberSocials = Object.fromEntries(home.members.map((member) => [member.id, [
      { label:member.socialLabel, url:member.socialUrl },
      { label:member.socialLabel2, url:member.socialUrl2 },
      { label:member.socialLabel3, url:member.socialUrl3 }
    ].filter((social) => social.url)]));
    const liveTitle = document.querySelector('.tv-coming-soon h1');
    const liveDescription = document.querySelector('.tv-coming-soon > p[data-i18n="tvSoonCopy"]');
    if (liveTitle) {
      const title = home.live.title.trim();
      const description = home.live.description.trim();
      if (title && title !== description) {
        if (title === 'Estamos afinando la pantalla.') liveTitle.innerHTML = 'Estamos afinando<br><em>la pantalla.</em>';
        else liveTitle.textContent = title;
      }
    }
    if (liveDescription) liveDescription.textContent = home.live.description;
  }
  const socials = document.querySelector('.socials');
  if (socials && Array.isArray(home.socials)) {
    socials.replaceChildren(...home.socials.map((social) => {
      const link = document.createElement('a');
      link.href = social.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `${social.label} ↗`;
      return link;
    }));
  }
  const concerts = home.concerts || [];
  const featured = concerts[0];
  const featuredShow = document.querySelector('.featured-show');
  if (featured && featuredShow) {
    featuredShow.querySelector('.date-block strong').textContent = featured.day || '—';
    featuredShow.querySelector('.date-block span').innerHTML = `${monthLabel(featured.month, language)}<br>${featured.year}`;
    featuredShow.querySelector('.show-info h3').textContent = concertName(featured);
    const meta = [featured.time ? `${featured.time}h` : '', featured.location].filter(Boolean).join(' · ');
    featuredShow.querySelector('.show-info p').textContent = meta;
  }
  const list = document.querySelector('.show-list');
  if (list) {
    list.replaceChildren();
    concerts.slice(1).forEach((concert) => {
      const article = document.createElement('article');
      const time = document.createElement('time');
      const day = document.createElement('strong');
      day.textContent = concert.day || '—';
      const dateMeta = document.createElement('span');
      dateMeta.className = 'date-meta';
      const month = document.createElement('b');
      month.textContent = monthLabel(concert.month, language);
      const year = document.createElement('small');
      year.textContent = concert.year;
      dateMeta.append(month, year);
      time.append(day, dateMeta);
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = concertName(concert);
      details.append(title);
      const meta = [concert.time ? `${concert.time}h` : '', concert.location].filter(Boolean).join(' · ');
      if (meta) { const paragraph = document.createElement('p'); paragraph.textContent = meta; details.append(paragraph); }
      const status = document.createElement('span');
      status.textContent = ({ ca:'Pròximament', en:'Coming soon', fr:'Prochainement', it:'Prossimamente' })[language] || 'Próximamente';
      article.append(time, details, status);
      list.append(article);
    });
  }
}

function monthLabel(month, language = 'es') {
  const date = new Date(`2026-${month}-01T12:00:00`);
  return new Intl.DateTimeFormat(language, { month:'short' }).format(date).replace('.', '').toUpperCase();
}

function renderNavyContent(content) {
  navyContent = structuredClone(content);
  navyContent.links = (navyContent.links || []).filter((link) => link.id !== 'drive');
  if (navyContent.ensembles?.['cor-band']) navyContent.ensembles['cor-band'].links = (navyContent.ensembles['cor-band'].links || []).filter((link) => link.id !== 'cor-band-drive');
  const vocals = navyContent.home?.members?.find((member) => member.id === 'vocals');
  if (vocals) Object.assign(vocals, { title:'Aina, Candela y Mariona Escobedo', dialogTitle:'Aina, Candela y Mariona Escobedo' });
  const bass = navyContent.home?.members?.find((member) => member.id === 'bass');
  if (bass) Object.assign(bass, { title:'Emma', dialogTitle:'Emma' });
  const featuredConcert = navyContent.home?.concerts?.find((concert) => concert.id === 'sagrera-2026');
  if (featuredConcert) featuredConcert.time = '14:00';
  const calendarConcert = navyContent.events?.find((event) => event.id === 'concert-2026-11-21');
  if (calendarConcert) calendarConcert.time = '14:00';
  const normalRehearsal = navyContent.events?.find((event) => event.id === 'rehearsal-2026-11-13');
  if (normalRehearsal) Object.assign(normalRehearsal, { time:'17:30–19:30', location:'BCN Fusió Sant Andreu' });
  const extraRehearsal = navyContent.events?.find((event) => event.id === 'extra-2026-11-14');
  if (extraRehearsal) Object.assign(extraRehearsal, { time:'18:00–20:00', location:'BCN Fusió La Sagrera' });
  const generalRehearsal = navyContent.events?.find((event) => event.id === 'general-2026-11-20');
  if (generalRehearsal) Object.assign(generalRehearsal, { time:'17:30–19:30', location:'BCN Fusió Sant Andreu' });
  renderHomeContent(navyContent.home);
  renderSelectedEnsemble();
}

function theNaviesUpcomingEvents() {
  return navyContent?.events || [];
}

function renderSelectedEnsemble() {
  if (!navyContent) return;
  const content = selectedEnsemble === 'the-navies' ? { songs:navyContent.songs, events:theNaviesUpcomingEvents(), numbered:true } : { ...ensembleContent[selectedEnsemble], events:navyContent.ensembles?.[selectedEnsemble]?.events || ensembleContent[selectedEnsemble].events };
  renderSetlist(content.songs, content.numbered);
  renderEvents(content.events);
  const links = [];
  renderLinks(links);
  const usefulLinks = document.querySelector('.calendar-useful-links');
  if (usefulLinks) usefulLinks.hidden = links.length === 0;
  if (repertoireTitle) repertoireTitle.textContent = `${editorEnsembleNames[selectedEnsemble]} — ${repertoireTitle.dataset.concertTitle}`;
  document.querySelectorAll('[data-ensemble]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.ensemble === selectedEnsemble)));
}

async function loadNavyContent() {
  if (!portalApiUrl) return;
  try {
    const response = await fetch(`${portalApiUrl}/content`, { headers:{ Accept:'application/json' } });
    if (!response.ok) return;
    const result = await response.json();
    if (result.content) renderNavyContent(result.content);
  } catch (_) {
    /* El contenido incluido en el HTML permanece como respaldo. */
  }
}

function decorateScoreSongs() {
  const materialCopies = {
    es:{ lyrics:'Letra', chords:'Acordes', chordsAm:'Acordes Am', chordsC:'Acordes C', keyboard:'Teclado', bass:'Bajo', standard:'Estándar', violin:'Violín', viola:'Viola', general:'General' },
    ca:{ lyrics:'Lletra', chords:'Acords', chordsAm:'Acords Am', chordsC:'Acords C', keyboard:'Teclat', bass:'Baix', standard:'Estàndard', violin:'Violí', viola:'Viola', general:'General' },
    en:{ lyrics:'Lyrics', chords:'Chords', chordsAm:'Chords Am', chordsC:'Chords C', keyboard:'Keys', bass:'Bass', standard:'Standard', violin:'Violin', viola:'Viola', general:'General' },
    fr:{ lyrics:'Paroles', chords:'Accords', chordsAm:'Accords Am', chordsC:'Accords C', keyboard:'Clavier', bass:'Basse', standard:'Standard', violin:'Violon', viola:'Alto', general:'Général' },
    it:{ lyrics:'Testo', chords:'Accordi', chordsAm:'Accordi Am', chordsC:'Accordi C', keyboard:'Tastiere', bass:'Basso', standard:'Standard', violin:'Violino', viola:'Viola', general:'Generale' }
  };
  const labels = materialCopies[portalLanguage] || materialCopies.es;
  document.querySelectorAll('[data-score-song]').forEach((container) => {
    container.replaceChildren();
    const song = container.dataset.scoreSong;
    const songTitle = container.closest('.song-row').querySelector('strong').textContent;
    [...(scoreLibrary[song] || [])].sort(([firstKey], [secondKey]) => Number(secondKey === 'general') - Number(firstKey === 'general')).forEach(([labelKey, filename]) => {
      if (['general','chordsAm','chordsC'].includes(labelKey) && window.naviesCurrentMember?.() !== 'pauescobedo') return;
      const label = labels[labelKey] || labelKey;
      const source = `${scoreRoot}/${auxiliarySongIds.has(song) ? song : `the-navies/${song}`}/${filename}`;
      const item = document.createElement('span');
      item.className = 'score-file';
      const link = document.createElement('a');
      link.className = 'score-open';
      link.href = source;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `Abrir ${songTitle} · ${label}`);
      link.textContent = label;
      item.append(link);
      container.append(item);
    });
    if (song.startsWith('conjunt-de-cordes/')) return;
    const naviesLiveAudio = {
      'sweet-caroline':'the-navies/sweet-caroline-navies',
      'the-final-countdown':'the-navies/the-final-countdown-navies',
      'the-final-countdown-reprise':'the-navies/the-final-countdown-reprise-navies'
    };
    const audioId = naviesLiveAudio[song] || (song.includes('/') ? song : `the-navies/${song}`);
    const audioSource = `${audioRoot}/${audioId}.mp3`;
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
}
decorateScoreSongs();

const ensembleSwitcher = document.createElement('div');
ensembleSwitcher.className = 'ensemble-switcher';
ensembleSwitcher.setAttribute('aria-label', ({ es:'Seleccionar formación', ca:'Seleccionar formació', en:'Select ensemble', fr:'Sélectionner la formation', it:'Seleziona formazione' })[portalLanguage] || 'Seleccionar formación');
ensembleSwitcher.innerHTML = `<button type="button" data-ensemble="the-navies" aria-pressed="true">The Navies</button><button type="button" data-ensemble="cor-band" aria-pressed="false">Cor-Band</button><button type="button" data-ensemble="strings" aria-pressed="false">${ensembleCopy.strings}</button>`;
const dashboardTools = document.createElement('div');
dashboardTools.className = 'dashboard-tools';
const musycLaunch = document.createElement('button');
musycLaunch.className = 'musyc-launch';
musycLaunch.type = 'button';
musycLaunch.setAttribute('aria-label', 'Musync');
musycLaunch.title = 'Musync';
musycLaunch.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="3"/><path d="M16 5a11 11 0 0 1 11 11M16 27A11 11 0 0 1 5 16"/></svg>';
dashboardTools.append(musycLaunch, ensembleSwitcher);
dashboardBar?.append(dashboardTools);
ensembleSwitcher.addEventListener('click', (event) => {
  const button = event.target.closest('[data-ensemble]');
  if (!button || button.dataset.ensemble === selectedEnsemble) return;
  selectedEnsemble = button.dataset.ensemble;
  const grid = dashboard.querySelector('.dashboard-grid');
  grid.classList.add('ensemble-changing');
  window.setTimeout(() => {
    renderSelectedEnsemble();
    grid.classList.remove('ensemble-changing');
    grid.classList.add('ensemble-entering');
    window.setTimeout(() => grid.classList.remove('ensemble-entering'), 420);
  }, 160);
});

function syncEnsembleAccess() {
  const access = window.naviesMemberAccess?.() || [];
  const buttons = [...ensembleSwitcher.querySelectorAll('[data-ensemble]')];
  buttons.forEach((button) => { button.hidden = !access.includes(button.dataset.ensemble); });
  const available = buttons.filter((button) => !button.hidden);
  ensembleSwitcher.hidden = available.length <= 1;
  const grid = dashboard.querySelector('.dashboard-grid');
  if (grid) grid.hidden = available.length === 0;
  if (available.length && !access.includes(selectedEnsemble)) {
    selectedEnsemble = available[0].dataset.ensemble;
    renderSelectedEnsemble();
  }
}
window.addEventListener('navies-auth-change', () => { if (selectedEnsemble === 'the-navies') renderSelectedEnsemble(); });

const audioDialog = document.querySelector('#audio-dialog');
const audioPlayer = document.querySelector('#audio-player');
const audioDialogTitle = document.querySelector('#audio-dialog-title');
const audioDialogDownload = document.querySelector('#audio-dialog-download');
let navyAudioYieldingToSiteMusic = false;
audioPlayer.addEventListener('play', () => window.naviesPauseSiteMusicForNavyAudio?.());
audioPlayer.addEventListener('pause', () => {
  if (!navyAudioYieldingToSiteMusic) window.naviesResumeSiteMusicAfterNavyAudio?.();
});
audioPlayer.addEventListener('ended', () => window.naviesResumeSiteMusicAfterNavyAudio?.());
window.naviesStopNavyAudioForSiteMusic = () => {
  if (audioPlayer.paused) return false;
  navyAudioYieldingToSiteMusic = true;
  audioPlayer.pause();
  window.setTimeout(() => { navyAudioYieldingToSiteMusic = false; }, 0);
  return true;
};
document.addEventListener('click', (event) => {
  const button = event.target.closest('.audio-open');
  if (!button) return;
  audioDialogTitle.textContent = button.dataset.audioTitle;
  audioPlayer.src = button.dataset.audioSrc;
  audioDialogDownload.href = button.dataset.audioSrc;
  audioDialogDownload.setAttribute('download', '');
  audioDialog.showModal();
});
function closeAudioDialog() {
  navyAudioYieldingToSiteMusic = false;
  audioPlayer.pause();
  window.naviesResumeSiteMusicAfterNavyAudio?.();
  audioPlayer.removeAttribute('src');
  audioPlayer.load();
  audioDialog.close();
}
document.querySelector('.audio-dialog-close').addEventListener('click', closeAudioDialog);
audioDialog.addEventListener('click', (event) => { if (event.target === audioDialog) closeAudioDialog(); });

if (false) { // Musync original conservado como referencia; la interfaz activa vive en musync.js.
const musycCopy = ({
  es:{ library:'Tu biblioteca', album:'Álbum de The Navies', back:'Volver a Espacio Navy', play:'Reproducir', pause:'Pausar', previous:'Anterior', next:'Siguiente', volume:'Volumen', search:'Buscar canciones y listas', favorites:'Favoritos', playlists:'Listas', queue:'Cola', create:'Nueva lista', renamePlaylist:'Renombrar lista', playlistName:'Nombre de la lista', save:'Guardar', cancel:'Cancelar', addFavorite:'Añadir a favoritos', removeFavorite:'Quitar de favoritos', addQueue:'Añadir a la cola', addPlaylist:'Añadir a una lista', removePlaylist:'Quitar de la lista', deletePlaylist:'Eliminar lista', empty:'Todavía no hay canciones aquí.' },
  ca:{ library:'La teva biblioteca', album:'Àlbum de The Navies', back:'Tornar a Espai Navy', play:'Reproduir', pause:'Pausa', previous:'Anterior', next:'Següent', volume:'Volum', search:'Cercar cançons i llistes', favorites:'Preferides', playlists:'Llistes', queue:'Cua', create:'Nova llista', renamePlaylist:'Canviar el nom', playlistName:'Nom de la llista', save:'Desar', cancel:'Cancel·lar', addFavorite:'Afegir a preferides', removeFavorite:'Treure de preferides', addQueue:'Afegir a la cua', addPlaylist:'Afegir a una llista', removePlaylist:'Treure de la llista', deletePlaylist:'Eliminar llista', empty:'Encara no hi ha cançons aquí.' },
  en:{ library:'Your library', album:'The Navies album', back:'Back to Navy Space', play:'Play', pause:'Pause', previous:'Previous', next:'Next', volume:'Volume', search:'Search songs and playlists', favorites:'Favorites', playlists:'Playlists', queue:'Queue', create:'New playlist', renamePlaylist:'Rename playlist', playlistName:'Playlist name', save:'Save', cancel:'Cancel', addFavorite:'Add to favorites', removeFavorite:'Remove from favorites', addQueue:'Add to queue', addPlaylist:'Add to playlist', removePlaylist:'Remove from playlist', deletePlaylist:'Delete playlist', empty:'There are no songs here yet.' },
  fr:{ library:'Votre bibliothèque', album:'Album de The Navies', back:'Retour à l’Espace Navy', play:'Lecture', pause:'Pause', previous:'Précédent', next:'Suivant', volume:'Volume', search:'Rechercher chansons et playlists', favorites:'Favoris', playlists:'Playlists', queue:'File', create:'Nouvelle playlist', renamePlaylist:'Renommer la playlist', playlistName:'Nom de la playlist', save:'Enregistrer', cancel:'Annuler', addFavorite:'Ajouter aux favoris', removeFavorite:'Retirer des favoris', addQueue:'Ajouter à la file', addPlaylist:'Ajouter à une playlist', removePlaylist:'Retirer de la playlist', deletePlaylist:'Supprimer la playlist', empty:'Il n’y a pas encore de chansons ici.' },
  it:{ library:'La tua libreria', album:'Album dei The Navies', back:'Torna a Spazio Navy', play:'Riproduci', pause:'Pausa', previous:'Precedente', next:'Successivo', volume:'Volume', search:'Cerca brani e playlist', favorites:'Preferiti', playlists:'Playlist', queue:'Coda', create:'Nuova playlist', renamePlaylist:'Rinomina playlist', playlistName:'Nome della playlist', save:'Salva', cancel:'Annulla', addFavorite:'Aggiungi ai preferiti', removeFavorite:'Rimuovi dai preferiti', addQueue:'Aggiungi alla coda', addPlaylist:'Aggiungi a una playlist', removePlaylist:'Rimuovi dalla playlist', deletePlaylist:'Elimina playlist', empty:'Non ci sono ancora brani qui.' }
})[portalLanguage] || null;
const musycTracks = [
  { file:'shake-it-off', artist:'Taylor Swift', title:'Shake It Off', duration:219.246, buffered:true },
  { file:'baby-one-more-time', artist:'Britney Spears', title:'…Baby One More Time', duration:211.096, buffered:true },
  { file:'sweet-caroline', artist:'Neil Diamond', title:'Sweet Caroline', duration:203.64, buffered:true },
  { file:'dont-look-back-in-anger', artist:'Oasis', title:"Don’t Look Back in Anger", duration:289.62, buffered:true },
  { file:'the-final-countdown', artist:'Europe', title:'The Final Countdown', duration:311.304, buffered:true },
  { file:'have-you-ever-seen-the-rain', artist:'Creedence Clearwater Revival', title:'Have You Ever Seen the Rain?', duration:157.824, buffered:true },
  { file:'the-final-countdown-reprise', artist:'Europe', title:'The Final Countdown (Reprise)', duration:94.368, buffered:true }
];
const musycPage = document.createElement('section');
musycPage.className = 'page-view subpage musyc-page';
musycPage.id = 'page-musync';
musycPage.dataset.pageView = 'musync';
musycPage.hidden = true;
musycPage.innerHTML = `
  <div class="musyc-shell">
    <div class="musyc-layout">
      <article class="musyc-now reveal">
        <div class="musyc-cover"><img src="${window.__naviesForcedLanguage ? '../' : ''}assets/images/musync-cover.png?v=20261111-235" alt="The Navies"></div>
        <div class="musyc-now-copy"><h2 data-musyc-title></h2><p data-musyc-artist></p></div>
        <div class="musyc-progress"><span data-musyc-current>0:00</span><input data-musyc-progress type="range" min="0" max="1000" value="0" aria-label="Progreso"><span data-musyc-duration>0:00</span></div>
        <div class="musyc-controls">
          <button type="button" data-musyc-action="previous" aria-label="${musycCopy.previous}"><svg viewBox="0 0 24 24"><path d="m11 6-7 6 7 6V6Zm9 0-7 6 7 6V6Z"/></svg></button>
          <button class="musyc-main-control" type="button" data-musyc-action="toggle" aria-label="${musycCopy.play}"><svg class="musyc-play" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7V5Z"/></svg><svg class="musyc-pause" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>
          <button type="button" data-musyc-action="next" aria-label="${musycCopy.next}"><svg viewBox="0 0 24 24"><path d="m4 6 7 6-7 6V6Zm9 0 7 6-7 6V6Z"/></svg></button>
        </div>
        <label class="musyc-volume"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm12.2 1.1a3 3 0 0 1 0 3.8m2.6-6.4a6.5 6.5 0 0 1 0 9"/></svg><span class="sr-only">${musycCopy.volume}</span><input data-musyc-volume type="range" min="0" max="1" step="0.01" value="1"></label>
        <audio class="musyc-audio" data-musyc-deck="a" preload="auto" playsinline></audio>
        <audio class="musyc-audio" data-musyc-deck="b" preload="auto" playsinline></audio>
      </article>
      <section class="musyc-library musyc-album reveal"><div class="musyc-library-head"><p class="eyebrow light"><span></span>THE NAVIES</p><h2>${musycCopy.album}</h2></div><div class="musyc-track-list"></div></section>
      <aside class="musyc-personal reveal">
        <div class="musyc-personal-head"><p class="eyebrow light"><span></span>MUSYNC</p><h2>${musycCopy.library}</h2></div>
        <label class="musyc-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input type="search" data-musyc-search placeholder="${musycCopy.search}" autocomplete="off"></label>
        <div class="musyc-library-tabs"><button type="button" data-musyc-view="lists" aria-pressed="true">♫ ${musycCopy.playlists}</button><button type="button" data-musyc-view="queue" aria-pressed="false">≡ ${musycCopy.queue}</button></div>
        <div class="musyc-personal-title"><strong>${musycCopy.playlists}</strong><button type="button" data-musyc-create aria-label="${musycCopy.create}">＋</button></div>
        <div class="musyc-playlist-list"></div>
        <div class="musyc-personal-tracks"></div>
      </aside>
    </div>
    <dialog class="musyc-playlist-dialog"><form method="dialog"><h2 data-musyc-playlist-title>${musycCopy.create}</h2><input data-musyc-playlist-name placeholder="${musycCopy.playlistName}" maxlength="36" autocomplete="off"><div><button value="cancel">${musycCopy.cancel}</button><button value="default" data-musyc-playlist-save>${musycCopy.save}</button></div></form></dialog>
    <div class="musyc-track-menu" hidden></div>
  </div>`;
document.querySelector('#page-espacio-navy')?.after(musycPage);
window.naviesRegisterPageView?.(musycPage);
const musycFooterBack = document.createElement('button');
musycFooterBack.type = 'button';
musycFooterBack.className = 'musyc-footer-back';
musycFooterBack.innerHTML = `<span>←</span>${musycCopy.back}`;
document.querySelector('footer .season-control')?.prepend(musycFooterBack);
musycFooterBack.addEventListener('click', () => window.naviesOpenRoute?.('espacio-navy'));

const musycDecks = [...musycPage.querySelectorAll('.musyc-audio')];
let musycAudio = musycDecks[0];
let musycStandbyAudio = musycDecks[1];
const musycTitle = musycPage.querySelector('[data-musyc-title]');
const musycArtist = musycPage.querySelector('[data-musyc-artist]');
const musycProgress = musycPage.querySelector('[data-musyc-progress]');
const musycCurrent = musycPage.querySelector('[data-musyc-current]');
const musycDuration = musycPage.querySelector('[data-musyc-duration]');
const musycToggle = musycPage.querySelector('[data-musyc-action="toggle"]');
const musycList = musycPage.querySelector('.musyc-track-list');
const musycPersonalTracks = musycPage.querySelector('.musyc-personal-tracks');
const musycPlaylistList = musycPage.querySelector('.musyc-playlist-list');
const musycTrackMenu = musycPage.querySelector('.musyc-track-menu');
const musycPlaylistDialog = musycPage.querySelector('.musyc-playlist-dialog');
const musycSearch = musycPage.querySelector('[data-musyc-search]');
let musycIndex = -1;
let musycChangingTrack = false;
let musycYieldingToSiteMusic = false;
const musycSource = (track) => `${window.__naviesForcedLanguage ? '../' : ''}audios/the-navies/${track.file}.mp3?v=20261111-267`;
const musycBlobSources = new Map();
const musycBlobRequests = new Map();
async function resolvedMusycSource(track) {
  if (!track.buffered) return musycSource(track);
  if (musycBlobSources.has(track.file)) return musycBlobSources.get(track.file);
  if (!musycBlobRequests.has(track.file)) {
    musycBlobRequests.set(track.file, fetch(musycSource(track), { cache:'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Audio ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        musycBlobSources.set(track.file, url);
        return url;
      }));
  }
  return musycBlobRequests.get(track.file);
}
async function prepareMusycDeck(deck, index) {
  const track = musycTracks[index];
  const source = await resolvedMusycSource(track);
  deck.src = source;
  deck.dataset.trackIndex = String(index);
  deck.load();
}
const musycTime = (seconds) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}` : '0:00';
const musycSeekDuration = () => {
  if (Number.isFinite(musycAudio.duration) && musycAudio.duration > 0) return musycAudio.duration;
  if (musycAudio.seekable?.length) return musycAudio.seekable.end(musycAudio.seekable.length - 1);
  return musycTracks[musycIndex]?.duration || 0;
};

function paintMusycRange(input, ratio) {
  input.style.setProperty('--range-progress', `${Math.max(0, Math.min(1, ratio)) * 100}%`);
}

const musycMemberKey = () => window.naviesCurrentMember?.() || 'member';
const emptyMusycState = () => ({ favorites:[], queue:[], playlists:{}, volume:1 });
function loadMusycState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(`the-navies-musync-${musycMemberKey()}`));
    return { ...emptyMusycState(), ...(parsed || {}), playlists:{ ...(parsed?.playlists || {}) } };
  } catch (_) { return emptyMusycState(); }
}
let musycState = loadMusycState();
let musycLibraryView = 'lists';
let musycSelectedPlaylist = '__favorites__';
let musycEditingPlaylist = '';
function saveMusycState() {
  localStorage.setItem(`the-navies-musync-${musycMemberKey()}`, JSON.stringify(musycState));
}
const escapeMusycText = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
function musycTrackMarkup(track, index, compact = false) {
  return `<div class="musyc-track${compact ? ' is-compact' : ''}" data-musyc-track="${index}">
    <button class="musyc-track-number" type="button" data-musyc-play="${index}" aria-label="${musycCopy.play} ${track.title}"><span>${String(index + 1).padStart(2,'0')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"/></svg></button>
    <button class="musyc-track-copy" type="button" data-musyc-play="${index}"><strong>${track.title}</strong><small>${track.artist}</small></button>
    <button class="musyc-track-more" type="button" data-musyc-menu="${index}" aria-label="Más opciones"><span></span><span></span><span></span></button>
  </div>`;
}
function renderMusycAlbum() {
  const query = musycSearch.value.trim().toLocaleLowerCase();
  musycList.innerHTML = musycTracks.map((track,index) => ({track,index})).filter(({track}) => !query || `${track.title} ${track.artist}`.toLocaleLowerCase().includes(query)).map(({track,index}) => musycTrackMarkup(track,index)).join('');
}
function syncMusycMarquees() {
  requestAnimationFrame(() => musycPage.querySelectorAll('.musyc-track-copy strong').forEach((label) => {
    label.classList.remove('is-scrolling');
    label.style.removeProperty('--musyc-track-shift');
    const host = label.parentElement;
    const overflow = Math.ceil(label.scrollWidth - host.clientWidth);
    if (overflow > 4) {
      label.style.setProperty('--musyc-track-shift', `${overflow}px`);
      label.classList.add('is-scrolling');
    }
  }));
}
function currentMusycIndexes() {
  const query = musycSearch.value.trim().toLocaleLowerCase();
  if (query) return musycTracks.map((track,index) => ({track,index})).filter(({track}) => `${track.title} ${track.artist}`.toLocaleLowerCase().includes(query)).map(({index}) => index);
  if (musycLibraryView === 'queue') return musycState.queue;
  if (musycSelectedPlaylist === '__favorites__') return musycState.favorites;
  return musycState.playlists[musycSelectedPlaylist] || [];
}
function renderMusycPersonal() {
  musycPage.querySelectorAll('[data-musyc-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.musycView === musycLibraryView)));
  musycPage.querySelector('.musyc-personal').classList.toggle('is-queue-view', musycLibraryView === 'queue');
  const query = musycSearch.value.trim().toLocaleLowerCase();
  const customLists = Object.keys(musycState.playlists).filter((name) => !query || name.toLocaleLowerCase().includes(query));
  const favoritesVisible = !query || musycCopy.favorites.toLocaleLowerCase().includes(query);
  musycPlaylistList.innerHTML = `${favoritesVisible ? `<div class="musyc-playlist-row is-fixed"><button type="button" data-musyc-playlist="__favorites__" class="${musycLibraryView === 'lists' && musycSelectedPlaylist === '__favorites__' ? 'is-active' : ''}"><span>♥</span><strong>${musycCopy.favorites}</strong><small>${musycState.favorites.length}</small></button></div>` : ''}${customLists.map((name) => `<div class="musyc-playlist-row"><button type="button" data-musyc-playlist="${encodeURIComponent(name)}" class="${musycLibraryView === 'lists' && musycSelectedPlaylist === name ? 'is-active' : ''}"><span>♫</span><strong>${escapeMusycText(name)}</strong><small>${musycState.playlists[name].length}</small></button><button class="musyc-playlist-more" type="button" data-musyc-playlist-menu="${encodeURIComponent(name)}" aria-label="${musycCopy.renamePlaylist}"><span></span><span></span><span></span></button></div>`).join('')}`;
  const indexes = currentMusycIndexes();
  musycPersonalTracks.innerHTML = indexes.length ? indexes.map((index) => musycTrackMarkup(musycTracks[index],index,true)).join('') : `<p class="musyc-empty">${musycCopy.empty}</p>`;
  syncMusycMarquees();
}
function renderMusycCollections() { renderMusycAlbum(); renderMusycPersonal(); syncMusycUI(); syncMusycMarquees(); }
renderMusycCollections();

function syncMusycUI() {
  const track = musycTracks[musycIndex];
  musycTitle.textContent = track?.title || '';
  musycArtist.textContent = track?.artist || '';
  musycPage.querySelector('.musyc-now').classList.toggle('is-empty', !track);
  if (!track) {
    musycCurrent.textContent = '0:00';
    musycDuration.textContent = '0:00';
    musycProgress.value = '0';
    paintMusycRange(musycProgress, 0);
  }
  musycPage.querySelectorAll('[data-musyc-track]').forEach((button) => button.classList.toggle('is-active', Number(button.dataset.musycTrack) === musycIndex));
  const playing = Boolean(track) && !musycAudio.paused;
  musycToggle.classList.toggle('is-playing', playing);
  musycToggle.setAttribute('aria-label', playing ? musycCopy.pause : musycCopy.play);
}

async function playMusyc(index = (musycIndex >= 0 ? musycIndex : 0)) {
  musycChangingTrack = true;
  const nextIndex = (index + musycTracks.length) % musycTracks.length;
  const outgoingAudio = musycAudio;
  const incomingAudio = musycStandbyAudio;
  if (Number(incomingAudio.dataset.trackIndex) !== nextIndex) {
    await prepareMusycDeck(incomingAudio, nextIndex);
  }
  incomingAudio.volume = Number(musycVolume?.value || 1);
  incomingAudio.currentTime = 0;
  musycIndex = nextIndex;
  musycAudio = incomingAudio;
  musycStandbyAudio = outgoingAudio;
  musycDuration.textContent = musycTime(musycTracks[musycIndex].duration);
  syncMusycUI();
  try {
    await incomingAudio.play();
    outgoingAudio.pause();
    outgoingAudio.currentTime = 0;
    const preloadIndex = (musycIndex + 1) % musycTracks.length;
    prepareMusycDeck(musycStandbyAudio, preloadIndex).catch(() => {});
  } catch (_) {
    musycAudio = outgoingAudio;
    musycStandbyAudio = incomingAudio;
  }
  musycChangingTrack = false;
  syncMusycUI();
}

musycPage.addEventListener('click', (event) => {
  const playButton = event.target.closest('[data-musyc-play]');
  if (playButton) {
    const index = Number(playButton.dataset.musycPlay);
    if (musycLibraryView === 'queue' && playButton.closest('.musyc-personal')) {
      const position = musycState.queue.indexOf(index);
      if (position >= 0) musycState.queue.splice(position,1);
      saveMusycState(); renderMusycPersonal();
    }
    return playMusyc(index);
  }
  const menuButton = event.target.closest('[data-musyc-menu]');
  if (menuButton) {
    const index = Number(menuButton.dataset.musycMenu);
    const favorite = musycState.favorites.includes(index);
    const bounds = menuButton.getBoundingClientRect();
    musycTrackMenu.innerHTML = `<button type="button" data-musyc-menu-action="favorite" data-index="${index}">${favorite ? musycCopy.removeFavorite : musycCopy.addFavorite}</button><button type="button" data-musyc-menu-action="queue" data-index="${index}">${musycCopy.addQueue}</button>${Object.keys(musycState.playlists).length ? `<span>${musycCopy.addPlaylist}</span>${Object.keys(musycState.playlists).map((name) => { const included = musycState.playlists[name].includes(index); return `<button type="button" data-musyc-menu-action="playlist" data-index="${index}" data-playlist="${encodeURIComponent(name)}">${included ? '−' : '+'} ${escapeMusycText(name)}</button>`; }).join('')}` : ''}`;
    musycTrackMenu.style.left = `${Math.min(bounds.left, window.innerWidth - 230)}px`;
    musycTrackMenu.hidden = false;
    musycTrackMenu.style.top = `${Math.max(12, Math.min(bounds.bottom + 7, window.innerHeight - musycTrackMenu.scrollHeight - 20))}px`;
    return;
  }
  const playlistMenuButton = event.target.closest('[data-musyc-playlist-menu]');
  if (playlistMenuButton) {
    const name = decodeURIComponent(playlistMenuButton.dataset.musycPlaylistMenu);
    const bounds = playlistMenuButton.getBoundingClientRect();
    musycTrackMenu.innerHTML = `<button type="button" data-musyc-menu-action="playlist-rename" data-playlist="${encodeURIComponent(name)}">${musycCopy.renamePlaylist}</button><button type="button" data-musyc-menu-action="playlist-delete" data-playlist="${encodeURIComponent(name)}">${musycCopy.deletePlaylist}</button>`;
    musycTrackMenu.style.left = `${Math.min(bounds.left, window.innerWidth - 230)}px`;
    musycTrackMenu.hidden = false;
    musycTrackMenu.style.top = `${Math.max(12, Math.min(bounds.bottom + 7, window.innerHeight - musycTrackMenu.scrollHeight - 20))}px`;
    return;
  }
  const playlistButton = event.target.closest('[data-musyc-playlist]');
  if (playlistButton) {
    musycLibraryView = 'lists';
    musycSelectedPlaylist = playlistButton.dataset.musycPlaylist === '__favorites__' ? '__favorites__' : decodeURIComponent(playlistButton.dataset.musycPlaylist);
    renderMusycPersonal();
    return;
  }
  if (!event.target.closest('.musyc-track-menu')) musycTrackMenu.hidden = true;
});
musycTrackMenu.addEventListener('click', (event) => {
  const action = event.target.closest('[data-musyc-menu-action]');
  if (!action) return;
  if (action.dataset.musycMenuAction === 'playlist-rename') {
    musycEditingPlaylist = decodeURIComponent(action.dataset.playlist);
    musycPlaylistDialog.querySelector('[data-musyc-playlist-title]').textContent = musycCopy.renamePlaylist;
    const input = musycPlaylistDialog.querySelector('[data-musyc-playlist-name]');
    input.value = musycEditingPlaylist;
    musycTrackMenu.hidden = true;
    musycPlaylistDialog.showModal();
    requestAnimationFrame(() => { input.focus(); input.select(); });
    return;
  }
  if (action.dataset.musycMenuAction === 'playlist-delete') {
    const name = decodeURIComponent(action.dataset.playlist);
    delete musycState.playlists[name];
    if (musycSelectedPlaylist === name) musycSelectedPlaylist = '__favorites__';
    saveMusycState(); musycTrackMenu.hidden = true; renderMusycPersonal();
    return;
  }
  const index = Number(action.dataset.index);
  if (action.dataset.musycMenuAction === 'favorite') musycState.favorites = musycState.favorites.includes(index) ? musycState.favorites.filter((item) => item !== index) : [...musycState.favorites,index];
  if (action.dataset.musycMenuAction === 'queue') musycState.queue.push(index);
  if (action.dataset.musycMenuAction === 'playlist') {
    const name = decodeURIComponent(action.dataset.playlist);
    musycState.playlists[name] = musycState.playlists[name].includes(index) ? musycState.playlists[name].filter((item) => item !== index) : [...musycState.playlists[name],index];
  }
  saveMusycState();
  musycTrackMenu.hidden = true;
  renderMusycCollections();
});
musycPage.querySelectorAll('[data-musyc-view]').forEach((button) => button.addEventListener('click', () => { musycLibraryView = button.dataset.musycView; if (musycLibraryView === 'lists' && !musycSelectedPlaylist) musycSelectedPlaylist = '__favorites__'; renderMusycPersonal(); }));
musycSearch.addEventListener('input', renderMusycCollections);
musycPage.querySelector('[data-musyc-create]').addEventListener('click', () => {
  musycEditingPlaylist = '';
  musycPlaylistDialog.querySelector('[data-musyc-playlist-title]').textContent = musycCopy.create;
  musycPlaylistDialog.querySelector('[data-musyc-playlist-name]').value = '';
  musycPlaylistDialog.showModal();
  requestAnimationFrame(() => musycPlaylistDialog.querySelector('input').focus());
});
musycPlaylistDialog.querySelector('[data-musyc-playlist-save]').addEventListener('click', (event) => {
  const input = musycPlaylistDialog.querySelector('[data-musyc-playlist-name]');
  const name = input.value.trim();
  if (!name) { event.preventDefault(); return input.focus(); }
  if (musycEditingPlaylist && name !== musycEditingPlaylist) {
    if (musycState.playlists[name]) { event.preventDefault(); input.focus(); return; }
    musycState.playlists[name] = musycState.playlists[musycEditingPlaylist] || [];
    delete musycState.playlists[musycEditingPlaylist];
  } else if (!musycState.playlists[name]) musycState.playlists[name] = [];
  saveMusycState(); input.value = ''; musycLibraryView = 'lists'; musycSelectedPlaylist = name; renderMusycPersonal();
  musycEditingPlaylist = '';
});
musycPage.querySelector('[data-musyc-action="previous"]').addEventListener('click', () => playMusyc(musycIndex > 0 ? musycIndex - 1 : 0));
function nextMusycIndex() {
  if (!musycState.queue.length) return musycIndex >= 0 ? musycIndex + 1 : 0;
  const next = musycState.queue.shift(); saveMusycState(); renderMusycPersonal(); return next;
}
musycPage.querySelector('[data-musyc-action="next"]').addEventListener('click', () => playMusyc(nextMusycIndex()));
musycToggle.addEventListener('click', () => {
  if (musycIndex < 0 || (!musycAudio.currentSrc && !musycAudio.src)) return playMusyc(0);
  if (musycAudio.paused) musycAudio.play().catch(() => {});
  else musycAudio.pause();
});
const musycVolume = musycPage.querySelector('[data-musyc-volume]');
musycVolume.value = String(Number.isFinite(Number(musycState.volume)) ? musycState.volume : 1);
musycDecks.forEach((deck) => { deck.volume = Number(musycVolume.value); });
musycVolume.addEventListener('input', (event) => {
  musycAudio.volume = Number(event.target.value);
  musycState.volume = Number(event.target.value);
  saveMusycState();
  paintMusycRange(event.target, musycAudio.volume);
});
const seekMusyc = () => {
  const duration = musycSeekDuration();
  if (!duration) return;
  const target = (Number(musycProgress.value) / 1000) * duration;
  musycAudio.currentTime = target;
  musycCurrent.textContent = musycTime(target);
  paintMusycRange(musycProgress, Number(musycProgress.value) / 1000);
};
musycProgress.addEventListener('input', seekMusyc);
musycProgress.addEventListener('change', seekMusyc);
musycDecks.forEach((deck) => {
  deck.addEventListener('loadedmetadata', () => { if (deck === musycAudio) musycDuration.textContent = musycTime(musycSeekDuration()); });
  deck.addEventListener('durationchange', () => { if (deck === musycAudio) musycDuration.textContent = musycTime(musycSeekDuration()); });
  deck.addEventListener('timeupdate', () => {
    if (deck !== musycAudio) return;
    musycCurrent.textContent = musycTime(musycAudio.currentTime);
    const duration = musycSeekDuration();
    if (duration > 0) {
      const ratio = musycAudio.currentTime / duration;
      musycProgress.value = String(Math.round(ratio * 1000));
      paintMusycRange(musycProgress, ratio);
    }
  });
  deck.addEventListener('play', () => { if (deck === musycAudio) window.naviesPauseSiteMusicForNavyAudio?.(); syncMusycUI(); });
  deck.addEventListener('pause', () => { if (deck === musycAudio && !musycChangingTrack && !musycYieldingToSiteMusic) window.naviesResumeSiteMusicAfterNavyAudio?.(); syncMusycUI(); });
  deck.addEventListener('ended', () => { if (deck === musycAudio) playMusyc(nextMusycIndex()); });
});
syncMusycUI();
paintMusycRange(musycProgress, 0);
paintMusycRange(musycVolume, Number(musycVolume.value));

const stopOriginalNavyAudioForSiteMusic = window.naviesStopNavyAudioForSiteMusic;
window.naviesStopNavyAudioForSiteMusic = () => {
  const stoppedOriginal = stopOriginalNavyAudioForSiteMusic?.() === true;
  if (musycAudio.paused) return stoppedOriginal;
  musycYieldingToSiteMusic = true;
  musycAudio.pause();
  window.setTimeout(() => { musycYieldingToSiteMusic = false; }, 0);
  return true;
};

musycLaunch.addEventListener('click', () => {
  musycTracks.filter((track) => track.buffered).forEach((track) => resolvedMusycSource(track).catch(() => {}));
  window.naviesOpenRoute?.('musync');
});

function syncMusyncAccess() {
  const isLoggedIn = Boolean(window.naviesCurrentMember?.());
  musycState = loadMusycState();
  musycVolume.value = String(Number.isFinite(Number(musycState.volume)) ? musycState.volume : 1);
  musycDecks.forEach((deck) => { deck.volume = Number(musycVolume.value); });
  paintMusycRange(musycVolume, Number(musycVolume.value));
  renderMusycCollections();
  musycLaunch.hidden = !isLoggedIn;
  if (location.hash !== '#musync') return;
  requestAnimationFrame(() => window.naviesOpenRoute?.(isLoggedIn ? 'musync' : 'espacio-navy', false));
}
window.addEventListener('navies-auth-change', syncMusyncAccess);
window.addEventListener('navies-route-change', (event) => {
  if (event.detail?.route !== 'musync' && !musycAudio.paused) musycAudio.pause();
});
syncMusyncAccess();
}

const editContentButton = document.createElement('a');
editContentButton.className = 'content-editor-trigger';
editContentButton.href = '#edicion';
editContentButton.textContent = editorText.siteEditing;
editContentButton.hidden = true;
document.querySelector('#main-nav [data-route="espacio-navy"]')?.after(editContentButton);

const contentEditor = document.createElement('section');
contentEditor.className = 'content-editor';
contentEditor.hidden = true;
contentEditor.innerHTML = `
  <div class="content-editor-shell">
    <header class="content-editor-header">
      <div><p class="eyebrow"><span></span> THE NAVIES</p><h2>${editorText.siteEditing}</h2></div>
      <div class="content-editor-controls">
        <button class="content-editor-mobile-toggle" type="button" aria-expanded="false"><span>${editorText.home}</span><i aria-hidden="true"></i></button>
        <nav class="content-editor-tabs"><button type="button" data-editor-tab="home" aria-pressed="true">${editorText.home}</button><button type="button" data-editor-tab="space" aria-pressed="false">${editorText.space}</button><button type="button" data-editor-tab="general" aria-pressed="false">${editorText.general}</button></nav>
      </div>
    </header>
    <form class="content-editor-form" id="content-editor-form">
      <div class="editor-workspace">
      <div class="editor-side-rail">
        <aside class="editor-section-nav" role="navigation" aria-label="Secciones de edición"></aside>
        <button class="editor-save" type="submit" aria-label="${editorText.save}" title="${editorText.save}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.75h11.6L20.25 7.4v12.85H3.75V3.75H5Zm2.25 0v5.5h9.5v-5.5M7 20.25v-7.5h10v7.5M9.5 5.5h4.75"/></svg><span class="sr-only">${editorText.save}</span></button>
        <p class="content-editor-status" aria-live="polite"></p>
      </div>
      <div class="editor-pages">
      <div class="editor-page" data-editor-page="home">
      <section class="editor-section">
        <div class="editor-section-head"><div><span>01</span><h3>${editorText.mainTexts}</h3><p>${editorText.mainTextsCopy}</p></div></div>
        <div class="editor-text-grid" data-editor-home-texts></div>
      </section>
      <section class="editor-section">
        <div class="editor-section-head"><div><span>02</span><h3>${editorText.concerts}</h3><p>${editorText.concertsCopy}</p></div><button type="button" data-editor-add="concert">${editorText.addConcert}</button></div>
        <div class="editor-list" data-editor-list="concerts"></div>
      </section>
      <section class="editor-section">
        <div class="editor-section-head"><div><span>03</span><h3>${editorText.members}</h3><p>${editorText.membersCopy}</p></div></div>
        <div class="editor-list" data-editor-list="members"></div>
      </section>
      <section class="editor-section">
        <div class="editor-section-head"><div><span>04</span><h3>${editorText.socialNetworks}</h3><p>${editorText.socialNetworksCopy}</p></div><button type="button" data-editor-add="social">${editorText.addSocial}</button></div>
        <div class="editor-list" data-editor-list="socials"></div>
      </section>
      </div>
      <div class="editor-page" data-editor-page="space" hidden>
      <section class="editor-section editor-ensemble-section">
        <div class="editor-section-head"><div><span>00</span><h3>${editorText.ensembleEditing}</h3><p>${editorText.ensembleEditingCopy}</p></div></div>
        <div class="editor-ensemble-picker">
          <button class="editor-ensemble-toggle" type="button" aria-expanded="false"><i aria-hidden="true"></i><span data-editor-ensemble-current>The Navies</span></button>
          <div class="editor-ensemble-menu" aria-hidden="true" inert><button type="button" data-editor-ensemble="the-navies">The Navies</button><button type="button" data-editor-ensemble="cor-band">Cor-Band</button><button type="button" data-editor-ensemble="strings">${ensembleCopy.strings}</button></div>
        </div>
      </section>
      <section class="editor-section">
        <div class="editor-section-head"><div><span>01</span><h3>${editorText.dates}</h3><p>${editorText.datesCopy}</p></div><button type="button" data-editor-add="event">${editorText.addDate}</button></div>
        <div class="editor-list" data-editor-list="events"></div>
      </section>
      <section class="editor-section">
        <div class="editor-section-head"><div><span>02</span><h3>${editorText.setlist}</h3><p>${editorText.setlistCopy}</p></div><button type="button" data-editor-add="song">${editorText.addSong}</button></div>
        <div class="editor-list" data-editor-list="songs"></div>
      </section>
      <section class="editor-section" hidden>
        <div class="editor-section-head"><div><span>03</span><h3>${editorText.links}</h3><p>${editorText.linksCopy}</p></div><button type="button" data-editor-add="link">${editorText.addLink}</button></div>
        <div class="editor-list" data-editor-list="links"></div>
      </section>
      </div>
      <div class="editor-page" data-editor-page="general" hidden>
        <section class="editor-section"><div class="editor-section-head"><div><span>01</span><h3>${editorText.siteProperties}</h3><p>${editorText.generalCopy}</p></div></div><div class="editor-settings" data-editor-settings></div></section>
        <section class="editor-section"><div class="editor-section-head"><div><span>02</span><h3>${editorText.users}</h3><p>${editorText.usersCopy}</p></div><button type="button" data-editor-add="user">${editorText.addUser}</button></div><div class="editor-list" data-editor-list="users"></div></section>
      </div>
      </div>
      </div>
    </form>
  </div>
  <dialog class="editor-exit-dialog" aria-labelledby="editor-exit-title">
    <div class="editor-exit-panel">
      <p class="eyebrow"><span></span> THE NAVIES</p>
      <h2 id="editor-exit-title">${editorText.unsavedTitle}</h2>
      <p>${editorText.unsavedCopy}</p>
      <div class="editor-exit-actions">
        <button type="button" class="editor-exit-save" data-editor-exit="save">${editorText.saveAndExit}</button>
        <button type="button" class="editor-exit-discard" data-editor-exit="discard">${editorText.exitWithoutSaving}</button>
        <button type="button" class="editor-exit-cancel" data-editor-exit="cancel">${editorText.returnToEditing}</button>
      </div>
    </div>
  </dialog>`;
document.querySelector('.space-shell').append(contentEditor);

const editorForm = contentEditor.querySelector('.content-editor-form');
const editorStatus = contentEditor.querySelector('.content-editor-status');
const editorSectionNav = contentEditor.querySelector('.editor-section-nav');
const editorSideRail = contentEditor.querySelector('.editor-side-rail');
const editorMobileToggle = contentEditor.querySelector('.content-editor-mobile-toggle');
const editorTabs = contentEditor.querySelector('.content-editor-tabs');
const editorExitDialog = contentEditor.querySelector('.editor-exit-dialog');
let editorStatusTimer;
let editorDirty = false;
let editorBaselineSnapshot = '';
let editorSpaceEnsemble = 'the-navies';
let editorEnsembleDrafts = { 'the-navies':[], 'cor-band':[], strings:[] };
let editorEnsembleLinkDrafts = { 'the-navies':[], 'cor-band':[], strings:[] };
let updateEditorSectionActive = () => {};
let editorSectionScrollFrame = null;
let editorSectionPendingIndex = null;
let editorSectionPendingTimer = null;

function syncEditorSectionNav(pageName) {
  const page = contentEditor.querySelector(`[data-editor-page="${pageName}"]`);
  if (!page) return;
  window.clearTimeout(editorSectionPendingTimer);
  editorSectionPendingIndex = null;
  const sections = [...page.querySelectorAll(':scope > .editor-section')].filter((section) => !section.hidden);
  const buttons = sections.map((section, index) => {
    const number = section.querySelector('.editor-section-head span')?.textContent || String(index + 1).padStart(2, '0');
    const label = section.querySelector('h3')?.textContent || number;
    section.id = `editor-${pageName}-${number}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = number;
    button.setAttribute('aria-label', label);
    button.dataset.label = label;
    button.classList.toggle('is-active', index === 0);
    button.addEventListener('click', () => {
      editorSectionPendingIndex = index;
      window.clearTimeout(editorSectionPendingTimer);
      editorSectionPendingTimer = window.setTimeout(() => {
        editorSectionPendingIndex = null;
        updateEditorSectionActive();
      }, 1400);
      buttons.forEach((item, buttonIndex) => item.classList.toggle('is-active', buttonIndex === index));
      if (index === 0) {
        window.scrollTo({ top:0, behavior:'smooth' });
      } else {
        const targetTop = window.scrollY + section.getBoundingClientRect().top;
        const movingUp = targetTop < window.scrollY;
        const offset = movingUp ? 112 : 20;
        window.scrollTo({ top:targetTop - offset, behavior:'smooth' });
      }
    });
    return button;
  });
  editorSectionNav.replaceChildren(...buttons);
  updateEditorSectionActive = () => {
    if (!contentEditorOpen || page.hidden) return;
    const railTop = editorSideRail?.getBoundingClientRect().top || 0;
    const guide = Math.max(railTop + 12, 28);
    if (editorSectionPendingIndex !== null) {
      buttons.forEach((button, index) => button.classList.toggle('is-active', index === editorSectionPendingIndex));
      return;
    }
    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= guide) activeIndex = index;
    });
    const pageBottom = window.scrollY + window.innerHeight;
    const documentBottom = document.documentElement.scrollHeight;
    const lastSectionBottom = sections.at(-1)?.getBoundingClientRect().bottom || 0;
    if (pageBottom >= documentBottom - 4 || (window.scrollY > 8 && lastSectionBottom <= window.innerHeight - 12)) activeIndex = sections.length - 1;
    buttons.forEach((button, index) => button.classList.toggle('is-active', index === activeIndex));
  };
  requestAnimationFrame(updateEditorSectionActive);
}

window.addEventListener('scroll', () => {
  if (editorSectionScrollFrame !== null) return;
  editorSectionScrollFrame = requestAnimationFrame(() => {
    updateEditorSectionActive();
    editorSectionScrollFrame = null;
  });
}, { passive:true });

window.addEventListener('scrollend', () => {
  if (editorSectionPendingIndex === null) return;
  window.clearTimeout(editorSectionPendingTimer);
  editorSectionPendingIndex = null;
  updateEditorSectionActive();
}, { passive:true });

window.addEventListener('resize', () => requestAnimationFrame(updateEditorSectionActive), { passive:true });

function syncEditorEnsemblePicker() {
  const picker = contentEditor.querySelector('.editor-ensemble-picker');
  if (!picker) return;
  picker.querySelector('[data-editor-ensemble-current]').textContent = editorEnsembleNames[editorSpaceEnsemble];
  picker.querySelectorAll('[data-editor-ensemble]').forEach((button) => {
    button.hidden = button.dataset.editorEnsemble === editorSpaceEnsemble;
    button.setAttribute('aria-pressed', String(button.dataset.editorEnsemble === editorSpaceEnsemble));
  });
}

function closeEditorEnsemblePicker() {
  const picker = contentEditor.querySelector('.editor-ensemble-picker');
  if (!picker) return;
  picker.classList.remove('is-open');
  picker.querySelector('.editor-ensemble-toggle').setAttribute('aria-expanded', 'false');
  const menu = picker.querySelector('.editor-ensemble-menu');
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;
}

function editorFieldSnapshot(root) {
  return [...root.querySelectorAll('input,select,textarea')].map((field) => [
    field.name,
    field.type,
    field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value,
    field.closest('.editor-row')?.dataset.id || ''
  ]);
}

function captureEditorSnapshot() {
  const currentEvents = [...contentEditor.querySelectorAll('.editor-event-row')].map((row) => ({
    id:row.dataset.id || '',
    type:row.querySelector('[name="type"]').value,
    name:row.querySelector('[name="name"]').value.trim(),
    date:row.querySelector('[name="date"]').value,
    time:row.querySelector('[name="time"]').value,
    location:row.querySelector('[name="location"]').value.trim()
  }));
  const currentLinks = [...contentEditor.querySelectorAll('.editor-link-row')].map((row) => ({
    id:row.dataset.id || '',
    label:row.querySelector('[name="label"]').value.trim(),
    url:row.querySelector('[name="url"]').value.trim()
  }));
  const ensembles = {};
  Object.keys(editorEnsembleDrafts).forEach((key) => {
    ensembles[key] = key === editorSpaceEnsemble
      ? { events:currentEvents, links:currentLinks }
      : { events:editorEnsembleDrafts[key], links:editorEnsembleLinkDrafts[key] };
  });
  const fields = [...editorForm.querySelectorAll('input,select,textarea')]
    .filter((field) => !field.closest('.editor-event-row,.editor-link-row'))
    .map((field) => [field.name,field.type,field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value,field.closest('.editor-row')?.dataset.id || '']);
  return JSON.stringify({ fields, ensembles });
}

function refreshEditorDirty() {
  editorDirty = captureEditorSnapshot() !== editorBaselineSnapshot;
}
function setEditorStatus(message, temporary = false) {
  window.clearTimeout(editorStatusTimer);
  editorStatus.textContent = message;
  editorStatus.classList.toggle('is-visible', Boolean(message));
  if (temporary) editorStatusTimer = window.setTimeout(() => {
    editorStatus.classList.remove('is-visible');
    window.setTimeout(() => { editorStatus.textContent = ''; }, 220);
  }, 3200);
}

function field(label, name, value = '', type = 'text', attributes = {}) {
  const wrapper = document.createElement('label');
  const caption = document.createElement('span');
  caption.textContent = label;
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  input.value = value;
  Object.entries(attributes).forEach(([key, setting]) => input.setAttribute(key, setting));
  wrapper.append(caption, input);
  return wrapper;
}

function textAreaField(label, name, value = '', maxlength = 800) {
  const wrapper = document.createElement('label');
  const caption = document.createElement('span');
  caption.textContent = label;
  const input = document.createElement('textarea');
  input.name = name;
  input.value = value;
  input.maxLength = maxlength;
  input.rows = 3;
  input.required = true;
  wrapper.append(caption, input);
  return wrapper;
}

function rowActions(kind) {
  const actions = document.createElement('div');
  actions.className = 'editor-row-actions';
  if (kind !== 'event') {
    [['up', '↑', editorText.up], ['down', '↓', editorText.down]].forEach(([action, symbol, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.editorAction = action;
      button.textContent = symbol;
      button.setAttribute('aria-label', label);
      actions.append(button);
    });
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.editorAction = 'remove';
  remove.className = 'editor-remove';
  remove.textContent = editorText.remove;
  actions.append(remove);
  return actions;
}

function eventEditorRow(event = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-event-row';
  row.dataset.id = event.id || `event-${Date.now()}`;
  const typeLabel = document.createElement('label');
  typeLabel.innerHTML = `<span>${editorText.type}</span>`;
  const select = document.createElement('select');
  select.name = 'type';
  eventTypeKeys.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = eventTypeLabel(value);
    option.selected = event.type === value;
    select.append(option);
  });
  typeLabel.append(select);
  const alternate = field(editorText.altName, 'name', isCanonicalEventName(event.name) ? '' : event.name, 'text', { maxlength:'160', placeholder:editorText.altPlaceholder });
  const alternateInput = alternate.querySelector('input');
  const syncAlternative = () => { alternateInput.required = select.value === 'other'; };
  select.addEventListener('change', syncAlternative);
  syncAlternative();
  row.append(typeLabel, alternate, field(editorText.date, 'date', event.date, 'date', { required:'' }), field(editorText.time, 'time', event.time, 'text', { maxlength:'20', placeholder:'17:30–19:30' }), field(editorText.place, 'location', event.location, 'text', { maxlength:'160' }), rowActions('event'));
  return row;
}

function songEditorRow(song = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-song-row';
  row.dataset.id = song.id || '';
  row.append(field(editorText.song, 'title', song.title, 'text', { maxlength:'160', required:'' }), rowActions('song'));
  return row;
}

function linkEditorRow(link = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-link-row';
  row.dataset.id = link.id || '';
  row.append(field(editorText.name, 'label', link.label, 'text', { maxlength:'160', required:'' }), field(editorText.web, 'url', link.url, 'url', { maxlength:'500', required:'', placeholder:'https://…' }), rowActions('link'));
  return row;
}

function socialEditorRow(social = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-social-row';
  row.dataset.id = social.id || '';
  row.append(field(editorText.name, 'label', social.label, 'text', { maxlength:'160', required:'' }), field(editorText.web, 'url', social.url, 'url', { maxlength:'500', required:'', placeholder:'https://…' }), rowActions('social'));
  return row;
}

function userEditorRow(user = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-user-row';
  const passwordField = field(editorText.newPassword, 'password', '', 'password', { maxlength:'100', placeholder:user.username ? '••••••••' : '' });
  passwordField.classList.add('editor-password-field');
  const reveal = document.createElement('button');
  reveal.type = 'button'; reveal.className = 'editor-password-toggle'; reveal.dataset.passwordToggle = ''; reveal.setAttribute('aria-label', 'Mostrar u ocultar contraseña');
  reveal.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/></svg>';
  passwordField.append(reveal);
  row.append(field(editorText.username, 'username', user.username, 'text', { maxlength:'40', required:'', autocapitalize:'none' }), field(editorText.displayName, 'name', user.name, 'text', { maxlength:'80', required:'' }), passwordField);
  const permissions = document.createElement('div');
  permissions.className = 'editor-user-access';
  const compactAccessLabels = { 'the-navies':'Navies', 'cor-band':'Cor-Band', strings:portalLanguage === 'ca' ? 'Cordes' : portalLanguage === 'en' ? 'Strings' : portalLanguage === 'fr' ? 'Cordes' : portalLanguage === 'it' ? 'Archi' : 'Cuerdas' };
  [['the-navies',editorText.accessNavies],['cor-band',editorText.accessCorBand],['strings',editorText.accessStrings]].forEach(([value, label]) => {
    const option = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'access'; input.value = value; input.checked = user.access?.includes(value);
    const text = document.createElement('span'); text.textContent = compactAccessLabels[value]; text.title = label;
    option.append(input, text); permissions.append(option);
  });
  row.append(permissions, rowActions('user'));
  return row;
}

async function loadEditorUsers() {
  const session = contentSession();
  if (!session) return false;
  try {
    const response = await fetch(`${portalApiUrl}/users`, { headers:{ Authorization:`Bearer ${session.token}` } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'users_failed');
    editorUsers = sortEditorUsers(result.users || []);
    return true;
  } catch (_) { setEditorStatus(editorText.loadError); return false; }
}

const preferredEditorUserOrder = ['pauescobedo','marionaescobedo','paufermosel','carlesgonzalez','ainasalmeron','candelagonzalez','emmatuabu','elsacuenca','juliabel','corband','conjuntcordes'];

function sortEditorUsers(users) {
  if (users.some((user) => user.sortOrder !== undefined && Number.isFinite(Number(user.sortOrder)))) return [...users].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
  const position = new Map(preferredEditorUserOrder.map((username, index) => [username, index]));
  return [...users].sort((a, b) => (position.get(a.username) ?? 999) - (position.get(b.username) ?? 999));
}

function usersFromEditor() {
  return [...contentEditor.querySelectorAll('.editor-user-row')].map((row, index) => ({
    username:row.querySelector('[name="username"]').value.trim().toLowerCase(),
    name:row.querySelector('[name="name"]').value.trim(),
    password:row.querySelector('[name="password"]').value,
    access:[...row.querySelectorAll('[name="access"]:checked')].map((input) => input.value),
    sortOrder:index
  }));
}

function concertEditorRow(concert = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-concert-row';
  row.dataset.id = concert.id || '';
  const monthLabelElement = document.createElement('label');
  monthLabelElement.innerHTML = `<span>${editorText.month}</span>`;
  const month = document.createElement('select');
  month.name = 'month';
  for (let index = 1; index <= 12; index += 1) {
    const value = String(index).padStart(2, '0');
    const option = document.createElement('option');
    option.value = value;
    option.textContent = monthLabel(value, portalLanguage);
    option.selected = concert.month === value;
    month.append(option);
  }
  monthLabelElement.append(month);
  row.append(field(editorText.name, 'name', concert.name, 'text', { maxlength:'160', required:'' }), field(editorText.day, 'day', concert.day, 'number', { min:'1', max:'31', inputmode:'numeric' }), monthLabelElement, field(editorText.year, 'year', concert.year || String(new Date().getFullYear()), 'number', { min:'2026', max:'2100', required:'' }), field(editorText.time, 'time', concert.time, 'time'), field(editorText.place, 'location', concert.location, 'text', { maxlength:'160' }), rowActions('concert'));
  return row;
}

function memberEditorRow(member = {}) {
  const row = document.createElement('div');
  row.className = 'editor-row editor-member-row';
  row.dataset.id = member.id || '';
  row.append(field(editorText.instrument, 'instrument', member.instrument, 'text', { maxlength:'160', required:'' }), field(editorText.cardTitle, 'title', member.title, 'text', { maxlength:'160', required:'' }), textAreaField(editorText.short, 'summary', member.summary, 300), textAreaField(editorText.long, 'bio', member.bio, 800), field(member.id === 'vocals' ? `${editorText.singer} 1 · ${editorText.socialLabel}` : editorText.socialLabel, 'socialLabel', member.socialLabel, 'text', { maxlength:'160' }), field(member.id === 'vocals' ? `${editorText.singer} 1 · ${editorText.socialUrl}` : editorText.socialUrl, 'socialUrl', member.socialUrl, 'url', { maxlength:'500', placeholder:'https://…' }));
  if (member.id === 'vocals') row.append(field(`${editorText.singer} 2 · ${editorText.socialLabel}`, 'socialLabel2', member.socialLabel2, 'text', { maxlength:'160' }), field(`${editorText.singer} 2 · ${editorText.socialUrl}`, 'socialUrl2', member.socialUrl2, 'url', { maxlength:'500', placeholder:'https://…' }), field(`${editorText.singer} 3 · ${editorText.socialLabel}`, 'socialLabel3', member.socialLabel3, 'text', { maxlength:'160' }), field(`${editorText.singer} 3 · ${editorText.socialUrl}`, 'socialUrl3', member.socialUrl3, 'url', { maxlength:'500', placeholder:'https://…' }));
  return row;
}

function populateEditor() {
  if (!navyContent) return;
  const homeTexts = contentEditor.querySelector('[data-editor-home-texts]');
  const settings = contentEditor.querySelector('[data-editor-settings]');
  const concertList = contentEditor.querySelector('[data-editor-list="concerts"]');
  const memberList = contentEditor.querySelector('[data-editor-list="members"]');
  const socialList = contentEditor.querySelector('[data-editor-list="socials"]');
  const eventList = contentEditor.querySelector('[data-editor-list="events"]');
  const songList = contentEditor.querySelector('[data-editor-list="songs"]');
  const linkList = contentEditor.querySelector('[data-editor-list="links"]');
  const userList = contentEditor.querySelector('[data-editor-list="users"]');
  homeTexts.replaceChildren(textAreaField(editorText.presentation, 'heroIntro', navyContent.home.texts.heroIntro), textAreaField(editorText.sound, 'soundBody', navyContent.home.texts.soundBody), textAreaField(editorText.band, 'bandBody', navyContent.home.texts.bandBody));
  const seasonField = document.createElement('label');
  seasonField.innerHTML = `<span>${editorText.defaultSeason}</span>`;
  const seasonSelect = document.createElement('select');
  seasonSelect.name = 'defaultSeason';
  const seasonNames = ({ es:{ spring:'🌸 Primavera', summer:'☀️ Verano', autumn:'🍁 Otoño', winter:'❄️ Invierno' }, ca:{ spring:'🌸 Primavera', summer:'☀️ Estiu', autumn:'🍁 Tardor', winter:'❄️ Hivern' }, en:{ spring:'🌸 Spring', summer:'☀️ Summer', autumn:'🍁 Autumn', winter:'❄️ Winter' }, fr:{ spring:'🌸 Printemps', summer:'☀️ Été', autumn:'🍁 Automne', winter:'❄️ Hiver' }, it:{ spring:'🌸 Primavera', summer:'☀️ Estate', autumn:'🍁 Autunno', winter:'❄️ Inverno' } })[portalLanguage];
  Object.entries(seasonNames).forEach(([value, label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = navyContent.home.settings?.defaultSeason === value; seasonSelect.append(option); });
  seasonField.append(seasonSelect);
  const playbackField = document.createElement('div');
  playbackField.className = 'editor-setting-card editor-playback-setting';
  playbackField.innerHTML = `<span>${editorText.initialPlayback}</span>`;
  const playbackControl = document.createElement('div');
  playbackControl.className = 'editor-segmented';
  const currentPlayback = navyContent.home.settings?.initialPlayback || 'random';
  [['random',editorText.randomPlayback],['custom',editorText.customPlayback]].forEach(([value, label]) => {
    const optionLabel = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'initialPlayback';
    input.value = value;
    input.checked = currentPlayback === value;
    const text = document.createElement('span');
    text.textContent = label;
    optionLabel.append(input, text);
    playbackControl.append(optionLabel);
  });
  playbackField.append(playbackControl);
  const initialSongField = document.createElement('div');
  initialSongField.className = 'editor-nested-setting';
  initialSongField.innerHTML = `<span>${editorText.initialSong}</span>`;
  const initialSongSelect = document.createElement('select');
  initialSongSelect.name = 'initialSongId';
  const playableSongs = [
    ['shake-it-off','Taylor Swift — Shake It Off'],
    ['baby-one-more-time','Britney Spears — …Baby One More Time'],
    ['sweet-caroline','Neil Diamond — Sweet Caroline'],
    ['dont-look-back-in-anger',"Oasis — Don't Look Back in Anger"],
    ['the-final-countdown','Europe — The Final Countdown'],
    ['have-you-ever-seen-the-rain','Creedence Clearwater Revival — Have You Ever Seen the Rain?']
  ];
  playableSongs.forEach(([value, label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = navyContent.home.settings?.initialSongId === value; initialSongSelect.append(option); });
  initialSongField.append(initialSongSelect);
  playbackField.append(initialSongField);
  const syncInitialSong = () => { initialSongField.hidden = !playbackControl.querySelector('[value="custom"]').checked; initialSongSelect.disabled = initialSongField.hidden; };
  playbackControl.addEventListener('change', syncInitialSong);
  syncInitialSong();
  const makeSettingsSelect = (name, title, options, current) => {
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `<span>${title}</span>`;
    const select = document.createElement('select');
    select.name = name;
    options.forEach(([value, label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = String(current) === value; select.append(option); });
    wrapper.append(select);
    return wrapper;
  };
  const countdownField = document.createElement('label');
  countdownField.className = 'editor-toggle-setting';
  const countdownTitle = document.createElement('span');
  countdownTitle.textContent = editorText.countdownSetting;
  const countdownSwitch = document.createElement('span');
  countdownSwitch.className = 'editor-switch';
  const countdownInput = document.createElement('input');
  countdownInput.type = 'checkbox';
  countdownInput.name = 'countdownEnabled';
  countdownInput.checked = navyContent.home.settings?.countdownEnabled ?? true;
  const countdownTrack = document.createElement('i');
  countdownTrack.setAttribute('aria-hidden', 'true');
  const countdownState = document.createElement('b');
  const syncCountdownState = () => { countdownState.textContent = countdownInput.checked ? editorText.enabled : editorText.disabled; };
  countdownInput.addEventListener('change', syncCountdownState);
  syncCountdownState();
  countdownSwitch.append(countdownInput, countdownTrack, countdownState);
  countdownField.append(countdownTitle, countdownSwitch);
  const volumeField = document.createElement('div');
  volumeField.className = 'editor-setting-card editor-volume-setting';
  volumeField.innerHTML = `<span>${editorText.initialVolume}</span>`;
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.name = 'initialVolume';
  volumeSlider.min = '0';
  volumeSlider.max = '100';
  volumeSlider.step = '1';
  const legacyVolume = { low:22, medium:34, high:48 };
  const savedVolume = navyContent.home.settings?.initialVolume;
  volumeSlider.value = String(Number.isFinite(Number(savedVolume)) ? Math.max(0, Math.min(100, Number(savedVolume))) : (legacyVolume[savedVolume] ?? 34));
  volumeSlider.setAttribute('aria-label', editorText.initialVolume);
  const volumeValue = document.createElement('output');
  volumeValue.className = 'editor-range-value';
  const syncVolumeSlider = () => {
    volumeSlider.style.setProperty('--volume-track', `${volumeSlider.value}%`);
    volumeValue.textContent = `${volumeSlider.value}%`;
  };
  volumeSlider.addEventListener('input', syncVolumeSlider);
  syncVolumeSlider();
  const volumeLabels = document.createElement('div');
  volumeLabels.className = 'editor-volume-labels';
  volumeLabels.innerHTML = `<span>0%</span><span>100%</span>`;
  volumeField.append(volumeValue, volumeSlider, volumeLabels);
  const idleField = document.createElement('div');
  idleField.className = 'editor-setting-card editor-idle-setting';
  idleField.innerHTML = `<span>${editorText.sessionInactivity}</span>`;
  const idleSwitch = document.createElement('label');
  idleSwitch.className = 'editor-switch';
  const idleInput = document.createElement('input');
  idleInput.type = 'checkbox';
  idleInput.name = 'sessionIdleEnabled';
  idleInput.checked = navyContent.home.settings?.sessionIdleEnabled !== false;
  const idleTrack = document.createElement('i');
  idleTrack.setAttribute('aria-hidden', 'true');
  const idleState = document.createElement('b');
  idleSwitch.append(idleInput, idleTrack, idleState);
  const idleRangeWrap = document.createElement('div');
  idleRangeWrap.className = 'editor-idle-range';
  const idleRangeHead = document.createElement('div');
  idleRangeHead.innerHTML = `<span>${editorText.inactivityHours}</span>`;
  const idleValue = document.createElement('output');
  idleRangeHead.append(idleValue);
  const idleSlider = document.createElement('input');
  idleSlider.type = 'range';
  idleSlider.name = 'sessionIdleHours';
  idleSlider.min = '1';
  idleSlider.max = '720';
  idleSlider.step = '1';
  idleSlider.value = String(Math.max(1, Math.min(720, Number(navyContent.home.settings?.sessionIdleHours) || 24)));
  const syncIdleSetting = () => {
    const enabled = idleInput.checked;
    idleState.textContent = enabled ? editorText.enabled : editorText.disabled;
    idleRangeWrap.classList.toggle('is-disabled', !enabled);
    idleSlider.disabled = !enabled;
    idleValue.textContent = `${idleSlider.value} ${editorText.hours}`;
    idleSlider.style.setProperty('--volume-track', `${((Number(idleSlider.value) - 1) / 719) * 100}%`);
  };
  idleInput.addEventListener('change', syncIdleSetting);
  idleSlider.addEventListener('input', syncIdleSetting);
  idleRangeWrap.append(idleRangeHead, idleSlider);
  idleField.append(idleSwitch, idleRangeWrap);
  syncIdleSetting();
  const languageNames = { ca:'Català', es:'Castellano', en:'English', fr:'Français', it:'Italiano' };
  const fallbackField = makeSettingsSelect('fallbackLanguage', editorText.fallbackLanguage, ['ca','es','en','fr','it'].map((code) => [code,languageNames[code]]), navyContent.home.settings?.fallbackLanguage || 'es');
  const faviconField = makeSettingsSelect('faviconMode', editorText.faviconMode, [['dynamic',editorText.dynamicFavicon],['static',editorText.staticFavicon]], navyContent.home.settings?.faviconMode || 'dynamic');
  settings.replaceChildren(seasonField, playbackField, countdownField, volumeField, fallbackField, faviconField, idleField);
  concertList.replaceChildren(...navyContent.home.concerts.map(concertEditorRow));
  memberList.replaceChildren(...navyContent.home.members.map(memberEditorRow));
  socialList.replaceChildren(...navyContent.home.socials.map(socialEditorRow));
  editorEnsembleDrafts = {
    'the-navies':orderedEditableEvents(structuredClone(navyContent.events || [])),
    'cor-band':orderedEditableEvents(structuredClone(navyContent.ensembles?.['cor-band']?.events || ensembleContent['cor-band'].events)),
    strings:orderedEditableEvents(structuredClone(navyContent.ensembles?.strings?.events || ensembleContent.strings.events))
  };
  editorEnsembleLinkDrafts = {
    'the-navies':structuredClone(navyContent.links || []),
    'cor-band':structuredClone(navyContent.ensembles?.['cor-band']?.links || []),
    strings:structuredClone(navyContent.ensembles?.strings?.links || [])
  };
  editorSpaceEnsemble = 'the-navies';
  syncEditorEnsemblePicker();
  eventList.replaceChildren(...editorEnsembleDrafts[editorSpaceEnsemble].map(eventEditorRow));
  songList.replaceChildren(...navyContent.songs.map(songEditorRow));
  linkList.replaceChildren(...editorEnsembleLinkDrafts[editorSpaceEnsemble].map(linkEditorRow));
  userList.replaceChildren(...editorUsers.map(userEditorRow));
  editorBaselineSnapshot = captureEditorSnapshot();
  editorDirty = false;
  setEditorStatus('');
}

function editorContent() {
  const homeTexts = contentEditor.querySelector('[data-editor-home-texts]');
  const defaultSeason = contentEditor.querySelector('[name="defaultSeason"]').value;
  const initialPlayback = contentEditor.querySelector('[name="initialPlayback"]:checked').value;
  const initialSongId = initialPlayback === 'custom' ? contentEditor.querySelector('[name="initialSongId"]').value : '';
  const countdownEnabled = contentEditor.querySelector('[name="countdownEnabled"]').checked;
  const initialVolume = Math.max(0, Math.min(100, Number(contentEditor.querySelector('[name="initialVolume"]').value) || 0));
  const sessionIdleEnabled = contentEditor.querySelector('[name="sessionIdleEnabled"]').checked;
  const sessionIdleHours = Math.max(1, Math.min(720, Number(contentEditor.querySelector('[name="sessionIdleHours"]').value) || 24));
  const fallbackLanguage = contentEditor.querySelector('[name="fallbackLanguage"]').value;
  const faviconMode = contentEditor.querySelector('[name="faviconMode"]').value;
  const concerts = [...contentEditor.querySelectorAll('.editor-concert-row')].map((row, index) => ({
    id:row.dataset.id || `${slugify(row.querySelector('[name="name"]').value)}-${Date.now()}-${index}`,
    name:row.querySelector('[name="name"]').value.trim(),
    day:row.querySelector('[name="day"]').value ? String(Number(row.querySelector('[name="day"]').value)) : '',
    month:row.querySelector('[name="month"]').value,
    year:row.querySelector('[name="year"]').value,
    time:row.querySelector('[name="time"]').value,
    location:row.querySelector('[name="location"]').value.trim(),
    status:index === 0 ? 'next' : 'soon'
  }));
  const members = [...contentEditor.querySelectorAll('.editor-member-row')].map((row) => ({
    id:row.dataset.id,
    instrument:row.querySelector('[name="instrument"]').value.trim(),
    title:row.querySelector('[name="title"]').value.trim(),
    dialogTitle:row.querySelector('[name="title"]').value.trim(),
    summary:row.querySelector('[name="summary"]').value.trim(),
    bio:row.querySelector('[name="bio"]').value.trim(),
    socialLabel:row.querySelector('[name="socialLabel"]').value.trim(),
    socialUrl:row.querySelector('[name="socialUrl"]').value.trim(),
    socialLabel2:row.querySelector('[name="socialLabel2"]')?.value.trim() || '',
    socialUrl2:row.querySelector('[name="socialUrl2"]')?.value.trim() || '',
    socialLabel3:row.querySelector('[name="socialLabel3"]')?.value.trim() || '',
    socialUrl3:row.querySelector('[name="socialUrl3"]')?.value.trim() || ''
  }));
  const usedSocialIds = new Set();
  const socials = [...contentEditor.querySelectorAll('.editor-social-row')].map((row, index) => {
    const label = row.querySelector('[name="label"]').value.trim();
    let id = row.dataset.id || slugify(label);
    while (usedSocialIds.has(id)) id = `${slugify(label)}-${index + 1}`;
    usedSocialIds.add(id);
    return { id, label, url:row.querySelector('[name="url"]').value.trim() };
  });
  const readEventRows = () => orderedEditableEvents([...contentEditor.querySelectorAll('.editor-event-row')].map(eventFromEditorRow));
  editorEnsembleDrafts[editorSpaceEnsemble] = readEventRows();
  const events = editorEnsembleDrafts['the-navies'];
  const usedSongIds = new Set();
  const songs = [...contentEditor.querySelectorAll('.editor-song-row')].map((row, index) => {
    const title = row.querySelector('[name="title"]').value.trim();
    let id = row.dataset.id || slugify(title);
    while (usedSongIds.has(id)) id = `${slugify(title)}-${index + 1}`;
    usedSongIds.add(id);
    return { id, title };
  });
  const readLinkRows = () => {
    const usedLinkIds = new Set();
    return [...contentEditor.querySelectorAll('.editor-link-row')].map((row, index) => {
    const label = row.querySelector('[name="label"]').value.trim();
    let id = row.dataset.id || slugify(label);
    while (usedLinkIds.has(id)) id = `${slugify(label)}-${index + 1}`;
    usedLinkIds.add(id);
      return { id, label, url:row.querySelector('[name="url"]').value.trim() };
    });
  };
  editorEnsembleLinkDrafts[editorSpaceEnsemble] = readLinkRows();
  const links = editorEnsembleLinkDrafts['the-navies'];
  return { home:{ settings:{ defaultSeason, initialPlayback, initialSongId, countdownEnabled, initialVolume, sessionIdleEnabled, sessionIdleHours, fallbackLanguage, faviconMode }, live:navyContent.home.live, texts:{ heroIntro:homeTexts.querySelector('[name="heroIntro"]').value.trim(), soundBody:homeTexts.querySelector('[name="soundBody"]').value.trim(), bandBody:homeTexts.querySelector('[name="bandBody"]').value.trim() }, concerts, members, socials }, events, ensembles:{ 'cor-band':{ events:editorEnsembleDrafts['cor-band'], links:editorEnsembleLinkDrafts['cor-band'] }, strings:{ events:editorEnsembleDrafts.strings, links:editorEnsembleLinkDrafts.strings } }, songs, links };
}

function syncEditorAccess() {
  const isPau = localStorage.getItem('navies-member-session') === 'pauescobedo';
  const canEdit = Boolean(isPau && contentSession());
  editContentButton.hidden = !canEdit;
  if (!canEdit) {
    document.documentElement.classList.remove('editor-route-pending');
    closeContentEditor(true, true);
    if (location.hash === '#edicion' || location.hash === '#edicion-del-sitio') history.replaceState({ route:'espacio-navy' }, '', '#navy');
  }
}

function selectEditorPage(route) {
  const page = route === 'home' ? 'home' : route === 'espacio-navy' ? 'space' : 'general';
  sessionStorage.setItem('navies-editor-page', page);
  contentEditor.querySelectorAll('[data-editor-tab]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.editorTab === page)));
  contentEditor.querySelectorAll('[data-editor-page]').forEach((item) => { item.hidden = item.dataset.editorPage !== page; });
  const activeTab = contentEditor.querySelector(`[data-editor-tab="${page}"]`);
  editorMobileToggle.querySelector('span').textContent = activeTab?.textContent || editorText.home;
  syncEditorSectionNav(page);
}

editContentButton.addEventListener('click', async (event) => {
  event.preventDefault();
  if (!contentSession()) return syncEditorAccess();
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle?.getAttribute('aria-expanded') === 'true') menuToggle.click();
  const reopeningEditor = location.hash === '#edicion' || location.hash === '#edicion-del-sitio';
  const storedEditorPage = sessionStorage.getItem('navies-editor-page');
  editorOriginRoute = reopeningEditor && storedEditorPage
    ? (storedEditorPage === 'space' ? 'espacio-navy' : storedEditorPage === 'home' ? 'home' : 'general')
    : (document.documentElement.dataset.route || 'home');
  if (!navyContent) await loadNavyContent();
  if (!navyContent) {
    document.documentElement.classList.remove('editor-route-pending');
    setEditorStatus(editorText.loadError);
    return;
  }
  await loadEditorUsers();
  populateEditor();
  selectEditorPage(editorOriginRoute);
  dashboard.hidden = true;
  document.querySelectorAll('#main-nav a').forEach((link) => link.classList.toggle('active', link === editContentButton));
  if (editorOriginRoute !== 'espacio-navy') window.naviesShowEditorHost?.();
  else if (location.hash !== '#edicion') window.naviesMarkEditorRoute?.();
  window.setTimeout(() => {
    document.documentElement.classList.remove('editor-route-pending');
    contentEditorOpen = true;
    dashboard.hidden = true;
    contentEditor.hidden = false;
    window.scrollTo({ top:0, behavior:'smooth' });
    requestAnimationFrame(() => contentEditor.classList.add('is-visible'));
    document.querySelectorAll('#main-nav a').forEach((link) => link.classList.toggle('active', link === editContentButton));
    document.title = `${editorText.siteEditing} — The Navies`;
  }, editorOriginRoute === 'espacio-navy' ? 0 : 240);
});

function closeContentEditor(immediate = false, restoreOrigin = false) {
  if (!contentEditorOpen && contentEditor.hidden) return;
  contentEditorOpen = false;
  contentEditor.classList.remove('is-visible');
  const finish = () => {
    contentEditor.hidden = true;
    if (window.naviesCurrentMember?.()) dashboard.hidden = false;
    if (restoreOrigin && editorOriginRoute !== (document.documentElement.dataset.route || 'home')) {
      window.naviesRestoreEditorRoute?.(editorOriginRoute);
      return;
    }
    const currentRoute = document.documentElement.dataset.route || editorOriginRoute || 'espacio-navy';
    document.querySelectorAll('#main-nav a').forEach((link) => link.classList.toggle('active', link.dataset.route === currentRoute));
    window.scrollTo({ top:0, behavior:immediate ? 'instant' : 'smooth' });
  };
  if (immediate) finish();
  else window.setTimeout(finish, 260);
}

contentEditor.querySelectorAll('[data-editor-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    sessionStorage.setItem('navies-editor-page', button.dataset.editorTab);
    contentEditor.querySelectorAll('[data-editor-tab]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    contentEditor.querySelectorAll('[data-editor-page]').forEach((page) => { page.hidden = page.dataset.editorPage !== button.dataset.editorTab; });
    editorMobileToggle.querySelector('span').textContent = button.textContent;
    editorTabs.classList.remove('is-mobile-open');
    editorMobileToggle.setAttribute('aria-expanded','false');
    syncEditorSectionNav(button.dataset.editorTab);
    editorSectionPendingIndex = 0;
    window.clearTimeout(editorSectionPendingTimer);
    editorSectionPendingTimer = window.setTimeout(() => {
      editorSectionPendingIndex = null;
      updateEditorSectionActive();
    }, 1400);
    window.scrollTo({ top:0, behavior:'smooth' });
  });
});

editorMobileToggle.addEventListener('click', () => {
  const open = !editorTabs.classList.contains('is-mobile-open');
  editorTabs.classList.toggle('is-mobile-open', open);
  editorMobileToggle.setAttribute('aria-expanded', String(open));
});

window.addEventListener('navies-route-change', (event) => {
  editContentButton.classList.remove('active');
  if (!contentEditorOpen) return;
  contentEditorOpen = false;
  contentEditor.classList.remove('is-visible');
  contentEditor.hidden = true;
  dashboard.hidden = event.detail?.route !== 'espacio-navy';
});

contentEditor.addEventListener('click', (event) => {
  const ensembleToggle = event.target.closest('.editor-ensemble-toggle');
  if (ensembleToggle) {
    const picker = ensembleToggle.closest('.editor-ensemble-picker');
    const willOpen = !picker.classList.contains('is-open');
    picker.classList.toggle('is-open', willOpen);
    ensembleToggle.setAttribute('aria-expanded', String(willOpen));
    const menu = picker.querySelector('.editor-ensemble-menu');
    menu.setAttribute('aria-hidden', String(!willOpen));
    menu.inert = !willOpen;
    return;
  }
  if (!event.target.closest('.editor-ensemble-picker')) closeEditorEnsemblePicker();
  const passwordToggle = event.target.closest('[data-password-toggle]');
  if (passwordToggle) {
    const input = passwordToggle.closest('.editor-password-field').querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    passwordToggle.classList.toggle('is-visible', input.type === 'text');
    return;
  }
  const ensembleButton = event.target.closest('[data-editor-ensemble]');
  if (ensembleButton && ensembleButton.dataset.editorEnsemble !== editorSpaceEnsemble) {
    editorEnsembleDrafts[editorSpaceEnsemble] = orderedEditableEvents([...contentEditor.querySelectorAll('.editor-event-row')].map(eventFromEditorRow));
    editorEnsembleLinkDrafts[editorSpaceEnsemble] = [...contentEditor.querySelectorAll('.editor-link-row')].map((row, index) => ({ id:row.dataset.id || `link-${index + 1}`, label:row.querySelector('[name="label"]').value.trim(), url:row.querySelector('[name="url"]').value.trim() }));
    editorSpaceEnsemble = ensembleButton.dataset.editorEnsemble;
    contentEditor.querySelector('[data-editor-ensemble-current]').textContent = editorEnsembleNames[editorSpaceEnsemble];
    closeEditorEnsemblePicker();
    window.setTimeout(syncEditorEnsemblePicker, 400);
    contentEditor.querySelector('[data-editor-list="events"]').replaceChildren(...editorEnsembleDrafts[editorSpaceEnsemble].map(eventEditorRow));
    contentEditor.querySelector('[data-editor-list="links"]').replaceChildren(...editorEnsembleLinkDrafts[editorSpaceEnsemble].map(linkEditorRow));
    refreshEditorDirty();
    return;
  }
  const add = event.target.closest('[data-editor-add]');
  if (add) {
    const kind = add.dataset.editorAdd;
    const list = contentEditor.querySelector(`[data-editor-list="${kind}s"]`);
    const row = kind === 'event' ? eventEditorRow({ type:'rehearsal', name:'', date:localToday(), time:'17:30', location:'' }) : kind === 'song' ? songEditorRow() : kind === 'concert' ? concertEditorRow({ name:editorText.newConcert, day:'', month:'12', year:String(new Date().getFullYear()), time:'', location:'' }) : kind === 'social' ? socialEditorRow() : kind === 'user' ? userEditorRow({ access:[] }) : linkEditorRow();
    list.append(row);
    if (kind === 'event') sortEventEditorRows(list);
    refreshEditorDirty();
    row.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  const action = event.target.closest('[data-editor-action]');
  if (!action) return;
  const row = action.closest('.editor-row');
  if (action.dataset.editorAction === 'remove') {
    if (window.confirm(editorText.confirmDelete)) { row.remove(); refreshEditorDirty(); }
  } else if (action.dataset.editorAction === 'up' && row.previousElementSibling) {
    row.parentNode.insertBefore(row, row.previousElementSibling);
    refreshEditorDirty();
  } else if (action.dataset.editorAction === 'down' && row.nextElementSibling) {
    row.parentNode.insertBefore(row.nextElementSibling, row);
    refreshEditorDirty();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.editor-ensemble-picker')) closeEditorEnsemblePicker();
  if (!event.target.closest('.content-editor-mobile-toggle,.content-editor-tabs')) {
    editorTabs.classList.remove('is-mobile-open');
    editorMobileToggle.setAttribute('aria-expanded','false');
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeEditorEnsemblePicker();
});

editorForm.addEventListener('input', refreshEditorDirty);
editorForm.addEventListener('change', (event) => {
  if (event.target.matches('.editor-event-row [name="date"],.editor-event-row [name="time"]')) {
    const list = event.target.closest('[data-editor-list="events"]');
    if (list) sortEventEditorRows(list);
  }
  refreshEditorDirty();
});

async function saveEditorChanges() {
  const session = contentSession();
  if (!session) {
    setEditorStatus(editorText.expired);
    syncEditorAccess();
    return false;
  }
  const save = contentEditor.querySelector('.editor-save');
  save.disabled = true;
  setEditorStatus(editorText.saving);
  try {
    const response = await fetch(`${portalApiUrl}/content`, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session.token}` },
      body:JSON.stringify({ content:editorContent() })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'save_failed');
    const usersResponse = await fetch(`${portalApiUrl}/users`, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session.token}` },
      body:JSON.stringify({ users:usersFromEditor() })
    });
    const usersResult = await usersResponse.json().catch(() => ({}));
    if (!usersResponse.ok) throw new Error(usersResult.error || 'users_failed');
    editorUsers = sortEditorUsers(usersResult.users || []);
    renderNavyContent(result.content);
    editorBaselineSnapshot = captureEditorSnapshot();
    editorDirty = false;
    setEditorStatus(editorText.saved, true);
    return true;
  } catch (error) {
    setEditorStatus(error.message === 'invalid_session' ? editorText.expiredAgain : editorText.saveError);
    return false;
  } finally {
    save.disabled = false;
  }
}

editorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await saveEditorChanges();
});

let editorExitResolver = null;
function resolveEditorExit(result) {
  if (editorExitDialog.open) editorExitDialog.close();
  const resolve = editorExitResolver;
  editorExitResolver = null;
  resolve?.(result);
}

editorExitDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  resolveEditorExit(false);
});
editorExitDialog.addEventListener('click', (event) => {
  if (event.target === editorExitDialog) resolveEditorExit(false);
});
editorExitDialog.querySelectorAll('[data-editor-exit]').forEach((button) => button.addEventListener('click', async () => {
  const action = button.dataset.editorExit;
  if (action === 'cancel') return resolveEditorExit(false);
  if (action === 'discard') {
    editorDirty = false;
    return resolveEditorExit(true);
  }
  const buttons = [...editorExitDialog.querySelectorAll('button')];
  buttons.forEach((item) => { item.disabled = true; });
  const saved = await saveEditorChanges();
  buttons.forEach((item) => { item.disabled = false; });
  resolveEditorExit(saved);
}));

window.naviesRequestEditorExit = () => {
  if (!contentEditorOpen || !editorDirty) return Promise.resolve(true);
  if (editorExitResolver) return Promise.resolve(false);
  editorExitDialog.showModal();
  return new Promise((resolve) => { editorExitResolver = resolve; });
};

window.addEventListener('beforeunload', (event) => {
  if (!contentEditorOpen || !editorDirty) return;
  event.preventDefault();
  event.returnValue = '';
});

window.addEventListener('navies-admin-change', syncEditorAccess);
window.addEventListener('navies-auth-change', syncEditorAccess);
window.setInterval(syncEditorAccess, 1000);
loadNavyContent();

let portalReady = false;
let portalTransitionTimer;
let contentEditorOpen = false;
let editorOriginRoute = 'espacio-navy';

function applyPortalState(isLoggedIn) {
  loginPanel.hidden = isLoggedIn;
  dashboard.hidden = !isLoggedIn || contentEditorOpen;
  if (!isLoggedIn) contentEditor.hidden = true;
  document.querySelector('.space-shell').classList.toggle('is-authenticated', isLoggedIn);
}

function syncPortal() {
  const member = window.naviesCurrentMember?.();
  const isLoggedIn = Boolean(member);
  if (isLoggedIn) memberName.textContent = window.naviesMemberName(member);
  syncEnsembleAccess();

  if (!portalReady) {
    applyPortalState(isLoggedIn);
    portalReady = true;
    return;
  }

  clearTimeout(portalTransitionTimer);
  const outgoing = isLoggedIn ? spaceEntry : dashboard;
  const incoming = isLoggedIn ? dashboard : spaceEntry;
  if (outgoing.hidden) {
    applyPortalState(isLoggedIn);
    return;
  }

  outgoing.classList.add('portal-leaving');
  portalTransitionTimer = setTimeout(() => {
    outgoing.classList.remove('portal-leaving');
    applyPortalState(isLoggedIn);
    incoming.classList.remove('portal-entering');
    void incoming.offsetWidth;
    incoming.classList.add('portal-entering');
    incoming.addEventListener('animationend', () => incoming.classList.remove('portal-entering'), { once:true });
  }, 210);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (await window.naviesLogin(data.get('username'), data.get('password'))) {
    loginError.textContent = '';
    event.currentTarget.reset();
    if (window.matchMedia('(max-width: 900px)').matches) {
      requestAnimationFrame(() => window.scrollTo({ top:0, left:0, behavior:'instant' }));
    }
  } else {
    loginError.textContent = 'Usuario o contraseña incorrectos.';
  }
});

window.addEventListener('navies-auth-change', syncPortal);
syncPortal();
syncEditorAccess();
if ((location.hash === '#edicion' || location.hash === '#edicion-del-sitio') && !editContentButton.hidden) {
  requestAnimationFrame(() => editContentButton.click());
}
