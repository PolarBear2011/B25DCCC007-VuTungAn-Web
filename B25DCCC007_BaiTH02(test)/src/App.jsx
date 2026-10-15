import { useState, useEffect } from "react";
import "./App.css";

const CITIES = [
  { id: "hanoi", name: "Hà Nội", latitude: 21.0285, longitude: 105.8542, featured: true },
  { id: "hcm", name: "TP. Hồ Chí Minh", latitude: 10.8231, longitude: 106.6297, featured: true },
  { id: "hue", name: "Huế", latitude: 16.4637, longitude: 107.5909, featured: false },
  { id: "danang", name: "Đà Nẵng", latitude: 16.0544, longitude: 108.2022, featured: false },
  { id: "nhatrang", name: "Nha Trang", latitude: 12.2388, longitude: 109.1967, featured: false },
  { id: "dalat", name: "Đà Lạt", latitude: 11.9404, longitude: 108.4583, featured: false },
  { id: "haiphong", name: "Hải Phòng", latitude: 20.8449, longitude: 106.6881, featured: false },
  { id: "cantho", name: "Cần Thơ", latitude: 10.0452, longitude: 105.7469, featured: false },
];

const ICON_URL = "https://openweathermap.org/img/wn/";

const WEATHER_CODES = {
  0: { icon: "01d", text: "Trời quang" },
  1: { icon: "02d", text: "Ít mây" },
  2: { icon: "03d", text: "Có mây" },
  3: { icon: "04d", text: "Nhiều mây" },
  45: { icon: "50d", text: "Sương mù" },
  48: { icon: "50d", text: "Sương mù" },
  51: { icon: "09d", text: "Mưa phùn nhẹ" },
  53: { icon: "09d", text: "Mưa phùn" },
  55: { icon: "09d", text: "Mưa phùn dày" },
  61: { icon: "10d", text: "Mưa nhẹ" },
  63: { icon: "10d", text: "Mưa vừa" },
  65: { icon: "10d", text: "Mưa to" },
  71: { icon: "13d", text: "Tuyết nhẹ" },
  73: { icon: "13d", text: "Tuyết vừa" },
  75: { icon: "13d", text: "Tuyết dày" },
  80: { icon: "09d", text: "Mưa rào nhẹ" },
  81: { icon: "09d", text: "Mưa rào" },
  82: { icon: "09d", text: "Mưa rào mạnh" },
  95: { icon: "11d", text: "Dông" },
  96: { icon: "11d", text: "Dông kèm mưa đá" },
  99: { icon: "11d", text: "Dông kèm mưa đá lớn" },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { icon: null, text: "Không xác định" };
}

function WeatherIcon({ code }) {
  if (!code) return <span>❓</span>;
  return <img className="weather-img" src={`${ICON_URL}${code}@2x.png`} alt="" />;
}

function formatUpdateTime(isoTime) {
  const [date, time] = isoTime.split("T");
  const formattedDate = date.split("-").reverse().join("/");
  return `${time} - ${formattedDate}`;
}

function formatDay(dateString) {
  const date = new Date(dateString + "T00:00:00");
  const [, month, day] = dateString.split("-");
  return {
    dayName: DAY_NAMES[date.getDay()],
    shortDate: `${day}/${month}`,
  };
}

function Hidden({ round }) {
  return <span className={round ? "hidden-bar round" : "hidden-bar"}></span>;
}

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedCity) return;

    let ignore = false;

    async function fetchWeather() {
      setLoading(true);
      setError("");

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${selectedCity.latitude}` +
        `&longitude=${selectedCity.longitude}` +
        "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=Asia%2FBangkok" +
        "&forecast_days=7";

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Máy chủ trả về lỗi " + response.status);
        }
        const data = await response.json();
        if (!ignore) {
          setWeather(data);
        }
      } catch (err) {
        if (!ignore) {
          setWeather(null);
          setError(
            "Không thể tải dữ liệu thời tiết. Hãy kiểm tra kết nối Internet và thử lại. (" +
              err.message +
              ")"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      ignore = true;
    };
  }, [selectedCity]);

  function handleChangeCity(event) {
    const city = CITIES.find((item) => item.id === event.target.value);
    setWeather(null);
    setError("");
    setLoading(false);
    setSelectedCity(city || null);
  }

  const current = weather ? weather.current : null;
  const units = weather ? weather.current_units : null;
  const currentInfo = current ? getWeatherInfo(current.weather_code) : null;
  const forecastDays = weather ? weather.daily.time : Array.from({ length: 7 }, () => null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>THỜI TIẾT HÔM NAY</h1>
      </header>

      <section className="section">
        <h2 className="section-title">Chọn thành phố</h2>
        <select
          className="city-select"
          value={selectedCity ? selectedCity.id : ""}
          onChange={handleChangeCity}
        >
          <option value=""></option>
          {CITIES.map((city) => (
            <option key={city.id} value={city.id}>
              {city.featured ? "⭐ " : ""}
              {city.name}
            </option>
          ))}
        </select>
        {loading && <p className="message">Đang tải dữ liệu thời tiết...</p>}
        {error && <p className="message error">{error}</p>}
      </section>

      <section className="section">
        <h2 className="section-title">Thời tiết hiện tại</h2>
        <div className="current-card">
          <h2>{selectedCity ? selectedCity.name : <Hidden />}</h2>
          <div className="current-main">
            <span className="current-icon">
              {currentInfo ? <WeatherIcon code={currentInfo.icon} /> : <Hidden round />}
            </span>
            <span className="current-temp">
              {current ? Math.round(current.temperature_2m) + units.temperature_2m : <Hidden />}
            </span>
          </div>
          <p className="current-desc">{currentInfo ? currentInfo.text : <Hidden />}</p>
          <div className="current-details">
            <div className="detail-item">
              <span className="detail-label">Độ ẩm</span>
              <span className="detail-value">
                {current ? `${current.relative_humidity_2m} ${units.relative_humidity_2m}` : <Hidden />}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tốc độ gió</span>
              <span className="detail-value">
                {current ? `${current.wind_speed_10m} ${units.wind_speed_10m}` : <Hidden />}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cập nhật lúc</span>
              <span className="detail-value">
                {current ? formatUpdateTime(current.time) : <Hidden />}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Dự báo thời tiết 7 ngày tiếp theo</h2>
        <div className="forecast-list">
          {forecastDays.map((dateString, index) => {
            const daily = weather ? weather.daily : null;
            const info = daily ? getWeatherInfo(daily.weather_code[index]) : null;
            const day = dateString ? formatDay(dateString) : null;
            return (
              <div className="forecast-card" key={dateString || index}>
                <div className="forecast-day">{day ? day.dayName : <Hidden />}</div>
                <div className="forecast-date">{day ? day.shortDate : <Hidden />}</div>
                <div className="forecast-icon">{info ? <WeatherIcon code={info.icon} /> : <Hidden round />}</div>
                <div className="forecast-desc">{info ? info.text : <Hidden />}</div>
                <div className="forecast-temp">
                  <span className="temp-max">
                    {daily ? Math.round(daily.temperature_2m_max[index]) + "°" : <Hidden />}
                  </span>
                  <span className="temp-min">
                    {daily ? Math.round(daily.temperature_2m_min[index]) + "°" : <Hidden />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;