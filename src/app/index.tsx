import * as Device from 'expo-device';
import { Platform, StyleSheet, Text, ScrollView, View, Switch, Modal, Pressable, TextInput  } from 'react-native';
import HourTemperature from '@/components/ui/HourTemperature';
import DayTemperature from '@/components/ui/DayTemperature';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { WeatherResponse } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

type location = {
  name: string
  latitude: number
  longitude: number
}

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
  const [notifications, setNotifications] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [location, setLocation] = useState<location>({
    name: "Новочеркасск",
    latitude: 47.42,
    longitude: 40.09
  })
  const [nameInput, setNameInput] = useState(location.name);
  const [latInput, setLatInput] = useState(String(location.latitude));
  const [lonInput, setLonInput] = useState(String(location.longitude));

  useEffect(() => {
    AsyncStorage.getItem('notifications').then((saved) => {
      if (saved !== null) setNotifications(saved === 'true');
    });

    AsyncStorage.getItem('location')
    .then((saved) => {
      if (saved) {
        setLocation(JSON.parse(saved));
      }
    })
    .catch((error) => console.log(error.message))

    fetchWeather(location.latitude, location.longitude)
      .then((data) => setWeather(data))
      .catch((error) => {
        console.log(error.message)
      })
    
    setHour(new Date().getHours())
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('location', JSON.stringify(location))
      .catch((error) => console.log('Failed to save location:', error.message))
    setHour(new Date().getHours())

    fetchWeather(location.latitude, location.longitude)
      .then((data) => setWeather(data))
      .catch((error) => {
        console.log(error.message)
      })
    
    setHour(new Date().getHours())
  }, [location])

  return (
      <ScrollView 
        style={styles.safeArea} 
        showsVerticalScrollIndicator={false}>

        {/* название города */}
        <Pressable 
          style={styles.City}
          onPress={() => {
              setModalVisible((visible) => !visible)
          }}>
          <Text style={styles.Text}>{location.name}</Text>
            <View style={styles.CityContainer}>
              <Text style={styles.Text}>{location.latitude}</Text>
              <Text style={styles.Text}>{location.longitude}</Text>
            </View>
        </Pressable>

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

        {/* переключение уведомлений */}
        <View style={styles.Notification}>
          <Text style={styles.NotificationText}>Уведомления: </Text>
          <Switch style={styles.NotificationSwitch}
            value={notifications}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={'#f4f3f4'}
            onChange={() => {
              const next = !notifications;
              setNotifications(next);
              AsyncStorage.setItem('notifications', String(next));
            }}
          ></Switch>
        </View>

        {/* модалка локации */}
        <Modal 
          style={styles.Modal}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.ModalView}>
            <Text style={styles.ModalText}>Название локации:</Text>
            <TextInput 
              style={styles.Input} 
              value={nameInput} 
              onChangeText={setNameInput} 
              autoCorrect={false}
              spellCheck={false} 
              maxLength={20}/>
            <View style={styles.inputContainer}>
              <View style={styles.inputPersonInfo}>
                <Text style={styles.Text}>Широта:</Text>
                <TextInput value={latInput} onChangeText={(text) => {
                  if(Number(text) > 90 || Number(text) < -90) return
                  const filtered = text.replace(/[^0-9.,\-]/g, '');
                  setLatInput(filtered);
                }} maxLength={5} keyboardType="numeric" style={styles.Input}/>
              </View>
              <View style={styles.inputPersonInfo}>
                <Text style={styles.Text}>Долгота:</Text>
                <TextInput value={lonInput} onChangeText={(text) => {
                  if(Number(text) > 180 || Number(text) < -180) return
                  const filtered = text.replace(/[^0-9.,\-]/g, '');
                  setLonInput(filtered);
                }} maxLength={5} keyboardType="numeric" style={styles.Input}/>
              </View>
            </View>

            <Pressable
              style={styles.CloseModal}
              onPress={() => {
                setLocation({name: nameInput, longitude: Number(lonInput), latitude: Number(latInput)})
                setModalVisible((visible) => !visible)
              }}>
              <Text style={styles.CloseModalText}>Сохранить</Text>
            </Pressable>
          </View>
        </Modal>

        {Platform.OS === 'web'}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  ModalText: {
    marginTop: 15,
    fontSize: 20,
    color: "white"
  },
  inputPersonInfo: {
    display: "flex",
    flexDirection: "column"
  },
  inputContainer: {
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "row",
    gap: 20
  },
  Input: {
    textAlign: "center",
    color: "white",
    height: 50,
    alignContent: "center",
    backgroundColor: "rgb(114, 179, 192)",
    fontSize: 20,
  },
  CloseModalText: {
    marginLeft: "auto",
    marginRight: "auto",
    width: "auto",
    fontSize: 25,
    color: "white"
  },
  CloseModal: {
    marginTop: 30,
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    width: "60%",
    borderRadius: 15,
    padding: 5,
    backgroundColor: "rgb(67, 189, 216)",
  },
  ModalView: {
    margin: "auto",
    width: 300,
    height: 300,
    backgroundColor: "rgb(61, 142, 161)",
    borderRadius: 15,
  },
  Modal: {
    backgroundColor: "rgba(0,0,0, 0.5)"
  },
  NotificationSwitch: {
    marginTop: 5
  },
  NotificationText: {
    marginLeft: 50,
    fontSize: 25,
    color: "white"
  },
  Notification: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
    marginTop: 15
  },
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
  CityContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 20
  },
  City: {
    marginLeft: "auto",
    marginRight: "auto",
    height: 120,
    width: "100%",
    alignItems: "center",
    paddingBottom: 25,
    marginTop: 25,
    backgroundColor: "rgb(82, 194, 219)",
    borderRadius: 25
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
