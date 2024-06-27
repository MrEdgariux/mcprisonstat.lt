let playerChart;
let allData = [];

if (localStorage.getItem("banned") == "true") {
    document.body.innerHTML = "<b>You are not permitted to visit this page because you are a bot</b>";
}

async function get_api_key() {
    if (localStorage.getItem("APIKey")) {
        localStorage.removeItem("APIKey");
    }
    const key = prompt("Prieigos raktas");
    if (!key) {
        showToast("Prieigos rakto nepavyko gauti - Operacija atšaukė vartotojas");
        return;
    }
    if (await test_key(key)) {
        localStorage.setItem("APIKey", key);
        location.reload();
    }
}

function cleanApiKey(apiKey) {
    // Remove any non-alphanumeric characters from the API key
    return apiKey.replace(/[^a-zA-Z0-9]/g, '');
}

async function test_key(key) {
    try {
        const response = await fetch('https://apis.mredgariux.site/v2/archyvas/v2/ieskomumas', {
            headers: {
                'API-Key': cleanApiKey(key)
            }
        });
        if (response.status == 200) {
            return true;
        } else {
            if (response.status == 429) {
                localStorage.setItem("banned", "true");
                showToast("Prieigos rakto patikros rezultatas -> Užblokuotas dėl bandymo atspėti prieigos rakta");
                return false;
            }
            showToast("Prieigos rakto patikros rezultatas -> Netinkamas");
            return false;
        }
    } catch (err) {
        showToast("Nepavyko atlikti testavimo užduoties");
        return false;
    }
}

async function loadAvailableDates() {
    const playerName = document.getElementById('playerName').value;
    const apiKey = localStorage.getItem('APIKey');
    if (!apiKey || !await test_key(apiKey)) {
        await get_api_key();
        return;
    }
    const url = `https://apis.mredgariux.site/v2/archyvas/v2/ieskomumas/${playerName}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'API-Key': apiKey
            }
        });
        const result = await response.json();

        if (response.status != 200) {
            if (response.status == 429) {
                throw new Error("Jūs atliekate reikalavimus per dažnai, todėl turėsi db sedėt kaip kelmas ir laukti, kol atsistatys rate-limit");
            }
            if (!result.success) {
                if (result.ipInfo) {
                    throw new Error("VPN naudojimas yra draudžiamas!");
                }
                if (result.account_standing) {
                    throw new Error("Jūsų paskyra yra užblokuota");
                }
                throw new Error(result.error);
            }
        }

        if (result.data.length < 10) {
            throw new Error("Archyvo duomenų nepakankamumas");
        }

        if (playerChart) {
            playerChart.destroy();
        }

        allData = result.data;

        const selectedDate = document.getElementById('selectedDate');
        selectedDate.innerHTML = '';

        // Filtruojame datas, kuriose yra bent 10 duomenų
        const groupedData = groupDataByDate(allData);
        const datesWithEnoughData = Object.keys(groupedData).filter(date => groupedData[date].length >= 10);

        // Užpildyti datos pasirinkimo lauką tik tais, kur yra pakankamai duomenų
        selectedDate.innerHTML = datesWithEnoughData.map(date => `<option value="${date}">${date}</option>`).join('');

        // Jei yra bent viena data su pakankamai duomenų, tai pasirenkame pirmąją
        if (datesWithEnoughData.length > 0) {
            selectedDate.value = datesWithEnoughData[0];
            fetchData();
        } else {
            showToast('Dėja, bet neradome nei vienos datos, kurioje ieškomas žaidėjas turėtu daugiau negul 10 duomenų grafikui nubrėžti');
        }

    } catch (error) {
        showToast(error.message);
    }
}

function groupDataByDate(data) {
    // Grupuojame duomenis pagal datą
    return data.reduce((acc, item) => {
        const date = item.datetime.split(' ')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});
}

function fetchData() {
    const selectedDate = document.getElementById('selectedDate').value;

    // Filtruojame duomenis pagal pasirinktą datą
    const filteredData = allData.filter(item => item.datetime.startsWith(selectedDate));

    if (!filteredData || filteredData.length < 10) {
        showToast('Nepakankamai turime ieškomumo duomenų jūsų pasirinktai datai');
        return;
    }

    // Paruošiame duomenis grafikui
    const labels = filteredData.map(item => item.datetime).reverse();
    const data = filteredData.map(item => item.ieskomumas).reverse();

    // Jei grafikas jau egzistuoja, jį sunaikiname prieš kuriant naują
    if (playerChart) {
        playerChart.destroy();
    }

    const horizontalLine = {
        label: 'Ieškomumo riba',
        data: [{ x: labels[0], y: 100 }, { x: labels[labels.length - 1], y: 100 }], // Nurodome tik pirmąją ir paskutinę datą
        borderColor: 'red',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        borderDash: [5, 5] // Galime nurodyti brūkšnelių stilių, jei norime
    };

    // Sukuriame naują grafiką
    const ctx = document.getElementById('playerChart').getContext('2d');
    playerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ieškomumo lygis',
                data: data,
                borderColor: '#5D9B9B',
                borderWidth: 2,
                tension: 0.2,
                fill: false
            },horizontalLine]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour'
                    }
                }
            }
        }
    });
}

function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + new Date().getTime();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
            <div class="toast-header">
                <strong class="mr-auto">Pranešimas</strong>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    $(toastElement).toast('show');
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

document.getElementById('selectedDate').addEventListener('change', fetchData);