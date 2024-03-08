const cityInput = document.querySelector(".input");
const searchButton = document.querySelector(".search");
const DisplayError = document.getElementById("error");
const weatherCards = document.querySelector(".weather-cards");
const currentWeather = document.querySelector(".weather-info");
const currentLocation = document.querySelector(".location");
const apiKey = "43fdb9464f15c801b4072b4fe6ed2c4c";

const getCityWeatherInfo = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        DisplayError.textContent = "Enter a valid city name..";
        setTimeout(() => {
            DisplayError.textContent = "";
        }, 3000);
    } else {
        try {
            const weatherData = await getWeatherData(cityName);
            const { name: city, coord: { lat, lon } } = weatherData;
            await displayWeatherInfo(city, lat, lon);
        } catch (error) {
            DisplayError.textContent = error.message;
            setTimeout(() => {
                DisplayError.textContent = "";
            }, 3000);
        }
    }
}

async function getWeatherData(city) {
    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiurl);

    if (!response.ok) {
        throw new Error(`Weather data request failed: ${response.statusText}`);
    }

    return await response.json();
}

const displayWeatherInfo = async (cityname, lat, lon) => {
    try {
        const forecastAPI_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const res = await fetch(forecastAPI_URL);

        if (!res.ok) {
            throw new Error(`Forecast data request failed: ${res.statusText}`);
        }

        const weather = await res.json();

        const uniqueForecastDays =[];
       const FivedaysForecast= weather.list.filter(forecast =>
            {
                const foreCstDate=new Date(forecast.dt_txt).getDate();
                if(!uniqueForecastDays.includes(foreCstDate))
                {
                    return uniqueForecastDays.push(foreCstDate);
                }
            });

               cityInput.value="";
               currentWeather.innerHTML=""
               weatherCards.innerHTML="";
        
                FivedaysForecast.forEach((weatherItem, index)=>
                {
                    if(index===0)
                    {
                        currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityname,weatherItem, index));
                    }
                    else
                    {
                        weatherCards.insertAdjacentHTML("beforeend", createWeatherCard(cityname,weatherItem, index));
                    }
                   
                })
          
    }
    catch (error) {
        DisplayError.textContent = error.message;
            setTimeout(() => {
                DisplayError.textContent = "";
            }, 3000);
    }

}


const createWeatherCard= (cityName, weatheritem, index) =>
    { 
        if(index===0)
        {
           return `
                <div class="details">
                    <h2> ${cityName} (${weatheritem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature : ${(weatheritem.main.temp - 273.15).toFixed(2)}°C </h4>
                    <h4>Wind : ${weatheritem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatheritem.main.humidity}%</h4>
                    </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@4x.png" alt="weather image">
                    <h4>${weatheritem.weather[0].description}</h4>
                </div>`;
        }
        else
        {
            return `
            <li class="card">
            <h3>(${weatheritem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="Weather image icon" />
            <h4>Temp : ${(weatheritem.main.temp - 273.15).toFixed(2)}°C </h4>
            <h4>Wind : ${weatheritem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatheritem.main.humidity}%</h4>
             </li>`;
        }
         
    };

    const getUserCoordinates = async () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
    
                const reverseCodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
                
                fetch(reverseCodingUrl)
                    .then(res => res.json())
                    .then(data => {
                        const { name } = data[0];
                        displayWeatherInfo(name, latitude, longitude);
                    })
                    .catch(() => {
                        alert("An error occurred while fetching the city");
                    });
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Geolocation request denied. Please reset location permission to grant access again");
                }
            }
        );
    }
    

searchButton.addEventListener("click", getCityWeatherInfo);
currentLocation.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        getCityWeatherInfo();
    }
});

