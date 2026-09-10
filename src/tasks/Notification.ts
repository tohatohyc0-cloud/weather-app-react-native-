import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WeatherResponse } from '@/types';

export const WEATHER_TASK = 'weather-hourly-task';

async function fetchWeather(latitude: number, longitude: number) {
  const response = await axios.get<WeatherResponse>(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,weather_code&forecast_days=2&timezone=auto`
  );
  return response.data;
}

function getWeatherCategory(code: number | undefined): 'солнечно' | 'облачно' | 'дождь' {
  if (code === 0 || !code) return 'солнечно';
  if ([1, 2, 3, 45, 48].includes(code)) return 'облачно';
  return 'дождь';
}

TaskManager.defineTask(WEATHER_TASK, async () => {
  try {
    const notificationsEnabled = await AsyncStorage.getItem('notifications');
    if (notificationsEnabled === 'false') {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const savedLocation = await AsyncStorage.getItem('location');
    if (!savedLocation) return BackgroundTask.BackgroundTaskResult.Failed;
    const location = JSON.parse(savedLocation);
    const weather = await fetchWeather(location.latitude, location.longitude);

    const now = new Date();
    const nextHour = now.getHours() + 2;

    const temp = Math.round(weather.hourly.temperature_2m[nextHour]);
    const category = getWeatherCategory(weather.hourly.weather_code[nextHour]);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: location.name,
        body: `Через час: ${temp}°, ${category}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60,
        repeats: false,
      }
    });

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.log(error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});