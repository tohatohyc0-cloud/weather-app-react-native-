import * as Device from 'expo-device';
import { Platform, StyleSheet, Text, ScrollView, View } from 'react-native';
import HourTemperature from '@/components/ui/HourTemperature';
import DayTemperature from '@/components/ui/DayTemperature';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { WeatherResponse, Hourly, Current } from '@/types';
import axios from 'axios';

const latitude = 47.42
const longitude = 40.09

async function fetchWeather(latitude: number, longitude: number){
  const response = await axios.get<WeatherResponse>(`https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
    `&forecast_days=7&timezone=auto`)
  return response.data
}

function getWeatherCategory(code: number | undefined): 'солнечно' | 'облачно' | 'дождь' {
  if (code === 0 || !code) return 'солнечно';
  if ([1, 2, 3, 45, 48].includes(code)) return 'облачно';
  return 'дождь';
}


export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherResponse>()
  const [hour, setHour] = useState<number>(0)

  useEffect(() => {
    fetchWeather(latitude, longitude)
      .then((data) => setWeather(data))
    
    setHour(new Date().getHours())
  }, [])

  return (
      <ScrollView 
        style={styles.safeArea} 
        showsVerticalScrollIndicator={false}>
        {/* название города */}
        <View style={styles.City}>
          <Text style={styles.Text}>Новочеркасск</Text>
        </View>

        {/* температура и погода сейчас */}
        <View style={styles.MainContainer}>
          <Text style={styles.MainTemperature}>{weather?.current.temperature_2m}°</Text>
          <Text style={styles.Text}>{getWeatherCategory(weather?.daily.weather_code[0])}</Text>
        </View>

        {/* температура и погода сейчас */}
        <View style={styles.HourInfoContainer}>
          <ScrollView 
              contentContainerStyle={styles.HourInfoContent} 
              horizontal
              showsHorizontalScrollIndicator={false}>
            {weather?.hourly.time.slice(hour, 24 + hour).map((time, i) => {
              const index = i + hour
              return(
                <HourTemperature 
                  key={time}
                  time={time.split('T')[1]}
                  wet={weather.hourly.relative_humidity_2m[index]}
                  temperature={weather.hourly.temperature_2m[index]}
                  icon={getWeatherCategory(weather.hourly.weather_code[index])}
                  />
                )
            })}
          </ScrollView>
        </View>

        {/* температура и погода по дням */}
        <View style={styles.DayInfoContainer}>
          {weather?.daily.time.slice(0, 7).map((time, i) => {
            return(
              <DayTemperature
                  key={i}
                  date={time}
                  wet={weather.daily.precipitation_probability_max[i]}
                  iconDay={getWeatherCategory(weather.daily.weather_code[i])}
                  iconNight={getWeatherCategory(weather.daily.weather_code[i])}
                  dayTemperature={weather.daily.temperature_2m_max[i]}
                  nighTemperature={weather.daily.temperature_2m_min[i]}
                />
            )
          })}
        </View>

        {Platform.OS === 'web'}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  DayInfoContainer:{
    marginTop: 25,
    backgroundColor: "rgba(233, 227, 227, 0.2)",
    height: "auto",
    borderRadius: 15,
    padding: 15,
    paddingTop: 5,
    paddingLeft: 5,
    marginBottom: 25,
  },
  HourInfoContent: {
    display: "flex",
    flexDirection: "row",
    gap: 25
  },
  HourInfoContainer: {
    backgroundColor: "rgba(233, 227, 227, 0.2)",
    height: 200,
    borderRadius: 15,
    paddingTop: 5,
    paddingLeft: 25
  },
  City: {
    marginLeft: "auto",
    marginRight: "auto",
    paddingBottom: 25,
  },
  MainContainer: {
    display: "flex",
    flexDirection: 'column',
    paddingBottom: 25,
  },
  MainTemperature:{
    fontSize: 75,
    color: "white"
  },
  Text: {
    marginTop: 15,
    fontSize: 25,
    color: "white"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    backgroundColor: "rgb(61, 142, 161)",
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
