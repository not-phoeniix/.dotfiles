export const Weather = (WeatherUrlLongitude = Variable(0), WeatherUrlLatitude = Variable(0)) => {
    const tempLabel = Widget.Label("temp: 20°F");
    const humidLabel = Widget.Label("humid: 0%");

    function refreshWeather() {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${WeatherUrlLatitude.value}&longitude=${WeatherUrlLongitude.value}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=3`;
        Utils.fetch(url)
            .then(res => res.json())
            .then(data => {
                tempLabel.label = `temp: ${data.current.temperature_2m}${data.current_units.temperature_2m}`;
                humidLabel.label = `humid: ${data.current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;
            });
    }

    return Widget.Box({
        className: "desktop-widget weather",
        vertical: true,
        children: [
            tempLabel,
            humidLabel
        ]
    })
        // weather refresh called every 15 min
        .poll(60_000 * 15, refreshWeather)
        .hook(WeatherUrlLongitude, refreshWeather)
        .hook(WeatherUrlLatitude, refreshWeather);
}
