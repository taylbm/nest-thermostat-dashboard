import React, { useState, useEffect } from "react";
import Plotly from "plotly.js-dist";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

function getColor(data) {
  // enter your conditional coloring code here
  if (data === "HEAT") {
    return "red";
  } else if (data === "COOL") {
    return "blue";
  } else if (data == "OFF") {
    return "black";
  } else {
    return "white";
  }
}
const ThermostatScatterChart: React.FC = () => {
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState("°C");

  useEffect(() => {
    const fetchDataAndPlot = async () => {
      try {
        const response = await fetch(
          "https://us-central1-routewx-1482507153524.cloudfunctions.net/nest-thermostat-api"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log(jsonData);

        const temperatureData = jsonData.filter(
          (entry: any) => entry.AmbientTemperatureCelsius !== -999
        );
        const humidityData = jsonData.filter(
          (entry: any) => entry.AmbientHumidityPercent !== -999
        );

        const xTemperatureData = temperatureData.map(
          (entry: any) => new Date(entry.Timestamp)
        );

        const xHumidityData = humidityData.map(
          (entry: any) => new Date(entry.Timestamp)
        );

        const temperatureTrace = {
          x: xTemperatureData,
          y: temperatureData.map((entry: any) =>
            isFahrenheit
              ? celsiusToFahrenheit(entry.AmbientTemperatureCelsius).toFixed(2)
              : entry.AmbientTemperatureCelsius.toFixed(2)
          ),
          mode: "markers",
          type: "scatter",
          name: `Temperature (${temperatureUnit})`,
          yaxis: "y1",
          marker: { color: "tan" },
        };

        const humidityTrace = {
          x: xHumidityData,
          y: humidityData.map((entry: any) =>
            entry.AmbientHumidityPercent.toFixed(2)
          ),
          mode: "markers",
          type: "scatter",
          name: "Humidity (%)",
          yaxis: "y2",
          marker: { color: "green" },
        };

        const modeData = jsonData.filter((entry: any) => entry.Mode);

        const xModeData = modeData.map(
          (entry: any) => new Date(entry.Timestamp)
        );

        const modeTrace = {
          x: xModeData,
          y: modeData.map((entry: any) => entry.Mode),
          type: "bar",
          hovertemplate: "Antigen <b>%{y}</b><extra></extra>",
          name: "Mode",
          hovermode: "closest",
          yaxis: "y3",
          marker: {
            color: modeData.map((entry: any) => getColor(entry.Mode)),
          },
        };

        const heatTemperatureData = jsonData.filter(
          (entry: any) => entry.HeatTemperatureSetpointCelsius !== -999
        );

        const xHeatTemperatureData = heatTemperatureData.map(
          (entry: any) => new Date(entry.Timestamp)
        );

        const heatTemperatureTrace = {
          x: xHeatTemperatureData,
          y: heatTemperatureData.map((entry: any) =>
            isFahrenheit
              ? celsiusToFahrenheit(
                  entry.HeatTemperatureSetpointCelsius
                ).toFixed(2)
              : entry.HeatTemperatureSetpointCelsius.toFixed(2)
          ),
          mode: "markers",
          type: "scatter",
          name: "Heat Temperature Setpoint (°C)",
          yaxis: "y",
          marker: { color: "red" },
        };

        const coolTemperatureData = jsonData.filter(
          (entry: any) => entry.CoolTemperatureSetpointCelsius !== -999
        );

        const xCoolTemperatureData = coolTemperatureData.map(
          (entry: any) => new Date(entry.Timestamp)
        );

        const coolTemperatureTrace = {
          x: xCoolTemperatureData,
          y: coolTemperatureData.map((entry: any) =>
            isFahrenheit
              ? celsiusToFahrenheit(
                  entry.CoolTemperatureSetpointCelsius
                ).toFixed(2)
              : entry.CoolTemperatureSetpointCelsius.toFixed(2)
          ),
          mode: "markers",
          type: "scatter",
          name: "Cool Temperature Setpoint (°C)",
          yaxis: "y",
          marker: { color: "blue" },
        };

        const layout = {
          title: "Ambient Temperature, Humidity, and Mode vs Time",
          xaxis: {
            title: "Time",
          },
          yaxis: {
            title: `Temperature (${temperatureUnit})`,
            side: "left",
            rangemode: "tozero",
          },
          yaxis2: {
            title: "Humidity (%)",
            side: "right",
            overlaying: "y",
            rangemode: "tozero",
          },
          yaxis3: {
            title: "Mode",
            side: "right",
            overlaying: "y",
            rangemode: "tozero",
            position: 0.95,
          },
          legend: {
            orientation: "h",
            x: 0.0,
            y: -0.2,
          },
        };

        Plotly.newPlot(
          "scatter-chart-container",
          [
            temperatureTrace,
            humidityTrace,
            modeTrace,
            heatTemperatureTrace,
            coolTemperatureTrace,
          ],
          layout
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataAndPlot();
  }, [isFahrenheit]);

  const handleToggleChange = () => {
    setIsFahrenheit((prevIsFahrenheit) => !prevIsFahrenheit);
    setTemperatureUnit((prevUnit) => (prevUnit === "°C" ? "°F" : "°C"));
  };

  const celsiusToFahrenheit = (celsius: number) => {
    return (celsius * 9) / 5 + 32;
  };

  return (
    <div style={{ position: "relative" }}>
      <div id="scatter-chart-container" style={{ zIndex: 0 }} />
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
        <FormControlLabel
          control={
            <Switch checked={isFahrenheit} onChange={handleToggleChange} />
          }
          label="Temperature Unit (°F / °C)"
        />
      </div>
    </div>
  );
};

export default ThermostatScatterChart;
