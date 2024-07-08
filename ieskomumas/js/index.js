  // Funkcija žaidėjo duomenims gauti iš API
  async function getPlayerData(nickas, token) {
    const response = await fetch(`https://apis.mredgariux.site/v1/mcprison/ieskomumas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nick: nickas, token })
    });
    if (!response.ok) {
      if (response.status == 400) {
        const atsakymas = await response.json();
        if (atsakymas.error_id == 2) {
          throw new Error('Patvirtinimas, kad neesate robotas nepavyko, bandykite dar kartą');
        } else if (atsakymas.error_id == 1) {
          throw new Error('Įveskite žaidėjo nicką');
        }
        throw new Error('Įvyko klaida gaunant rezultatus.');
      } else if (response.status == 404) {
        throw new Error('Žaidėjas nėra ieškomas');
      } else if (response.status == 429) {
        throw new Error('Jūs pasiekėte užklausų riba, todėl naudotis svetainę galėsite tik po valandos');
      } else if (response.status == 403) {
        const atsakas = await response.json();
        if (atsakas.ipInfo) {
          throw new Error('VPN naudojimas svetainėje nėra leidžiamas, išjunkite VPN ir bandykite dar kartą');
        }
        if (atsakas.standing) {
          throw new Error('Jūsų paskyra yra užblokuota');
        }
        throw new Error('Reikalinga autorizacija, kad galėtumėte atlikti šį veiksma');
      } else {
        const atsakas = await response.json().error;
        if (atsakas) {
          throw new Error(atsakas);
        } else {
          throw new Error("Įvyko klaida gaunant rezultatus.");
        }
      }
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error('Žaidėjas nerastas');
    }
    return data.zaidejas;
  }

  function retrieveToken() {
    return localStorage.getItem("account_api_key");
  }

  // Funkcija klaidos rodymui
  function showError(zinute) {
    let toastBody = `
    <strong class='text-danger'>Nepavyko atlikti šios užduoties:</strong> ${zinute}
  `;
  
    document.getElementById('error-toast').innerHTML = toastBody;
  
    const toastLiveExample = document.getElementById('liveToast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
  }

  // Funkcija modal rodymui
  function showPlayerModal(player) {
    const playerModal = new bootstrap.Modal(document.getElementById('playerModal'));
    const playerModalLabel = document.getElementById('playerModalLabel');
    const playerModalBody = document.getElementById('playerModalBody');
    const modalImage = playerModalBody.querySelector('.modal-image');

    const { nick, ieskomumas } = player;
    const results = calculation_funkcija(parseInt(ieskomumas, 10));

    playerModalLabel.innerText = nick;
    playerModalBody.innerHTML = `
      <img src="https://mc-heads.net/avatar/${nick}/60" class="modal-image rounded" alt="${nick}">
      <hr>
      <strong>Nickas:</strong> ${nick}<br>
      <strong>Ieškomumas:</strong> ${ieskomumas}<br>
      <strong>Bauda:</strong> ${results.bauda ? results.bauda + ' €' : 'Nėra baudos'}<br>
      <strong>Kalėjimo laikas:</strong> ${results.formatted_kalejimo_laikas}
    `;
    playerModal.show();
  }

  // Formos pateikimo įvykio apdorojimas
  document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput').value.trim();
    const token = hcaptcha.getResponse();
    console.log(token, searchInput);

    if (searchInput && token) {
      try {
        const player = await getPlayerData(searchInput, token);
        showPlayerModal(player);
        hcaptcha.reset();
        document.getElementById('searchInput').value = '';
      } catch (error) {
        showError(error.message);
      }
    } else if (!token) {
      showError('Patvirtinkite, kad nesate robotas');
    } else {
      showError('Įveskite žaidėjo nicką');
    }
  });

  // Laiko formavimo funkcija (pataisyta)
  function calculation_funkcija(ieskomumas) {
    const bauda_uz_viena_ieskomuma = 50;
    const max_ieskomumo_bauda = 100;

    let bauda = null;
    if (ieskomumas <= max_ieskomumo_bauda) {
      bauda = ieskomumas * bauda_uz_viena_ieskomuma;
    }

    const kalejimo_laikas = ieskomumas * 60;

    function formatLaikas(seconds) {
      const days = Math.floor(seconds / (24 * 3600));
      seconds %= (24 * 3600);
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);

      function formatUnit(value, singular, pluralTwoToNine, plural) {
        if (value % 100 >= 11 && value % 100 <= 19) {
          return `${value} ${plural}`;
        }
        switch (value % 10) {
          case 1:
            return `${value} ${singular}`;
          case 2:
          case 3:
          case 4:
            return `${value} ${pluralTwoToNine}`;
          default:
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
        formattedTime += formatUnit(minutes, 'minutė', 'minutes', 'minučių');
      }

      return formattedTime;
    }

    const formatted_kalejimo_laikas = formatLaikas(kalejimo_laikas);
    return {
      bauda,
      formatted_kalejimo_laikas
    };
  }

function redirector(id) {
  switch (id) {
      case 0:
          location.href = "https://mcprisonstat.lt/ieskomumas";
          break;
      case 1:
          location.href = "https://mcprisonstat.lt/ieskomumas/top-100.html";
          break;
      case 2:
          location.href = "https://mcprisonstat.lt/ieskomumas/grafikas.html";
          break;
      case 3:
          location.href = "https://mcprisonstat.lt/ieskomi";
          break;
      // Add more cases as needed
      default:
          // Handle default case if id doesn't match any specific case
          console.log("Invalid id:", id);
          break;
  }
}
