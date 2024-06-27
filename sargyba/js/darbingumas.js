const pradinis_api = `https://apis.mredgariux.site/v1/mcprison/sargyba/`

const urlParams = new URLSearchParams(window.location.search);
const nick = urlParams.get('nick');
const darbingumoKorteles = document.querySelector('.darbingumo-korteles');

async function tikrintiSargybini(nick) {
    try {
      const response = await fetch(`${pradinis_api}${nick}`);
      const data = await response.json();
      return data.success; // Grąžiname true, jei sargybinis rastas, false - jei nerastas
    } catch (error) {
      console.error('Klaida atliekant API užklausą:', error);
      return false;
    }
  }

async function gautiDarbinguma(nick) {
    try {
        const response = await fetch(`${pradinis_api}${nick}/darbingumas`);
        const data = await response.json();
    
        if (data.success && data.data.length > 0) {
          return data.data; // Grąžiname darbingumo duomenis
        } else {
          return null; // Duomenų nėra
        }
    } catch (error) {
        console.error('Klaida atliekant API užklausą:', error);
        return null; // Grąžiname null klaidos atveju
    }
}

// Funkcija patvirtinimo kortelės kūrimui
function sukurtiPatvirtinimoKortele(data, laikas) {
    const kortele = document.createElement('div');
    kortele.classList.add('patvirtinimas');
    const dataDiv = document.createElement('div');
    dataDiv.textContent = data;

    const laikasDiv = document.createElement('div');
    laikasDiv.textContent = `${laikas} min.`;

    // Įterpiame div elementus į kortelę
    kortele.appendChild(dataDiv);
    kortele.appendChild(laikasDiv);

    darbingumoKorteles.appendChild(kortele);

    let statusas = 'patvirtintas';
    if (laikas >= 1440) {
        statusas = 'viršytas';
    } else if (laikas >= 960) {
        statusas = 'nepatvirtintas';
    }
    
    // Spalvų parinkimas
    let borderColor = '#4CAF50'; // Žalia (patvirtintas)
    if (statusas === 'viršytas') {
        borderColor = '#f44336'; // Raudona (viršytas)
    } else if (statusas === 'nepatvirtintas') {
        borderColor = '#FF9800'; // Oranžinė (nepatvirtintas)
    }
    kortele.style.borderLeftColor = borderColor;
    kortele.style.borderRightColor = borderColor;
    kortele.style.borderTopColor = borderColor;
    kortele.style.borderBottomColor = borderColor;
}

function generuotiDiagrama(duomenys) {
    // Sukuriame canvas elementą
    const canvas = document.createElement('canvas');
    canvas.id = 'diagrama';
    document.getElementById('diagrama').appendChild(canvas); 
  
    const ctx = canvas.getContext('2d'); 
    new Chart(ctx, {
      type: 'line', // Pakeista į 'line' linijinei diagramai
      data: {
        labels: duomenys.map(item => item.date),
        datasets: [{
          label: 'Pradirbtos minutes',
          data: duomenys.map((item, index) => {
            // Skaičiuojame bendrą laiką iki šios datos
            return duomenys.slice(0, index + 1).reduce((sum, data) => sum + data.pradirbta, 0);
          }),
          borderColor: '#4CAF50', // Žalia spalva linijai
          pointRadius: 1,
          pointBorderColor: 'darkgreen',
          tension: 0.2,
          fill: false // Nepildome srities po linija
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

// Funkcija klaidos pranešimo (notification) kūrimui
function sukurtiKlaidosPranesima(zinute) {
  const klaida = document.createElement('div');
  klaida.classList.add('klaida');
  klaida.textContent = zinute;
  document.body.appendChild(klaida);

  klaida.style.backgroundColor = '#a00000';
  klaida.style.color = 'white';
  klaida.style.padding = '10px';
  klaida.style.borderRadius = '5px';
  klaida.style.marginBottom = '10px';
}

// Pagrindinė funkcija
async function main() {
    document.getElementById('loading-ekranas').style.display = 'flex';

    if (!nick) {
        sukurtiKlaidosPranesima('Žaidėjo vardas (nick) nerastas URL parametruose.');
        document.getElementById('loading-ekranas').style.display = 'none';
        return;
    }

    const ats = await tikrintiSargybini(nick);

    if (!ats) {
        sukurtiKlaidosPranesima('Toks sargybinis nerastas.');
        document.getElementById('loading-ekranas').style.display = 'none';
        return;
    }

    document.getElementById('nickSargo').innerHTML = nick;
    document.querySelector('.darbingumo-info').style.display = 'block';

    const duomenys = await gautiDarbinguma(nick);

    if (!duomenys) {
        sukurtiKlaidosPranesima('Sargybinis neturi darbingumo istorijos.');
        document.getElementById('loading-ekranas').style.display = 'none';
        return;
    }

    generuotiDiagrama(duomenys);

    // Sukuriame patvirtinimo korteles
    for (const item of duomenys) {
        sukurtiPatvirtinimoKortele(item.date, item.pradirbta);
    }
    document.getElementById('loading-ekranas').style.display = 'none';
}

// Vykdome pagrindinę funkciją
main();
