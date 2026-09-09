import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import * as BackgroundTask from 'expo-background-task';
import { WEATHER_TASK } from '../tasks/Notification'; // путь к вашему файлу с defineTask
import * as Notifications from 'expo-notifications';
import { Linking, Alert } from 'react-native';

async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Уведомления отключены',
      'Чтобы получать прогноз погоды, разрешите уведомления в настройках',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
}

async function registerWeatherTask() {
  await BackgroundTask.registerTaskAsync(WEATHER_TASK, {
    minimumInterval: 60
  });
}

import HomeScreen from '.';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
    requestNotificationPermission();
    registerWeatherTask().catch((e) => console.log(e));
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <HomeScreen/>
    </ThemeProvider>
  );
}