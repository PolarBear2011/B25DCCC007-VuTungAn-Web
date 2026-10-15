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
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

  function renderCurrentWeather() {
    const current = weather.current;
    const units = weather.current_units;
    const info = getWeatherInfo(current.weather_code);

    return (
      <div className="current-card">
        <h2>{selectedCity.name}</h2>
        <div className="current-main">
          <span className="current-icon">{info.icon}</span>
          <span className="current-temp">
            {Math.round(current.temperature_2m)}
            {units.temperature_2m}
          </span>
        </div>
        <p className="current-desc">{info.text}</p>
        <div className="current-details">
          <div className="detail-item">
            <span className="detail-label">Độ ẩm</span>
            <span className="detail-value">
              {current.relative_humidity_2m} {units.relative_humidity_2m}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tốc độ gió</span>
            <span className="detail-value">
              {current.wind_speed_10m} {units.wind_speed_10m}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cập nhật lúc</span>
            <span className="detail-value">{formatUpdateTime(current.time)}</span>
          </div>
        </div>
      </div>
    );
  }

  function renderForecast() {
    const daily = weather.daily;

    return (
      <div className="forecast-list">
        {daily.time.map((dateString, index) => {
          const info = getWeatherInfo(daily.weather_code[index]);
          const day = formatDay(dateString);
          return (
            <div className="forecast-card" key={dateString}>
              <div className="forecast-day">{day.dayName}</div>
              <div className="forecast-date">{day.shortDate}</div>
              <div className="forecast-icon">{info.icon}</div>
              <div className="forecast-desc">{info.text}</div>
              <div className="forecast-temp">
                <span className="temp-max">{Math.round(daily.temperature_2m_max[index])}°</span>
                <span className="temp-min">{Math.round(daily.temperature_2m_min[index])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>THỜI TIẾT VIỆT NAM</h1>
        <p>Dữ liệu từ Open-Meteo</p>
      </header>

      <section className="section">
        <h2 className="section-title">Chọn thành phố</h2>
        <div className="city-list">
          {CITIES.map((city) => {
            let className = "city-card";
            if (city.featured) className += " featured";
            if (city.id === selectedCity.id) className += " selected";
            return (
              <button
                key={city.id}
                className={className}
                onClick={() => setSelectedCity(city)}
              >
                {city.featured && <span className="city-star">⭐ Nổi bật</span>}
                <span className="city-name">{city.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Thời tiết hiện tại</h2>
        {loading && <p className="message">Đang tải dữ liệu thời tiết...</p>}
        {!loading && error && <p className="message error">{error}</p>}
        {!loading && !error && weather && renderCurrentWeather()}
      </section>

      <section className="section">
        <h2 className="section-title">Dự báo 7 ngày</h2>
        {loading && <p className="message">Đang tải dữ liệu dự báo...</p>}
        {!loading && error && <p className="message error">Không có dữ liệu dự báo.</p>}
        {!loading && !error && weather && renderForecast()}
      </section>
    </div>
  );
}

export default App;