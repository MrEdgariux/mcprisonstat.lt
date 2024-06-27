// Pakeiskite šią vietą savo duomenų kėlimo funkcija
async function fetchPlayers() {
    const response = await fetch('https://apis.mredgariux.site/v1/mcprison/ieskomumas/top-100');
    if (!response.ok) {
        if (response.status == 429) {
            sukurtiKlaidosPranesima("Jūs pasiekėte užklausų limitą, bandykite dar kartą po 1 valandos");
            return [];
        } else if (response.status == 403) {
            sukurtiKlaidosPranesima("VPN naudojimas nėra leidžiamas svetainėje, bandykite išjungti VPN.");
            return [];
        }
    }
    const data = await response.json();

    if (data.success) {
        return data.top100;
    } else {
        console.error('Nepavyko gauti žaidėjų duomenų:', data.error);
        return [];
    }
}

async function generatePlayerRow(vieta, nickas, ieskomumas) {
    return `
        <tr onclick="openData(this)">
            <td>${vieta}</td>
            <td>${nickas}</td>
            <td>${ieskomumas}</td>
        </tr>
    `;
}

function sukurtiKlaidosPranesima(zinute) {
    let toastBody = `
    <strong class='text-danger'>Nepavyko atlikti šios užduoties:</strong> ${zinute}
  `;
  
    document.getElementById('error-toast').innerHTML = toastBody;
  
    const toastLiveExample = document.getElementById('liveToast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
  }

function calculation_funkcija(ieskomumas) {
    /* Funkcija kurį suskaičiuoja kalėjimo laiką kalėjime bei bauda */
    const bauda_uz_viena_ieskomuma = 50;
    const max_ieskomumo_bauda = 100; // Daugiau negul šis kintamasis baudos nebeskaičiuoti ir grąžinti null (kas reiškia, kad baudos jis negali gauti)

    let bauda = null;
    if (ieskomumas <= max_ieskomumo_bauda) {
        bauda = ieskomumas * bauda_uz_viena_ieskomuma;
    }

    const kalejimo_laikas = ieskomumas * 60; // Laikas sekundėmis

    // Funkcija, kuri konvertuoja sekundes į {DD} dienas, {HH} valandas, {MM} minutes formatą
    function formatLaikas(seconds) {
        const days = Math.floor(seconds / (24 * 3600));
        seconds %= (24 * 3600);
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);

        function formatUnit(value, singular, pluralTwoToNine, plural) {
            if (value === 1) {
                return `${value} ${singular}`;
            } else if (value >= 2 && value <= 9) {
                return `${value} ${pluralTwoToNine}`;
            } else {
                return `${value} ${plural}`;
            }
        }

        let formattedTime = '';
        if (days > 0) {
            formattedTime += formatUnit(days, 'diena', 'dienas', 'dienų');
        }
        if (hours > 0) {
            if (formattedTime.length > 0) {
                formattedTime += ', ';
            }
            formattedTime += formatUnit(hours, 'valanda', 'valandas', 'valandų');
        }
        if (minutes > 0) {
            if (formattedTime.length > 0) {
                formattedTime += ', ';
            }
            formattedTime += formatUnit(minutes, 'minutė', 'minutės', 'minučių');
        }

        return formattedTime;
    }

    const formatted_kalejimo_laikas = formatLaikas(kalejimo_laikas);
    return {
        bauda,
        formatted_kalejimo_laikas
    };
}

function openData(pressed_row) {
    if (!pressed_row) {
      console.error("nx.?");
      return;
    }
    let cells = pressed_row.getElementsByTagName('td');
    let vieta = cells[0].innerText;
    let nickas = cells[1].innerText;
    let ieskomumas = parseInt(cells[2].innerText);

    console.log('Vieta:', vieta);
    console.log('Nickas:', nickas);
    console.log('Ieškomumas:', ieskomumas);

    const results = calculation_funkcija(ieskomumas);
    let modalTitle = nickas;
    let modalBody = `
        <strong>Nusikaltelio vieta:</strong> ${vieta}<br>
        <strong>Nusikaltelio vardas:</strong> ${nickas}<br>
        <strong>Nusikaltelio bauda:</strong> ${results.bauda ? results.bauda + ' €' : 'Nėra baudos'}<br>
        <strong>Nusikaltelio būsimas kalėjimo laikas:</strong> ${results.formatted_kalejimo_laikas}
    `;
    document.getElementById('galva').src = `https://mc-heads.net/avatar/${nickas}/40`;
    document.getElementById('ieskomumas-data').innerHTML = modalBody;

    const modalElement = document.getElementById('ieskomumasModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Išvalykite esamas eilutes

    const players = await fetchPlayers();
    let i = 0;
    if (players.length > 0) {
        for (const player of players) {
            i++;
            const playerRow = await generatePlayerRow(i, player.nick, player.ieskomumas);
            tbody.innerHTML += playerRow;
        }
    } else {
        const errorui = document.querySelector('.container');
        // Parodykite pranešimą, jei nepavyko gauti duomenų
        errorui.innerHTML = `<br><div class="alert alert-warning" role="alert"><h4 class="alert-heading">Duomenų užkrovimo klaida</h4><p>Nepavyko įkrauti ieškomumo duomenų</p></div>`;
    }

    const modalElement = document.getElementById('ieskomumasModal');
    modalElement.addEventListener('shown.bs.modal', () => {
      console.log('Modal shown');
    });

    modalElement.addEventListener('hidden.bs.modal', () => {
      const modalDialog = modalElement.querySelector('.modal-dialog');
      modalDialog.classList.remove('hide');
    });

    modalElement.addEventListener('hide.bs.modal', () => {
      const modalDialog = modalElement.querySelector('.modal-dialog');
      modalDialog.classList.add('hide');
    });
});