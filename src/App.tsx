import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  solid,
  regular,
  brands,
  icon,
} from "@fortawesome/fontawesome-svg-core/import.macro"; // <-- import styles to be used

type DateString = string;
type URL = string;

type ForecastPeriodData = {
  detailedForecast: string;
  endTime: DateString;
  icon: URL;
  isDaytime: boolean;
  name: string;
  number: number;
  shortForecast: string;
  startTime: DateString;
  temperature: number;
  temperatureTrend: string;
  temperatureUnit: string;
  windDirection: string;
  windSpeed: string;
};
type CountyData = {
  "@id": string;
  "@type": string;
  id: string;
  type: string;
  name: string;
  effectiveDate: DateString;
  expirationDate: DateString;
  state: string;
  cwa: string[];
  forecastOffices: string[];
  timeZone: string[];
  observationStations: unknown[];
  radarStation: unknown;
};
// https://www.weather.gov/documentation/services-web-api
// https://api.weather.gov/gridpoints/{office}/{grid X},{grid Y}/forecast
// https://api.weather.gov/points/{lat},{long}
function App() {
  // https://reactjs.org/docs/hooks-state.html
  /*
  useState<number>(initialState: number | (() => number)): [number, React.Dispatch<React.SetStateAction<number>>]
  */
  const [lat, setLat] = useState(37.7456);
  const [long, setLong] = useState(-97.0892);

  /**
   * {
      "number": 5,
      "name": "Friday",
      "startTime": "2022-11-04T06:00:00-05:00",
      "endTime": "2022-11-04T18:00:00-05:00",
      "isDaytime": true,
      "temperature": 47,
      "temperatureUnit": "F",
      "temperatureTrend": null,
      "windSpeed": "15 mph",
      "windDirection": "N",
      "icon": "https://api.weather.gov/icons/land/day/tsra,80/tsra,60?size=medium",
      "shortForecast": "Showers And Thunderstorms",
      "detailedForecast": "Showers and thunderstorms. Cloudy, with a high near 47. North wind around 15 mph, with gusts as high as 25 mph. Chance of precipitation is 80%."
    },
   */
  const [forecastData, setForecastData] = useState<ForecastPeriodData[]>();
  /**
   * {
        "@id": "https://api.weather.gov/zones/county/KSC201",
        "@type": "wx:Zone",
        "id": "KSC201",
        "type": "county",
        "name": "Washington",
        "effectiveDate": "2022-09-13T20:00:00+00:00",
        "expirationDate": "2200-01-01T00:00:00+00:00",
        "state": "KS",
        "cwa": [
            "TOP"
        ],
        "forecastOffices": [
            "https://api.weather.gov/offices/TOP"
        ],
        "timeZone": [
            "America/Chicago"
        ],
        "observationStations": [],
        "radarStation": null
    }
   */
  const [countyData, setCountyData] = useState<CountyData>();

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(function getLatLon(position) {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    });
  }, []);

  React.useEffect(() => {
    fetch(`https://api.weather.gov/points/${lat},${long}`)
      .then((res) => {
        return res.json();
      })
      .then(function (data) {
        return Promise.all([
          fetch(data.properties.county).then((res) => res.json()),
          fetch(data.properties.forecast).then((res) => res.json()),
        ]);
      })
      .then(function ([countyData, forecastData]) {
        setCountyData(countyData.properties);
        setForecastData(forecastData.properties.periods);
      });
  }, [lat, long]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="card">
          <h2>
            {countyData?.name} {countyData?.type}, {countyData?.state}
          </h2>
          <h1>
            {forecastData?.[0].name}
            <br />
            {forecastData?.[0].temperature} degrees{" "}
            {forecastData?.[0].temperatureUnit}
            <br />
            <WeatherIcon shortForecast={forecastData?.[0].detailedForecast} />
          </h1>
          {/* <h4>{forecastData?.[0].detailedForecast}</h4> */}
          <div>
            {lat},{long}
          </div>
        </div>

        <h3>7 day forecast</h3>
        <div className="card-row">
          {forecastData?.slice(1).map((x) => (
            <div className="card" title={x.detailedForecast}>
              <div>{x.name}</div>
              <div className="tempurature">{x.temperature}</div>
              <WeatherIcon shortForecast={x.detailedForecast} />
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

function WeatherIcon({ shortForecast }: { shortForecast?: string }) {
  if (!shortForecast) return null;
  if (/sun|clear/i.test(shortForecast)) {
    return <FontAwesomeIcon icon={solid("sun")} color="gold" />;
  } else if (/snow/i.test(shortForecast)) {
    return <FontAwesomeIcon icon={solid("snowflake")} />;
  } else if (/rain/i.test(shortForecast)) {
    return <FontAwesomeIcon icon={solid("cloud-rain")} />;
  } else if (/cloud/i.test(shortForecast)) {
    return <FontAwesomeIcon icon={solid("cloud")} />;
  }

  return null;
}

export default App;
