
//API key
var apiKey = 'a5489fb180f98555e7254681a3bf11f7';

//set city, state based on search
var cityInput = $(".input");

//declare cities var for saving
var cities = [];

//function to get city input that then runs function to get lat/long
var citySearch = function (event) {
    event.preventDefault();
    var city = cityInput.val();
    if (city) {
        getLatLon(city);
        //inserting recent city into array at front
        cities.unshift(city);
        saveCities(cities);
        setRecentCities();
        cityInput.val('');
    }
}

//saving cities and limiting to 10
var saveCities = function (cityArray) {
    if (cityArray.length < 10) {
        localStorage.setItem("cities", JSON.stringify(cityArray));
    } else {
        cityArray.length = 10;
        console.log(cityArray);
        localStorage.setItem("cities", JSON.stringify(cityArray));
    }
    
}

//set city, state based on shortcut button
var getRecentCity = function (event) {
    var recentCity = $(event.target).data('city');
    console.log(recentCity);
    if (recentCity) {
        getLatLon(recentCity);
    }
}

//get lat lon from city
var getLatLon = function (city) {
    var cityToLatLonApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&appid=' + apiKey;
    fetch(cityToLatLonApiUrl)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then(function (data) {
                    getCurrentWeather(data[0]);
                    getWeatherForecast(data[0]);
                })
            }
        })
}


//function from Nelio
function get5DaysForecast(apiResponse) {
    return apiResponse.list.reduce(function(days,current) {
        var currentDate=current.dt_txt.split(" ")[0];
        if(!days.find(function(day) {
            return day.dt_txt.includes(currentDate);
        })) {
            return [...days,current];
        }
        return days;
    },[])
}


//get weather forecast from forecast API
var getWeatherForecast = function (latLongs) {
    var forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latLongs.lat + '&lon=' + latLongs.lon + '&appid=' + apiKey + '&units=imperial';
    fetch(forecastApiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    var fiveDaysForecast = get5DaysForecast(data);
                    console.log(fiveDaysForecast);
                    console.log(data);
                    console.log(data.list[0]);
                    for (i = 0; i < 6; i ++){
                        displayForecastWeather(fiveDaysForecast[i], i);
                    }
                    
                })
            }
        })
}

//connect to current weather API
var getCurrentWeather = function (latLongs) {
    var currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latLongs.lat + '&lon=' + latLongs.lon + '&appid=' + apiKey + '&units=imperial';
    fetch(currentApiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    console.log("temp" + data.main.feels_like);
                    displayCurrentWeather(data);
                })
            }
        })
}

var currentDate = moment();
var currentDateFormat = currentDate.format("ddd. MMM Do, YYYY");
var currentWeatherTab = $("#current");


var displayCurrentWeather = function (currentData) { 
    var currentWeatherImg = $("#icon"); 
    currentWeatherImg.attr('src', 'https://openweathermap.org/img/wn/' + currentData.weather[0].icon + '@2x.png');
    var currentWeatherTitle = $("#title");
    currentWeatherTitle.html("<b>" + currentData.name + ": </b>" + currentDateFormat);
    currentWeatherTitle.css("fontSize", 30);
    var currentTemp = $("#temp");
    currentTemp.html("<b>Temp: </b>" + currentData.main.temp + "\u00B0F");
    var currentWind = $("#wind");
    currentWind.html("<b>Wind: </b>" + currentData.wind.speed + "MPH");
    var currentHumidity = $("#humidity");
    currentHumidity.html("<b>Humidity: </b>" + currentData.main.humidity);
    $("#current").css("border-style","solid");

}


var displayForecastWeather = function (forecastData, dayNum) {
    var forecastCard = $("#day" + dayNum);
    var forecastWeatherImg = forecastCard.children("img");
    forecastWeatherImg.attr('src', 'https://openweathermap.org/img/wn/' + forecastData.weather[0].icon + '@2x.png')
    var forecastDate = forecastCard.children("h3");
    var forecastDateFormatted = moment.unix(forecastData.dt).format("M/D/YYYY");
    forecastDate.html("<b>" + forecastDateFormatted + "</b>");
    //console.log(forecastDateFormatted);
    //console.log(forecastData.dt);
    var forecastTemp = forecastCard.children(".temp-div");
    forecastTemp.html("<b>Temp: </b>" + forecastData.main.temp + "\u00B0F");
    var forecastWind = forecastCard.children(".wind-div");
    forecastWind.html("<b>Wind: </b>" + forecastData.wind.speed);
    var forecastHumidity = forecastCard.children(".humidity-div");
    forecastHumidity.html("<b>Humidity: </b>" + forecastData.main.humidity);
    $(".block").html("5 Day Forecast:");
}



//set recent cities
function setRecentCities () {
    var storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null){
        cities = storedCities;
    }
    console.log(cities);
    displayRecentCities(cities);
}


//display recent cities
//<button class="button is-rounded is-fullwidth" data-city = "Baltimore">Baltimore</button>

var displayRecentCities = function (lastCities) {
    console.log(lastCities);
    if (lastCities) {
        for (var i = 0; i < lastCities.length; i ++) {
            var recentCityButton = $("#recent-city" + i);
                recentCityButton.html('<button class="button is-rounded is-fullwidth" data-city = "' + lastCities[i] + '">' +lastCities[i] + '</button>');
                //append button to class ".buttons"
        }
    }
    
    
}

//clear history
var clearCities = function (){
    var clearedCities = [];
    saveCities(clearedCities);
    location.reload();
}

$("#searchBtn").on('click', citySearch);
$("#buttons").on('click', getRecentCity);
$("#clear-button").on('click', clearCities);

//set and display recent cities on page load
setRecentCities ();