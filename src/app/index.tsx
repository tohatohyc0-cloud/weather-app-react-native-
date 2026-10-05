import DayTemperature from '@/components/ui/DayTemperature';
import HourTemperature from '@/components/ui/HourTemperature';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { WeatherResponse } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import bcrypt from "bcryptjs";
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const cities = [
  { "city": "Новочеркасск", "latitude": 47.4119248, "longitude": 40.1042066 },
  { "city": "Азов", "latitude": 47.1120631, "longitude": 39.4232597 },
  { "city": "Аксай", "latitude": 47.2676075, "longitude": 39.8755485 },
  { "city": "Батайск", "latitude": 47.138321, "longitude": 39.7508382 },
  { "city": "Белая Калитва", "latitude": 48.176948, "longitude": 40.8033169 },
  { "city": "Волгодонск", "latitude": 47.5165181, "longitude": 42.1984531 },
  { "city": "Гуково", "latitude": 48.0449422, "longitude": 39.9484635 },
  { "city": "Донецк", "latitude": 48.3350928, "longitude": 39.9460654 },
  { "city": "Зверево", "latitude": 48.043451, "longitude": 40.1264948 },
  { "city": "Зерноград", "latitude": 46.8494991, "longitude": 40.312765 },
  { "city": "Каменск-Шахтинский", "latitude": 48.3204412, "longitude": 40.268874 },
  { "city": "Константиновск", "latitude": 47.5773456, "longitude": 41.0967362 },
  { "city": "Красный Сулин", "latitude": 47.8830826, "longitude": 40.0781385 },
  { "city": "Миллерово", "latitude": 48.925821, "longitude": 40.3983302 },
  { "city": "Морозовск", "latitude": 48.3511724, "longitude": 41.8308006 },
  { "city": "Новошахтинск", "latitude": 47.7576522, "longitude": 39.9364709 },
  { "city": "Пролетарск", "latitude": 46.7038968, "longitude": 41.7274533 },
  { "city": "Ростов-на-Дону", "latitude": 47.2224364, "longitude": 39.7187866 },
  { "city": "Сальск", "latitude": 46.4751689, "longitude": 41.5412229 },
  { "city": "Семикаракорск", "latitude": 47.5177981, "longitude": 40.811585 },
  { "city": "Таганрог", "latitude": 47.2094907, "longitude": 38.935154 },
  { "city": "Цимлянск", "latitude": 47.6477668, "longitude": 42.093022 },
  { "city": "Шахты", "latitude": 47.7084247, "longitude": 40.2159154 }
]

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
  const [selectedSity, setSelectedSity] = useState<number>(0);
  const [location, setLocation] = useState<location>({
    name: "Новочеркасск",
    latitude: 47.42,
    longitude: 40.09
  })
  const [nameInput, setNameInput] = useState(location.name)
  const [latInput, setLatInput] = useState(String(location.latitude))
  const [lonInput, setLonInput] = useState(String(location.longitude))
  const [modalEnterVisible, setModalEnterVisible] = useState<boolean>(true)
  const [auth, setAuth] = useState<string | undefined>(undefined)
  const [login, setLogin] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  useEffect(() => {
    setLocation({name: cities[selectedSity].city, latitude: cities[selectedSity].latitude, longitude: cities[selectedSity].longitude })
    setNameInput(cities[selectedSity].city)
    setLatInput(cities[selectedSity].latitude.toString())
    setLonInput(cities[selectedSity].longitude.toString())
  }, [selectedSity])

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

    AsyncStorage.getItem('auth')
    .then((saved) => {
      if (saved) {
        setAuth(saved);
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
            {/*<View style={styles.CityContainer}>
              <Text style={styles.Text}>{location.latitude}</Text>
              <Text style={styles.Text}>{location.longitude}</Text>
            </View>*/}
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
              if (!next) {
                Notifications.cancelAllScheduledNotificationsAsync();
              }
            }}
          ></Switch>
        </View>

        {/* контактная информация */}
        <View style={styles.Info}>
          <Text style={styles.InfoText}>SemKovVol</Text>
          <Text style={styles.InfoText}>Контактная информация: </Text>
          <Text style={styles.InfoText}>Семочкин А.Б </Text>
          <Text style={styles.InfoText}>Волков В.С </Text>
          <Text style={styles.InfoText}>Коваленко Е.Я </Text>
          <Text style={styles.InfoText}>WeatherApp@gmail.com </Text>
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
                }} maxLength={10} keyboardType="numeric" style={styles.Input}/>
              </View>
              <View style={styles.inputPersonInfo}>
                <Text style={styles.Text}>Долгота:</Text>
                <TextInput value={lonInput} onChangeText={(text) => {
                  if(Number(text) > 180 || Number(text) < -180) return
                  const filtered = text.replace(/[^0-9.,\-]/g, '');
                  setLonInput(filtered);
                }} maxLength={10} keyboardType="numeric" style={styles.Input}/>
              </View>
            </View>

            <Text style={styles.ModalText}>Выбрать готовую локацию:</Text>
            <Picker
              style={styles.ModalPicker}
              selectedValue={selectedSity}
              dropdownIconColor="white"
              onValueChange={(itemValue, itemIndex) => {
                setSelectedSity(itemValue)
                setModalVisible((visible) => !visible) 
              }}>
              {cities.map((city, index) => {
                return(
                  <Picker.Item label={city.city} value={index} key={index} style={{fontSize: 25}}/>
                )
              })}
            </Picker>

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


        {/*модалка входа */}
        <Modal 
          style={[styles.Modal, {width: "100%", height: "100%"}]}
          animationType="slide"
          visible={modalEnterVisible}
          onRequestClose={() => {
            setModalEnterVisible(!modalEnterVisible);
          }}>
          <View style={[styles.ModalView, {width: "100%", height: "100%"}]}>
            <View style={[styles.inputContainer, {flexDirection: "column", gap: 0, marginTop: "auto", marginBottom: "auto"}]}>
              <View style={styles.inputPersonInfo}>
                <Text style={styles.Text}>логин:</Text>
                <TextInput 
                  value={login} 
                  onChangeText={setLogin} 
                  style={[styles.Input, {width: 300}]}/>
              </View>
              <View style={styles.inputPersonInfo}>
                <Text style={styles.Text}>пароль:</Text>
                <TextInput 
                  value={password} 
                  onChangeText={setPassword} 
                  style={[styles.Input, {width: 300}]}/>
              </View>
            </View>

            <Pressable
              style={[styles.CloseModal, {marginBottom: 100, width: "auto", height: 80}]}
              onPress={() => {
                if(!login || !password) return

                if(!auth){
                  const salt = bcrypt.genSaltSync(10);
                  const hash = bcrypt.hashSync(`${login?.trim()}:${password?.trim()}`, salt);

                  AsyncStorage.setItem('auth', hash)
                    .catch((error) => console.log('Failed to save location:', error.message))
                  setModalEnterVisible(false)
                }

                if(auth){
                  bcrypt.compareSync(`${login?.trim()}:${password?.trim()}`, auth) ? setModalEnterVisible(false) : ""
                }
              }}>
              <Text style={styles.CloseModalText}>{auth ? "войти" : "зарегестрироваться"}</Text>
            </Pressable>
          </View>
        </Modal>

        {Platform.OS === 'web'}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  InfoText: {
    fontSize: 20,
    color: "white",
    alignSelf: "center"
  },
  Info: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  ModalPicker: {
    height: "auto",
    fontSize: 20,
    color: "white"
  },
  ModalText: {
    marginLeft: 5,
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
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    width: "auto",
    fontSize: 25,
    color: "white"
  },
  CloseModal: {
    marginTop: 15,
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
    height: 380,
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
    height: 70,
    width: "100%",
    alignItems: "center",
    paddingBottom: 25,
    marginTop: 55,
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
