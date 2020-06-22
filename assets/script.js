$( document ).ready(function() {
  // History of searched cities
  var historyArray = [];

  // Function to update history array
  var historyUpdate = function(currentCity){
    if( currentCity !== "" ){
      // Add current city to history array
      historyArray.push(currentCity);

      // If history array exceeds 10-item limit, remove the first (oldest) city
      if( historyArray.length > 10 ){
        historyArray.shift();
      }
      
      // Empty current display of history array
      $("#historyDiv").empty();

      // Display each item of current history array
      historyArray.forEach(function(city) {
        $("#historyDiv").prepend($(`<div class='historyCity'>${city}</div>`))
      })
    }
  }

  // Handle the event for loading data for a new city
  var handleCitySearch = function(event) {
    // If this was triggered by an event rather than page load,
    if( event ) {
      event.preventDefault();
      // Grab input for current city search depending on whether it was a submit event or click event
      if( event.type === "submit" ){
        var currentCitySearch = event.target.children[0].value;
      } else if ( event.type === "click" ){
        var currentCitySearch = event.target.innerHTML;
      }
      
    // Else if this is triggered by page load,
    } else {
      // Load last searched city if it exists, otherwise load Tokyo
      if( localStorage.getItem("currentCity") ){
        var currentCitySearch = localStorage.getItem("currentCity");
      } else {
        var currentCitySearch = "Tokyo";
      }
    }

    // Today's date
    var currentDay = moment().format('dddd, D MMMM YYYY')

    // Empty existing elements from current city main div and 5-day forecast div
    $("#currentCityDiv").empty();
    $("#forecastDiv").empty();

    // Run an AJAX call to the OpenWeatherMap API with the relevant parameters for today's weather in the city
    var APIKey = "9959baa3a409f1003d3597e82895e4eb";
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + currentCitySearch + "&units=metric&appid=" + APIKey,
      method: "GET",
    }).then(function(response) {

      // Grab elements from response
      var currentCity = response.name;

      // var todayWeatherIcon = response.weather[0].icon;
      var currentCityIcon = $("<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png'/>");
      // var currentCityHeader = $("<div class='center'><h1>" + currentCity + "</h1><span class='secondaryStyle'>" + currentDay + "</span></div>");
      var todayTemp = $("<div class='center'><span class='secondaryStyle'>Temperature:</span>" + response.main.temp + " °C" + "</div>");
      var todayHumidity = $("<div class='center'><span class='secondaryStyle'>Humidity:</span>" + response.main.humidity + " %" + "</div>");
      var todayWindSpeed = $("<div class='center'><span class='secondaryStyle'>Wind Speed:</span>" + response.wind.speed + "m/s" + "</div>");
      var currentCityLat = response.coord.lat;
      var currentCityLon = response.coord.lon;

      // Display today's weather and date for current city to DOM
      var currentCityHeader = $("<div class='center'>");
      currentCityHeader.append($("<h1>" + currentCity + "</h1>"));
      currentCityHeader.append($("<span class='secondaryStyle'>" + currentDay + "</span>"));
      currentCityHeader.append(currentCityIcon);
      $("#currentCityDiv").append(currentCityHeader);
      $("#currentCityDiv").append(todayTemp);
      $("#currentCityDiv").append(todayHumidity);
      $("#currentCityDiv").append(todayWindSpeed);

      // Run an AJAX call to grab current city's UV Index for today
      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?units=metric&appid=" + APIKey + "&lat=" + currentCityLat + "&lon=" + currentCityLon,
        method: "GET",
      }).then(function(response) {
        var todayUVSpan = $("<span class='uv'>");
        $(todayUVSpan).html(response.value);
        // Depending on UV index, add relevant class for styling
        if( response.value < 3){
          todayUVSpan.addClass("uv-low");
        } else if( response.value < 6){
          todayUVSpan.addClass("uv-moderate");
        } else if( response.value < 8){
          todayUVSpan.addClass("uv-high");
        } else if( response.value < 11){
          todayUVSpan.addClass("uv-veryhigh");
        } else if( response.value >= 11){
          todayUVSpan.addClass("uv-extreme");
        }
        // Display UV index to DOM
        var todayUVDiv = $("<div class='center secondaryStyle'>UV Index:</div>");
        todayUVDiv.append(todayUVSpan);
        $("#currentCityDiv").append(todayUVDiv);

        // Run function to add submitted city to history array
        historyUpdate(currentCity);
        });

        // Save last searched city to local storage
        localStorage.setItem("currentCity", currentCity);

    });

    // Run an AJAX call to the OpenWeatherMap API with the relevant parameters for the 5-day forecast
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCitySearch + "&units=metric&appid=" + APIKey,
      method: "GET",
    }).then(function(response) {
      // console.log(response);
      var forecastHeader = $("<div id='forecastHeader'><h1>5-Day Forecast:</h1></div>");
      $("#forecastDiv").append(forecastHeader);

      // Grab temperature and humidity for each day of 5-day forecast
      var j = 1;
      for( i = 0; i < response.list.length; i++ ){
        if( (i+1)%8 === 0 ){
          var forecastIcon = $("<img src='http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png'/>");
          var forecastTemp = response.list[i].main.temp;
          var forecastHumidity = response.list[i].main.humidity;

          var forecastDayHeader = $("<div id='forecastDayHeader'>");
          forecastDayHeader.append($("<p class='forecastDate'>" + moment().add(j, 'day').format('D MMM') + "</p>"));
          forecastDayHeader.append(forecastIcon);

          var newForecast = $("<div class='forecastDay'>");
          newForecast.append(forecastDayHeader);
          newForecast.append($("<p><span class='secondaryStyle'>Temp:  </span>" + Math.round(forecastTemp) + " °C</p>"));
          newForecast.append($("<p><span class='secondaryStyle'>Humidity:  </span>" + forecastHumidity + " %</p>"));

          // Display each day's data to DOM
          $("#forecastDiv").append($(newForecast));
          
          j++;
        }
      }
      // var day1temp = response.list.

    })

  };

  // When the search form is submitted, run function for displaying data for searched city
  $("#searchForm").on("submit", handleCitySearch);

  // When a city from the history list is clicked, run function for displaying data for that city
  $("#historyDiv").on("click", ".historyCity", handleCitySearch);

  // On page load, load initial current city
  handleCitySearch();

});