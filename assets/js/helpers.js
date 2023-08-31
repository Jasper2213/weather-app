async function getKey() {
    return await fetch("./assets/data/config.json")
        .then(response => response.json())
        .then(data => data.key);
}

async function getCountries() {
    return await fetch("./assets/data/countries.json")
        .then(response => response.json())
        .then(data => data);
}

async function getWeather(city, country) {
    const [lon, lat] = await convertCityCountryToLonLat(city, country);

    return await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=metric`)
        .then(response => response.json())
        .then(data => data);
}

async function convertLonLatToCityCountryCode(lat, lon) {
    const data = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`)
        .then(response => response.json())
        .then(data => data[0])

    if (data) return { city: data.name, countryCode: data.country };
}

async function convertCityCountryToLonLat(city, country) {
    const country_code = convertCountryToCountryCode(country);

    const data = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${country_code}&limit=1&appid=${key}`)
        .then(response => response.json())
        .then(data => data[0])

    if (data) return [data.lon, data.lat];
}

function convertCountryToCountryCode(country) {
    return countries.filter(c => c.name === country).code;
}

function convertCountryCodeToCountry(countryCode) {
    return countries.filter(c => c.code === countryCode)[0].name;
}

function setCardDetails(card, city, country, weather) {
    card.querySelector("article").id = `weather-card-${city}-${country}`
    card.querySelector("h3").innerText = city;
    card.querySelector("h4").innerText = country;
    card.querySelector(".temperature").innerText = `${Math.round(weather.current.temp)}°C`;
    card.querySelector(".description").innerText = weather.current.weather[0].description;
    setImage(card, weather);
}

function setImage(card, weather) {
    card.querySelector("#weather-image").src = `https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@4x.png`;
    card.querySelector("#weather-image").alt = weather.current.weather[0].description;
    card.querySelector("#weather-image").title = weather.current.weather[0].description;
}

function addLocationToLocalStorage(city, country) {
    if (!isLocationAlreadyAdded(city, country)) {
        const locations = JSON.parse(localStorage.getItem("locations")) || [];
        locations.push({city, country});
        localStorage.setItem("locations", JSON.stringify(locations));
    }
}

function getLocationsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("locations")) || [];
}

function removeLocationFromLocalStorage(city, country) {
    const locations = getLocationsFromLocalStorage();
    const index = locations.findIndex(location => location.city === city && location.country === country);
    locations.splice(index, 1);
    localStorage.setItem("locations", JSON.stringify(locations));
}

function isLocationAlreadyAdded(city, country) {
    return getLocationsFromLocalStorage().some(location => location.city === city && location.country === country);
}