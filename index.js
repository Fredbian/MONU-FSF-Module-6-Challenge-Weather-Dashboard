let inputGroup = document.querySelector('.input-group')
let searchCity = document.querySelector('#search-city')
let searchBtn = document.querySelector('#search-btn')
let searchList = document.querySelector('#search-list')
let currentCityName = document.querySelector('.current-city-name')
let wind = document.querySelector('#wind')
let humidity = document.querySelector('#humidity')
let uvIndex = document.querySelector('#uv-index')
let temperature = document.querySelector('#temperature')
let futureDays = document.querySelector('#future-days')
let alert = document.querySelector('#alert')
let apiKey = 'bcb88dc7e5fd8beb5627450205be6b7c'
let inputVal = ''
let storedCity = []
let cityArr = []
let forecastArr = []
let card = ''
let cityName = ''
let clearBtn = document.querySelector('#clear-btn')

// When Page loaded, rander localstorage to page
document.addEventListener('DOMContentLoaded', function () {
    cityArr = JSON.parse(localStorage.getItem('storedCity')) || []
    searchList.innerHTML = cityArr.map((item) => {
        return `<li class="newBox"><button class="newBtn">${item}</button></li>`
    })
        .join("")
    searchList.addEventListener('click', function (e) {
        e.preventDefault()
        let target = e.target
        inputVal = target.textContent
        getCurrentCityWeather(inputVal)
    })
})

// function for getting city weather
function getCurrentCityWeather() {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`
    return fetch(url)
        .then(function (response) {

            if (response.ok) {
                alert.classList.remove('show')
                alert.classList.add('hide')
            } else {
                alert.classList.remove('hide')
                alert.classList.add('show')
            }

            return response.json();
        })
        .then(function (data) {
            let iconCode = data.weather[0].icon
            let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
            let date = new Date(data.dt * 1000).toLocaleDateString()
            cityName = `${data.name}`
            currentCityName.innerHTML = `${data.name} (${date}) <img src="${iconUrl}">`
            wind.textContent = `${data.wind.speed} MPH`
            humidity.textContent = `${data.main.humidity}%`
            temperature.textContent = `${parseInt(data.main.temp)} \u2103`
            let lat = data.coord.lat
            let lon = data.coord.lon
            getOneCall(lat, lon)
                .then(function (oneCallData) {
                    let currentUVI = oneCallData.current.uvi
                    uvIndex.innerHTML = `${currentUVI}`
                    if (currentUVI < 4) {
                        uvIndex.setAttribute('class', 'green')
                    }
                    if (currentUVI >= 4 && currentUVI <= 8) {
                        uvIndex.setAttribute("class", "yellow");
                    }
                    if (currentUVI > 9) {
                        uvIndex.setAttribute("class", "red");
                    }

                    forecastArr = oneCallData.daily.splice(1, 5)
                    // Clear forecast area before rander
                    futureDays.innerHTML = ''
                    forecast5Day()
                })
            return cityName
        })
}

// function for 5-Day forecast
function forecast5Day() {
    for (let i = 0; i < forecastArr.length; i++) {
        let forecastIconCode = forecastArr[i].weather[0].icon
        let forecastIconUrl = `https://openweathermap.org/img/wn/${forecastIconCode}@2x.png`
        let forecastDate = new Date(forecastArr[i].dt * 1000).toLocaleDateString()
        let forecastTemp = forecastArr[i].temp.day
        let forecastWind = forecastArr[i].wind_speed
        let forecastHumidity = forecastArr[i].humidity

        //rander 5-Day forcast cards
        let card = document.createElement('ul')
        card.classList.add('col-2', 'cards')
        futureDays.appendChild(card)

        let li1 = document.createElement('li')
        li1.innerHTML = `Humidity: ${forecastHumidity} %`
        card.appendChild(li1)

        let li2 = document.createElement('li')
        li2.innerHTML = `Wind: ${forecastWind} MPH`
        card.insertBefore(li2, li1)

        let li3 = document.createElement('li')
        li3.innerHTML = `Temp: ${parseInt(forecastTemp)} \u2103`
        card.insertBefore(li3, li2)

        let li4 = document.createElement('li')
        li4.innerHTML = `<img src="${forecastIconUrl}">`
        card.insertBefore(li4, li3)

        let li5 = document.createElement('li')
        li5.classList.add('bolder')
        li5.innerHTML = `Date: ${forecastDate}`
        card.insertBefore(li5, li3)
    }
}

// function for getting UV-index
function getOneCall(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    return fetch(url).then(function (response) {
        return response.json();
    })

}

// function for adding search history to list
function addToList() {
    let MAX_STORAGE = 8
    let cityString = ''
    cityString = cityName.toUpperCase()
    storedCity.unshift(cityString)
    storedCity.splice(MAX_STORAGE)
    localStorage.setItem('storedCity', JSON.stringify(storedCity))
    cityArr = JSON.parse(localStorage.getItem('storedCity')) || []
    searchList.innerHTML = cityArr.map((item) => {
        return `<li><button class="new-btns">${item}</button></li>`
    })
        .join("")

    // adding event listener to new-btns
    searchList.addEventListener('click', function (e) {
        e.preventDefault()
        let target = e.target
        inputVal = target.textContent
        getCurrentCityWeather(inputVal)
    })
}

// click event for searching current city
inputGroup.addEventListener('submit', function (e) {
    e.preventDefault()
    inputVal = searchCity.value

    if (inputVal === '') {
        return
    }

    getCurrentCityWeather(inputVal)
        .then(function (cityName) {
            // add search to history list
            addToList()
        })


    // clear input value after search
    searchCity.value = ''
    futureDays.innerHTML = ''
})

//Clear the search history from the page
clearBtn.addEventListener('click', function () {
    cityArr = []
    localStorage.clear()
    document.location.reload()
})


