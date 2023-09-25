import React, { useEffect, useState } from "react";
import axios from "axios";

const Weather = ({ country }) => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${country.capital[0]}&units=Metric&APPID=${apiKey}`
      )
      .then((response) => response.data)
      .then((weather) => setWeatherData(weather));
  }, []);

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  console.log(weatherData);

  return (
    <div>
      <h1>Weather in {country.capital[0]}</h1>
      <p>temperature {weatherData.main.temp} Celcius</p>
      <img
        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
      />
      <p>wind {weatherData.wind.speed} m/s</p>
    </div>
  );
};

const Result = React.memo(({ country }) => {
  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>capital: {country.capital[0]}</div>
      <div>area: {country.area}</div>
      <br />
      <div>
        <strong>languange:</strong>
        {Object.values(country.languages).map((language) => (
          <li key={language}>{language}</li>
        ))}
      </div>
      <br />
      <img src={country.flags.png} />
      <Weather country={country} />
    </div>
  );
});

const App = () => {
  const [countries, setCountries] = useState(null);
  const [filter, setFilter] = useState("");
  const [shownCountry, setShownCountry] = useState("");

  useEffect(() => {
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then((response) => response.data)
      .then((_countries) => setCountries(_countries));
  }, []);

  if (!countries) {
    return <div>Loading...</div>;
  }

  const handleSearchFieldChange = (event) => {
    setFilter(event.target.value);
  };

  const handleShowButtonClick = (country) => {
    setShownCountry(country);
    setFilter("");
  };

  const filteredCountries = (() => {
    if (shownCountry !== "") {
      return Array(1).fill(
        countries.find((country) => country.name.common === shownCountry)
      );
    }

    return countries.filter((country) =>
      country.name.common.toLowerCase().includes(filter.toLowerCase())
    );
  })();

  return (
    <div>
      <div>
        <span>find countries </span>
        <input value={filter} onChange={handleSearchFieldChange} />
      </div>
      <div>
        {filteredCountries.length > 10 && (
          <div>Too many matches, specify another filter</div>
        )}
        {filteredCountries.length === 1 && (
          <Result country={filteredCountries[0]} />
        )}
        {filteredCountries.length > 1 && filteredCountries.length <= 10 && (
          <ul>
            {filteredCountries.map((country) => (
              <li key={country.name.common}>
                {country.name.common}
                <button
                  onClick={() => handleShowButtonClick(country.name.common)}
                >
                  show
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
