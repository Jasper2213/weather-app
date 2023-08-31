document.addEventListener("DOMContentLoaded", init);

let key;
let countries;

async function init() {
    key =  await getKey();
    countries = await getCountries();

    await loadPreviouslyAddedWeatherCards();

    const $datalist = document.querySelector("#countries");
    countries.forEach(country => {
        const html = `<option value="${country.name}"></option>`;
        $datalist.insertAdjacentHTML("beforeend", html);
    });

    const $locationButton = document.querySelector("#location-button");
    $locationButton.addEventListener("click", getLocation);

    const $form = document.querySelector("form");
    $form.addEventListener("submit", submitForm);

    const $trashcans = document.querySelectorAll(".trash");
    $trashcans.forEach(trashcan => {
        trashcan.addEventListener("click", removeWeatherCard);
    });
}

async function loadPreviouslyAddedWeatherCards() {
    const locations = getLocationsFromLocalStorage();

    for (const location of locations) {
        const weather = await getWeather(location.city, location.country);
        addWeatherCard(weather, location.city, location.country);
    }
}

async function getLocation(e) {
    e.preventDefault();

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const { city, countryCode } = await convertLonLatToCityCountryCode(latitude, longitude);

            if (!isLocationAlreadyAdded(city, convertCountryCodeToCountry(countryCode))) {
                const weather = await getWeather(city, countryCode);
                addWeatherCard(weather, city, convertCountryCodeToCountry(countryCode));
            }
        });
    }
}

async function submitForm(e) {
    e.preventDefault();

    const city = document.querySelector("#city").value;
    const country = document.querySelector("#country").value;

    if (city === "" || country === "") return alert("Please fill in both city and country!");

    if (!isLocationAlreadyAdded(city, country)) {
        const weather = await getWeather(city, country);
        addWeatherCard(weather, city, country);
    }
    else alert("This city is already added!");

    document.querySelector("#city").value = "";
    document.querySelector("#country").value = "";
}

function addWeatherCard(weather, city, country) {
    const $template = document.querySelector("#weather-card-template");
    const $section = document.querySelector("#weather-cards");

    const card = $template.content.cloneNode(true);
    setCardDetails(card, city, country, weather);

    $section.append(card);

    addLocationToLocalStorage(city, country);
}

function removeWeatherCard(e) {
    // TODO: Confirmation message

    const $article = e.target.closest("article");
    const id = $article.id;
    const city = id.split("-")[2];
    const country = id.split("-")[3];

    removeLocationFromLocalStorage(city, country);

    $article.remove();
}