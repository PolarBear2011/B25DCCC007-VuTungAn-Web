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

const WEATHER_CODES = {
  0: { icon: "☀️", text: "Trời quang" },
  1: { icon: "🌤️", text: "Ít mây" },
  2: { icon: "⛅", text: "Có mây" },
  3: { icon: "☁️", text: "Nhiều mây" },
  45: { icon: "🌫️", text: "Sương mù" },
  48: { icon: "🌫️", text: "Sương mù" },
  51: { icon: "🌦️", text: "Mưa phùn nhẹ" },
  53: { icon: "🌦️", text: "Mưa phùn" },
  55: { icon: "🌦️", text: "Mưa phùn dày" },
  61: { icon: "🌧️", text: "Mưa nhẹ" },
  63: { icon: "🌧️", text: "Mưa vừa" },
  65: { icon: "🌧️", text: "Mưa to" },
  71: { icon: "❄️", text: "Tuyết nhẹ" },
  73: { icon: "❄️", text: "Tuyết vừa" },
  75: { icon: "❄️", text: "Tuyết dày" },
  80: { icon: "🌦️", text: "Mưa rào nhẹ" },
  81: { icon: "🌧️", text: "Mưa rào" },
  82: { icon: "🌧️", text: "Mưa rào mạnh" },
  95: { icon: "⛈️", text: "Dông" },
  96: { icon: "⛈️", text: "Dông kèm mưa đá" },
  99: { icon: "⛈️", text: "Dông kèm mưa đá lớn" },
};

const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const EMPTY = "???";
const EMPTY_INFO = { icon: "❔", text: EMPTY };

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { icon: "❓", text: "Không xác định" };
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
  const currentInfo = current ? getWeatherInfo(current.weather_code) : EMPTY_INFO;
  const forecastDays = weather ? weather.daily.time : Array.from({ length: 7 }, () => null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>THỜI TIẾT VIỆT NAM</h1>
        <p>Dữ liệu từ Open-Meteo</p>
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
          <h2>{selectedCity ? selectedCity.name : EMPTY}</h2>
          <div className="current-main">
            <span className="current-icon">{currentInfo.icon}</span>
            <span className="current-temp">
              {current ? Math.round(current.temperature_2m) + units.temperature_2m : EMPTY}
            </span>
          </div>
          <p className="current-desc">{currentInfo.text}</p>
          <div className="current-details">
            <div className="detail-item">
              <span className="detail-label">Độ ẩm</span>
              <span className="detail-value">
                {current ? `${current.relative_humidity_2m} ${units.relative_humidity_2m}` : EMPTY}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tốc độ gió</span>
              <span className="detail-value">
                {current ? `${current.wind_speed_10m} ${units.wind_speed_10m}` : EMPTY}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cập nhật lúc</span>
              <span className="detail-value">
                {current ? formatUpdateTime(current.time) : EMPTY}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Dự báo 7 ngày</h2>
        <div className="forecast-list">
          {forecastDays.map((dateString, index) => {
            const daily = weather ? weather.daily : null;
            const info = daily ? getWeatherInfo(daily.weather_code[index]) : EMPTY_INFO;
            const day = dateString ? formatDay(dateString) : { dayName: EMPTY, shortDate: EMPTY };
            return (
              <div className="forecast-card" key={dateString || index}>
                <div className="forecast-day">{day.dayName}</div>
                <div className="forecast-date">{day.shortDate}</div>
                <div className="forecast-icon">{info.icon}</div>
                <div className="forecast-desc">{info.text}</div>
                <div className="forecast-temp">
                  <span className="temp-max">
                    {daily ? Math.round(daily.temperature_2m_max[index]) + "°" : EMPTY}
                  </span>
                  <span className="temp-min">
                    {daily ? Math.round(daily.temperature_2m_min[index]) + "°" : EMPTY}
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