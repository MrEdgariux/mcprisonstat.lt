const apiUrl = "https://apis.mredgariux.site/v1/mcprison/sargyba"; // Mūsų naujasis BACK-End iš kurio paimami duomenis nuo šiol
const cardsContainer = document.getElementById("cards");

fetch(apiUrl)
  .then(response => {
    cardsContainer.innerText = "";
    if (!response.ok) {
        if (response.status === 429) {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <div class="card-content">
                <div class="card-info-wrapper">
                    <div class="card-info">
                    <div class="card-info-title">
                        <h3>Rate Limited</h3>
                        <h4>Per dažnai prašai duomenų. Dabar lauk valanda</h4>
                    </div>
                    </div>
                </div>
                </div>
            `;
            cardsContainer.appendChild(card);
            return;
        } else if (response.status === 403) {
          const card = document.createElement("div");
          card.classList.add("card");

          card.innerHTML = `
              <div class="card-content">
              <div class="card-info-wrapper">
                  <div class="card-info">
                  <div class="card-info-title">
                      <h3>VPN Detected</h3>
                      <h4>Duomenys nėra teikiami, jeigu naudojate VPN</h4>
                  </div>
                  </div>
              </div>
              </div>
          `;
            cardsContainer.appendChild(card);
            throw new Error("Forbidden access. Check your authentication.");
        } else {
          const card = document.createElement("div");
          card.classList.add("card");

          card.innerHTML = `
              <div class="card-content">
              <div class="card-info-wrapper">
                  <div class="card-info">
                  <div class="card-info-title">
                      <h3>Error</h3>
                      <h4>Įvyko nežinoma klaida</h4>
                  </div>
                  </div>
              </div>
              </div>
          `;
            cardsContainer.appendChild(card);
            throw new Error(`API request failed with status ${response.status}`);
        }
    }
    return response.json(); 
  })
  .then(responseData => {
    if (responseData.success) { // Check if the request was successful
      const nicks = responseData.sargyba; // Extract the data array
      
      if (Array.isArray(nicks) && nicks.length > 0) {
        nicks.forEach(nick => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.setAttribute("onclick", `redirector('${nick}')`); // Assuming you have a redirector function

          card.innerHTML = `
            <div class="card-content">
              <div class="card-info-wrapper">
                <div class="card-info">
                  <div class="card-info-title">
                    <h3>${nick}</h3>  
                  </div>
                </div>
              </div>
            </div>
          `; // No 'minutes' info anymore

          cardsContainer.appendChild(card); 
        });
      } else {
        const errorCard = document.createElement("div");
        errorCard.classList.add("card");
        errorCard.innerHTML = `
            <div class="card-content">
              <div class="card-info-wrapper">
                <div class="card-info">
                  <div class="card-info-title">
                    <h3>Error</h3>
                    <h4>No data available</h4> 
                  </div>
                </div>
              </div>
            </div>
          `;
        cardsContainer.appendChild(errorCard);
      }

    } else {
      console.error("API Error:", responseData.error); // Log the error message
    }
  })
  .catch(error => {
    console.error("Error fetching or processing data:", error);
  });


  document.getElementById("cards").onmousemove = e => {
    for(const card of document.getElementsByClassName("card")) {
      const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
  
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    };
  }

function redirector(usr){
    const url = "sargybinis.html?nick=";

    window.location.href = url + usr;
    console.error("Failed to redirect");
}