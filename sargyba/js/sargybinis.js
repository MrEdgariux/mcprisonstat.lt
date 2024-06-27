const pradinis_api = `https://apis.mredgariux.site/v1/mcprison/sargyba/`
const galvos_api = `https://mc-heads.net/avatar/`

document.getElementById('loading-ekranas').style.display = 'flex';

function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

function sukurtiKlaidosPranesima(zinute) {
    document.getElementById('sargas').remove();
    const klaida = document.createElement('div');
    klaida.classList.add('klaida');
    klaida.innerHTML = `
      <p>${zinute}</p>
    `;
    document.body.appendChild(klaida);
  
    // Stiliaus pritaikymas (nebūtina):
    klaida.style.backgroundColor = '#a00000';
    klaida.style.color = 'white';
    klaida.style.padding = '10px';
    klaida.style.borderRadius = '5px';
    klaida.style.marginBottom = '10px';
}

// Gauname 'nick' parametrą iš URL
document.addEventListener('DOMContentLoaded', function () {
    const sargas = getQueryParam('nick');

    if (sargas == undefined || sargas == null) {
        sukurtiKlaidosPranesima("Palauk, kaip tu čia atsidūrei?!");
        document.getElementById('loading-ekranas').style.display = 'none';
    } else if (sargas == "Rexas20240615") {
        // Hmm, what are you watching there, have you tought this is easter egg ? >(
        sukurtiKlaidosPranesima("Advancement Unlocked: Rexas");
        document.getElementById('loading-ekranas').style.display = 'none';
    } else {
        // API užklausos URL (pakeiskite <TAVO_API_ENDPOINT> tikruoju API adresu)
        const apiUrl = `${pradinis_api}${sargas}`;

        // Atliekame API užklausą (naudokite fetch arba kitą biblioteką)
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Sargybinis nerastas.');
                    } else if (response.status === 429) {
                        throw new Error('Per daug užklausų. Bandykite vėliau.');
                    } else if (response.status === 403) {
                        throw new Error('Svetainės prieiga uždrausta, kadangi naudojate VPN');
                    } else {
                        throw new Error('Klaida vykdant API užklausą.');
                    }
                }
                return response.json();
            })
            .then(data => {
                
                // Tikriname, ar gauti duomenys yra validūs ir ar vartotojas egzistuoja
                if (data) {
                    const duomenys = data.sargas;
                    // Atnaujiname HTML elementus su gautais duomenimis
                    document.querySelector('.profile-username').textContent = duomenys.username;
                    document.getElementById('pradirbimas').textContent = `Pradirbo: ${duomenys.pradirbta_min} min`;
                    document.getElementById('sndpradirbimas').textContent = `Šiandien: ${duomenys.siandien_pradirbo} min`;

                    // Formatuojame datą (pagal poreikį galite naudoti kitą formatą)
                    const priimtasData = new Date(duomenys.priimtas);
                    const formatuotaData = priimtasData.toLocaleDateString('lt-LT'); // Lietuviškas datos formatas
                    document.getElementById('priimtas').textContent = `Priimtas: ${formatuotaData}`;
                    document.getElementById('pareigos').textContent = `Pareigos: ${duomenys.pareigos}`;

                    // Atnaujiname aktyvumo nuorodą
                    const aktyvumoMygtukas = document.querySelector('.btn--primary');
                    aktyvumoMygtukas.addEventListener('click', function(event) {
                        event.preventDefault(); // Sustabdyti numatytąjį nuorodos elgesį
                        const nick = getQueryParam('nick'); // Gauti 'nick' parametrą iš URL
                        const url = `darbingumas.html?nick=${nick}`; // Sukurti nuorodos URL
                        window.location.href = url; // Perkelti į naują puslapį
                    });

                    // Atnaujiname profilio paveikslėlį (jei naudojate dinaminį generavimą)
                    const profileImage = document.querySelector('.profile-image img');
                    fetch(`${galvos_api}${sargas}`)
                    .then(response => response.blob())
                    .then(blob => {
                      profileImage.src = URL.createObjectURL(blob);
                      document.getElementById('loading-ekranas').style.display = 'none';
                    })
                    .catch(error => {
                      console.error('Klaida įkeliant žaidėjo snukį:', error);
                      alert("Svetainės visos funkcijos neužsikrovė teisingai.");
                      document.getElementById('loading-ekranas').style.display = 'none';
                    });
                } else {
                    // Klaidos atveju pateikiame pranešimą
                    document.getElementById('loading-ekranas').style.display = 'none';
                    alert('Sargybinio duomenys nerasta.');
                }
            })
            .catch(error => {
                console.error('Klaida vykdant API užklausą:', error);
                document.getElementById('loading-ekranas').style.display = 'none';
                sukurtiKlaidosPranesima(error);
            });
    }
});