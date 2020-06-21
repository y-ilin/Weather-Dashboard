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

  $("#searchForm").on("submit", function(event) {
    event.preventDefault();

    // Today's date
    var currentDay = moment().format('dddd, D MMMM YYYY')

    // Empty existing elements from current city main div and 5-day forecast div
    $("#currentCityDiv").empty();
    $("#forecastDiv").empty();


    // Grab form input for current city search
    var currentCitySearch = $("#searchFormInput")[0].value;

    // Run an AJAX call to the OpenWeatherMap API with the relevant parameters for today's weather in the city
    var APIKey = "9959baa3a409f1003d3597e82895e4eb";
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + currentCitySearch + "&units=metric&appid=" + APIKey,
      method: "GET",
    }).then(function(response) {
      console.log(response)

      // Grab elements from response
      var currentCity = response.name;
      console.log(response.weather[0].icon)
      // var todayWeatherIcon = response.weather[0].icon;
      var currentCityIcon = $("<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png'/>");
      var currentCityHeader = $("<div>" + currentCity + "<span id='todaysDate'>" + currentDay + "</span></div>");
      var todayTemp = $("<div>" + response.main.temp + " °C" + "</div>");
      var todayHumidity = $("<div>" + response.main.humidity + "%" + "</div>");
      var todayWindSpeed = $("<div>" + response.wind.speed + "m/s" + "</div>");
      var currentCityLat = response.coord.lat;
      var currentCityLon = response.coord.lon;

      // Display today's weather and date for current city to DOM
      $("#currentCityDiv").append(currentCityHeader);
      $("#currentCityDiv").append(currentCityIcon);
      $("#currentCityDiv").append(todayTemp);
      $("#currentCityDiv").append(todayHumidity);
      $("#currentCityDiv").append(todayWindSpeed);

      // Run an AJAX call to grab current city's UV Index for today
      $.ajax({
        url: "http://api.openweathermap.org/data/2.5/uvi?units=metric&appid=" + APIKey + "&lat=" + currentCityLat + "&lon=" + currentCityLon,
        method: "GET",
      }).then(function(response) {
        var todayUVDiv = $("<div class='uv'>");

        // Depending on UV index, add relevant class for styling
        if( response.value < 3){
          todayUVDiv.addClass("uv-low");
        } else if( response.value < 6){
          todayUVDiv.addClass("uv-moderate");
        } else if( response.value < 8){
          todayUVDiv.addClass("uv-high");
        } else if( response.value < 11){
          todayUVDiv.addClass("uv-veryhigh");
        } else if( response.value >= 11){
          todayUVDiv.addClass("uv-extreme");
        }

        // Display UV index to DOM
        $(todayUVDiv).html(response.value);
        $("#currentCityDiv").append($(todayUVDiv));

        // Run function to add submitted city to history array
        historyUpdate(currentCity);
        });

    });

    // Run an AJAX call to the OpenWeatherMap API with the relevant parameters for the 5-day forecast
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCitySearch + "&units=metric&appid=" + APIKey,
      method: "GET",
    }).then(function(response) {
      // console.log(response);

      // Grab temperature and humidity for each day of 5-day forecast
      var j = 1;
      for( i = 0; i < response.list.length; i++ ){
        if( (i+1)%8 === 0 ){
          var forecastIcon = $("<img src='http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png'/>");
          var forecastTemp = response.list[i].main.temp;
          var forecastHumidity = response.list[i].main.humidity;

          var newForecast = $("<div class='forecastDay'>");
          newForecast.append($("<p>" + moment().add(j, 'day').format('D MMM') + "</p>"));
          newForecast.append(forecastIcon);
          newForecast.append($("<p>Temp:  " + Math.round(forecastTemp) + " °C</p>"));
          newForecast.append($("<p>Humidity:  " + forecastHumidity + " %</p>"));

          // Display each day's data to DOM
          $("#forecastDiv").append($(newForecast));
          
          j++;
        }
      }
      // var day1temp = response.list.

    })

  });


});


  // ``` GIVEN a weather dashboard with form inputs WHEN I search for a city THEN I
  // am presented with current and future conditions for that city and that city is
  // added to the search history WHEN I view current weather conditions for that city
  // THEN I am presented with the city name, the date, an icon representation of
  // weather conditions, the temperature, the humidity, the wind speed, and the UV
  // index WHEN I view the UV index THEN I am presented with a color that indicates
  // whether the conditions are favorable, moderate, or severe WHEN I view future
  // weather conditions for that city THEN I am presented with a 5-day forecast that
  // displays the date, an icon representation of weather conditions, the
  // temperature, and the humidity WHEN I click on a city in the search history THEN
  // I am again presented with current and future conditions for that city WHEN I
  // open the weather dashboard THEN I am presented with the last searched city
  // forecast ```
