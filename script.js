// Aldagai globalak
let hitzZerrenda = [];
let unekoMaila = 1;
const MAILA_KOPURUA = 30;
const HITZ_KOPURUA_MAILAN = 5;
let ezkerrekoHitzak = [];
let eskuinekoHitzak = [];
let aukeratutakoLoturak = new Map();
let denboraGelditzen = 20;
let denboraKontagailua;
let unekoPuntuak = 0;
let puntuakGuztira = 0;
const successSound = new Audio('success.mp3');

// Proba datuak
const probaHitzak = `
ABAGUNE,aukera parada egokiera
ABAILA,ziztu abiada arineketa arrapalada
ABAILDUA,eroria goibeldua etsita
ABEGI,harrera
ABIATU,irten jalgi
ADIBIDEZ,esate baterako esaterako
ADINA,beste adinbat bezainbeste
ADITUA,jakituna jakintsua jantzia
ADITZEN,ulertzen konprenitzen
ADORE,kemen kuraia ausardia
`.trim();

// Denbora kontrolatzeko funtzioak
function hasieratuDenbora() {
    denboraGelditzen = 20;
    eguneratuDenboraInterfazea();
    clearInterval(denboraKontagailua);
    
    denboraKontagailua = setInterval(() => {
        denboraGelditzen--;
        eguneratuDenboraInterfazea();
        
        if (denboraGelditzen <= 0) {
            clearInterval(denboraKontagailua);
            egiaztatu(true);
        }
    }, 1000);
}

function eguneratuDenboraInterfazea() {
    const erlojua = document.getElementById('erlojua');
    const denboraBarra = document.getElementById('denbora-betea');
    
    erlojua.textContent = denboraGelditzen;
    denboraBarra.style.width = `${(denboraGelditzen / 20) * 100}%`;
    
    // Kolore aldaketa denbora gutxi gelditzen denean (5 segundotik behera)
    if (denboraGelditzen <= 5) {
        erlojua.classList.add('larria');
        denboraBarra.classList.add('larria');
    } else {
        erlojua.classList.remove('larria');
        denboraBarra.classList.remove('larria');
    }
}

function kalkulatuPuntuak() {
    // 20 - denboraGelditzen = erabilitako segundoak
    // 20 puntu maximoa, 0 puntu minimoa
    return Math.max(0, 20 - (20 - denboraGelditzen));
}

function erakutsiMailaAmaiera() {
    const modala = document.getElementById('maila-amaiera-modala');
    const mailakoPuntuak = kalkulatuPuntuak();
    
    document.getElementById('erabilitako-denbora').textContent = 20 - denboraGelditzen;
    document.getElementById('mailako-puntuak').textContent = mailakoPuntuak;
    document.getElementById('puntuak-guztira').textContent = puntuakGuztira + mailakoPuntuak;
    
    modala.style.display = 'flex';
}

function hurrengoMaila() {
    const modala = document.getElementById('maila-amaiera-modala');
    modala.style.display = 'none';
    
    puntuakGuztira += kalkulatuPuntuak();
    document.getElementById('uneko-puntuak').textContent = puntuakGuztira;
    
    if (unekoMaila < MAILA_KOPURUA) {
        unekoMaila++;
        hasieratuMaila();
    } else {
        jokoaAmaitu();
    }
}

async function hasieratuJokoa() {
    console.log('Jokoa hasten...');
    try {
        const erantzuna = await fetch('sinonimoak.csv');
        if (!erantzuna.ok) {
            throw new Error(`HTTP errorea! egoera: ${erantzuna.status}`);
        }
        const testua = await erantzuna.text();
        console.log('CSV testua jasota:', testua.substring(0, 200) + '...'); 
        prozesatuCSV(testua);
        
        // Erakutsi hasierako modu aukeraketa
        document.getElementById('modo-aukeraketa').style.display = 'flex';
        document.getElementById('joko-eremua-osoa').style.display = 'none';
        document.getElementById('entrenatu-eremua').style.display = 'none';
        
    } catch (error) {
        console.error('Errorea CSV fitxategia kargatzean:', error);
        document.body.innerHTML += `<p style="color: red">Errorea: ${error.message}</p>`;
    }
}

function prozesatuCSV(csvTestua) {
    console.log('CSV-a prozesatzen...');
    const lerroak = csvTestua.split('\n')
        .map(lerroa => lerroa.trim())
        .filter(lerroa => lerroa && lerroa.includes(','));
    
    console.log('Aurkitutako lerro kopurua:', lerroak.length);
    
    hitzZerrenda = lerroak.map(lerroa => {
        const [hitza, sinonimoak] = lerroa.split(',');
        return {
            hitza: hitza.trim(),
            erantzunak: sinonimoak.trim().split(' ').filter(s => s.length > 0)
        };
    });
    
    console.log('Prozesatutako hitz zerrenda:', hitzZerrenda.slice(0, 3)); // Erakutsi lehenengo 3 hitzak
    
    // Nahastu hitz zerrenda
    hitzZerrenda = hitzZerrenda.sort(() => Math.random() - 0.5);
    
    if (hitzZerrenda.length > 0) {
        console.log('Hasieratzen lehenengo maila...');
        hasieratuMaila();
    } else {
        console.error('Ez da hitzik kargatu');
    }
}

function nahastuHitzakSinonimoakBananduz(hitzak, erantzunak) {
    // Sortu posizio array-a
    let posizioak = Array.from({ length: HITZ_KOPURUA_MAILAN }, (_, i) => i);
    let nahastutaPosizioak = [];
    
    // Lehenengo hitza ausaz aukeratu
    let azkenPosizioa = posizioak.splice(Math.floor(Math.random() * posizioak.length), 1)[0];
    nahastutaPosizioak.push(azkenPosizioa);
    
    // Gainontzeko posizioak nahastu, baina inoiz ez jarri sinonimoa alboan
    while (posizioak.length > 0) {
        // Filtratu posizio posibleak (ez albokoak)
        let posibleak = posizioak.filter(pos => 
            Math.abs(pos - azkenPosizioa) !== 1
        );
        
        // Ez badago posizio posiblerik, hartu edozein geratzen den posizio
        if (posibleak.length === 0) {
            posibleak = posizioak;
        }
        
        // Aukeratu hurrengo posizioa
        azkenPosizioa = posibleak[Math.floor(Math.random() * posibleak.length)];
        nahastutaPosizioak.push(azkenPosizioa);
        
        // Kendu aukeratutako posizioa jatorrizko zerrendatik
        posizioak = posizioak.filter(p => p !== azkenPosizioa);
    }
    
    // Nahastu hitzak kalkulatutako posizioen arabera
    return nahastutaPosizioak.map(i => hitzak[i]);
}

function hasieratuMaila() {
    console.log('Maila hasieratzen:', unekoMaila);
    const hasieraIndizea = (unekoMaila - 1) * HITZ_KOPURUA_MAILAN;
    const mailakoBikoteak = hitzZerrenda.slice(hasieraIndizea, hasieraIndizea + HITZ_KOPURUA_MAILAN);
    
    ezkerrekoHitzak = mailakoBikoteak.map(bikote => bikote.hitza);
    eskuinekoHitzak = mailakoBikoteak.map(bikote => bikote.erantzunak[0]);
    
    // Nahastu bai ezkerreko bai eskuineko hitzak, sinonimoak bananduz
    ezkerrekoHitzak = nahastuHitzakSinonimoakBananduz([...ezkerrekoHitzak], [...eskuinekoHitzak]);
    eskuinekoHitzak = nahastuHitzakSinonimoakBananduz([...eskuinekoHitzak], [...ezkerrekoHitzak]);
    
    aukeratutakoLoturak.clear();
    
    erakutsiMaila();
    hasieratuDenbora();
    eguneratuAurrerapena();
    
    document.getElementById('maila-info').textContent = `${unekoMaila}/${MAILA_KOPURUA}. maila`;
}

function erakutsiMaila() {
    const ezkerZutabea = document.getElementById('ezker-zutabea');
    const eskuinZutabea = document.getElementById('eskuin-zutabea');
    
    ezkerZutabea.innerHTML = '';
    eskuinZutabea.innerHTML = '';
    
    // Sortu arrastatu daitezkeen elementuak
    ezkerrekoHitzak.forEach((hitza, indizea) => {
        const div = document.createElement('div');
        div.textContent = hitza;
        div.className = 'hitz-botoia';
        div.draggable = true;
        div.dataset.indizea = indizea;
        div.dataset.aldea = 'ezker';
        
        gehituDragEvents(div);
        ezkerZutabea.appendChild(div);
    });
    
    eskuinekoHitzak.forEach((hitza, indizea) => {
        const div = document.createElement('div');
        div.textContent = hitza;
        div.className = 'hitz-botoia';
        div.draggable = true;
        div.dataset.indizea = indizea;
        div.dataset.aldea = 'eskuin';
        
        gehituDragEvents(div);
        eskuinZutabea.appendChild(div);
    });
    
    document.getElementById('maila-info').textContent = `${unekoMaila}/${MAILA_KOPURUA}. maila`;
}

function gehituDragEvents(elem) {
    elem.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('finko') || e.target.classList.contains('zuzena')) {
            e.preventDefault();
            return;
        }
        e.target.classList.add('dragging');
        // Gorde elementuaren jatorrizko posizioa
        e.dataTransfer.setData('text/plain', e.target.innerHTML);
    });
    
    elem.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });
    
    elem.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    elem.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElem = document.querySelector('.dragging');
        
        if (draggingElem && 
            draggingElem !== e.target && 
            !e.target.classList.contains('finko') && 
            !e.target.classList.contains('zuzena') &&
            !draggingElem.classList.contains('finko') && 
            !draggingElem.classList.contains('zuzena')) {
            
            // Gorde edukiak
            const draggedContent = draggingElem.innerHTML;
            const targetContent = e.target.innerHTML;
            
            // Aldatu edukiak
            draggingElem.innerHTML = targetContent;
            e.target.innerHTML = draggedContent;
            
            eguneratuPosizioak();
        }
    });
}

function eguneratuPosizioak() {
    const ezkerZutabea = document.getElementById('ezker-zutabea');
    const eskuinZutabea = document.getElementById('eskuin-zutabea');
    
    // Eguneratu ezkerreko hitzen ordena
    ezkerrekoHitzak = [...ezkerZutabea.children].map(elem => elem.textContent);
    
    // Eguneratu eskuineko hitzen ordena
    eskuinekoHitzak = [...eskuinZutabea.children].map(elem => elem.textContent);
}

function hitzaAukeratu(aldea, indizea) {
    console.log('Hitza aukeratuta:', aldea, indizea);
    const azkenAukeraketa = aukeratutakoLoturak.get('azken_aukeratua');
    
    if (azkenAukeraketa) {
        if (azkenAukeraketa.aldea !== aldea) {
            if (aldea === 'eskuin') {
                aukeratutakoLoturak.set(azkenAukeraketa.indizea, indizea);
            } else {
                aukeratutakoLoturak.set(indizea, azkenAukeraketa.indizea);
            }
            aukeratutakoLoturak.delete('azken_aukeratua');
            // Eguneratu interfazea
            markatuLoturak();
        }
    } else {
        aukeratutakoLoturak.set('azken_aukeratua', {aldea, indizea});
        markatuAukeratutakoa(aldea, indizea);
    }
}

function markatuAukeratutakoa(aldea, indizea) {
    // Garbitu aurreko aukeraketak
    document.querySelectorAll('.aukeratuta').forEach(elem => {
        elem.classList.remove('aukeratuta');
    });
    
    // Markatu berria
    const zutabea = aldea === 'ezker' ? 'ezker-zutabea' : 'eskuin-zutabea';
    const botoiak = document.getElementById(zutabea).getElementsByTagName('button');
    botoiak[indizea].classList.add('aukeratuta');
}

function markatuLoturak() {
    // Garbitu markak
    document.querySelectorAll('.aukeratuta, .zuzena').forEach(elem => {
        elem.classList.remove('aukeratuta', 'zuzena');
    });
    
    // Markatu loturak
    aukeratutakoLoturak.forEach((eskuinIndizea, ezkerIndizea) => {
        if (typeof ezkerIndizea === 'number') {
            const ezkerBotoiak = document.getElementById('ezker-zutabea').getElementsByTagName('button');
            const eskuinBotoiak = document.getElementById('eskuin-zutabea').getElementsByTagName('button');
            ezkerBotoiak[ezkerIndizea].classList.add('lotuta');
            eskuinBotoiak[eskuinIndizea].classList.add('lotuta');
        }
    });
}

function erakutsiJokoAmaiera(denboraAmaitu) {
    const modala = document.getElementById('joko-amaiera-modala');
    const titulua = document.getElementById('amaiera-titulua');
    const puntuakSpan = document.getElementById('amaierako-puntuak');
    
    if (denboraAmaitu) {
        titulua.textContent = 'Denbora amaitu da!';
    } else {
        titulua.textContent = 'Zorionak! Jokoa amaitu duzu!';
    }
    
    puntuakSpan.textContent = puntuakGuztira;
    modala.style.display = 'flex';
}

function berrizHasi() {
    const modala = document.getElementById('joko-amaiera-modala');
    modala.style.display = 'none';
    
    // Berrabiarazi jokoa
    unekoMaila = 1;
    puntuakGuztira = 0;
    document.getElementById('uneko-puntuak').textContent = '0';
    hasieratuMaila();
}

function egiaztatu(denboraAmaitu = false) {
    let zuzenKopurua = 0;
    const ezkerZutabea = document.getElementById('ezker-zutabea');
    const eskuinZutabea = document.getElementById('eskuin-zutabea');
    
    const ezkerrekoElementuak = [...ezkerZutabea.children];
    const eskuinekoElementuak = [...eskuinZutabea.children];
    
    // Egiaztatu bikoteak
    for (let i = 0; i < HITZ_KOPURUA_MAILAN; i++) {
        const ezkerrekoHitza = ezkerrekoElementuak[i].textContent.trim().toUpperCase();
        const eskuinekoHitza = eskuinekoElementuak[i].textContent.trim().toLowerCase();
        
        const jatorrizkoBikotea = hitzZerrenda.find(bikote => 
            bikote.hitza.trim().toUpperCase() === ezkerrekoHitza
        );
        
        if (jatorrizkoBikotea) {
            const erantzunakLowerCase = jatorrizkoBikotea.erantzunak.map(e => e.trim().toLowerCase());
            
            if (erantzunakLowerCase.includes(eskuinekoHitza)) {
                zuzenKopurua++;
                ezkerrekoElementuak[i].classList.add('zuzena');
                eskuinekoElementuak[i].classList.add('zuzena');
                ezkerrekoElementuak[i].classList.add('finko');
                eskuinekoElementuak[i].classList.add('finko');
                ezkerrekoElementuak[i].draggable = false;
                eskuinekoElementuak[i].draggable = false;
            }
        }
    }
    
    if (denboraAmaitu) {
        clearInterval(denboraKontagailua);
        puntuakGuztira += kalkulatuPuntuak();
        document.getElementById('uneko-puntuak').textContent = puntuakGuztira;
        setTimeout(() => {
            erakutsiJokoAmaiera(true);
        }, 500);
        return;
    }
    
    if (zuzenKopurua === HITZ_KOPURUA_MAILAN) {
        clearInterval(denboraKontagailua);
        successSound.play();
        puntuakGuztira += kalkulatuPuntuak();
        document.getElementById('uneko-puntuak').textContent = puntuakGuztira;
        
        setTimeout(() => {
            if (unekoMaila < MAILA_KOPURUA) {
                unekoMaila++;
                hasieratuMaila();
            } else {
                erakutsiJokoAmaiera(false);
            }
        }, 1000);
    }
}

function markatuZuzena(ezkerIndizea, eskuinIndizea) {
    const ezkerBotoiak = document.getElementById('ezker-zutabea').getElementsByTagName('div');
    const eskuinBotoiak = document.getElementById('eskuin-zutabea').getElementsByTagName('div');
    
    const ezkerBotoia = ezkerBotoiak[ezkerIndizea];
    const eskuinBotoia = eskuinBotoiak[eskuinIndizea];
    
    // Gehitu animazioa
    [ezkerBotoia, eskuinBotoia].forEach(botoia => {
        botoia.classList.add('zuzena');
        botoia.classList.add('finko');
        botoia.draggable = false;
    });
}

function jokoaAmaitu() {
    alert('Zorionak! Joko osoa amaitu duzu!');
}

function eguneratuAurrerapena() {
    const aurrerapen = (unekoMaila - 1) / MAILA_KOPURUA * 100;
    document.getElementById('aurrerapen-betea').style.width = `${aurrerapen}%`;
    document.getElementById('maila-info').textContent = `${unekoMaila}/${MAILA_KOPURUA}. maila`;
}

function sortuPartekatzekoTestua() {
    return `Sinonimoen jolasean ${puntuakGuztira} puntu lortu ditut!! 🏆 Probatu zuk ere! #SinonimoenJolasa`;
}

function partekatuX() {
    const puntuak = document.getElementById('amaierako-puntuak').textContent;
    const testua = `Sinonimoen jolasean ${puntuak} puntu lortu ditut!! 🏆 Probatu zuk ere! labur.eus/bikoteka #SinonimoenJolasa`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(testua)}`;
    window.open(url, '_blank');
}

function partekatuFacebook() {
    const testua = sortuPartekatzekoTestua();
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(testua)}`;
    window.open(url, '_blank');
}

function partekatuWhatsapp() {
    const testua = sortuPartekatzekoTestua();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(testua)}`;
    window.open(url, '_blank');
}

function moduaAukeratu(modua) {
    document.getElementById('modo-aukeraketa').style.display = 'none';
    if (modua === 'entrenatu') {
        document.getElementById('entrenatu-eremua').style.display = 'block';
        entrenatuModuaHasi();
    } else {
        document.getElementById('joko-eremua-osoa').style.display = 'block';
        document.getElementById('modo-aukeraketa').style.display = 'none';
        clearInterval(denboraKontagailua);
        
        // Iniciar el juego directamente
        unekoMaila = 1;
        puntuakGuztira = 0;
        document.getElementById('uneko-puntuak').textContent = '0';
        hasieratuMaila();
    }
}

function entrenatuModuaHasi() {
    kargatuHurrengoGaldera();
}

function kargatuHurrengoGaldera() {
    const hitzBikotera = lortuAusazkoHitzBikotea();
    const okerrakoBikoteak = lortuAusazkoOkerrakoBikoteak(2);
    
    const hitzNagusia = hitzBikotera[0].toUpperCase();
    const erantzunZuzena = hitzBikotera[1].toUpperCase();
    const aukerak = [...okerrakoBikoteak.map(p => p[1].toUpperCase()), erantzunZuzena]
        .sort(() => Math.random() - 0.5);

    document.getElementById('hitz-nagusia').textContent = hitzNagusia;
    const aukeraContainer = document.getElementById('aukera-container');
    aukeraContainer.innerHTML = '';
    
    aukerak.forEach(aukera => {
        const botoia = document.createElement('button');
        botoia.className = 'aukera-botoia';
        botoia.textContent = aukera;
        botoia.onclick = () => erantzunaEgiaztatu(botoia, aukera === erantzunZuzena);
        aukeraContainer.appendChild(botoia);
    });
}

function erantzunaEgiaztatu(botoia, zuzena) {
    if (zuzena) {
        const botoiak = document.getElementsByClassName('aukera-botoia');
        Array.from(botoiak).forEach(b => b.disabled = true);
        botoia.classList.add('aukera-zuzena');
        setTimeout(() => {
            kargatuHurrengoGaldera();
        }, 1000);
    } else {
        botoia.classList.add('aukera-okerra');
    }
}

function jokatuModura() {
    document.getElementById('entrenatu-eremua').style.display = 'none';
    document.getElementById('joko-eremua-osoa').style.display = 'block';
    document.getElementById('modo-aukeraketa').style.display = 'none';
    
    // Iniciar el juego directamente
    unekoMaila = 1;
    puntuakGuztira = 0;
    document.getElementById('uneko-puntuak').textContent = '0';
    hasieratuMaila();
}

function lortuAusazkoHitzBikotea() {
    // Aukeratu ausazko hitz bat zerrendatik
    const ausazkoIndizea = Math.floor(Math.random() * hitzZerrenda.length);
    const bikotea = hitzZerrenda[ausazkoIndizea];
    
    // Itzuli [hitza, ausazko sinonimoa] formatuan
    return [bikotea.hitza, bikotea.erantzunak[0]];
}

function lortuAusazkoOkerrakoBikoteak(kopurua) {
    const okerrakoBikoteak = [];
    const erabilitakoIndizeak = new Set();
    
    while (okerrakoBikoteak.length < kopurua) {
        const ausazkoIndizea = Math.floor(Math.random() * hitzZerrenda.length);
        
        // Ez errepikatu hitz berdinak
        if (!erabilitakoIndizeak.has(ausazkoIndizea)) {
            erabilitakoIndizeak.add(ausazkoIndizea);
            const bikotea = hitzZerrenda[ausazkoIndizea];
            okerrakoBikoteak.push([bikotea.hitza, bikotea.erantzunak[0]]);
        }
    }
    
    return okerrakoBikoteak;
}

function entrenatuModuraJoan() {
    document.getElementById('joko-eremua-osoa').style.display = 'none';
    document.getElementById('entrenatu-eremua').style.display = 'block';
    clearInterval(denboraKontagailua); // Detener el contador de tiempo
    entrenatuModuaHasi();
}

function hasieraraJoan() {
    document.getElementById('joko-eremua-osoa').style.display = 'none';
    document.getElementById('entrenatu-eremua').style.display = 'none';
    document.getElementById('modo-aukeraketa').style.display = 'flex';
    clearInterval(denboraKontagailua);
}

// Orria kargatzen denean jokoa hasi
window.onload = hasieratuJokoa; 
