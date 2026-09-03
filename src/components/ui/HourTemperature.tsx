import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import sun from "../../../assets/images/sun.png";
import cloudy from "../../../assets/images/cloudy.png";
import rainy from "../../../assets/images/rainy.png";
import { weather } from '@/types';


const weatherIcons: Record<weather, any> = {
    солнечно: sun,
    облачно: cloudy,
    дождь: rainy
}


export default function HourTemperature(HourWeather: {
        time: string, 
        temperature: number, 
        wet: number,
        icon: "солнечно" | "облачно" | "дождь"
    }){
    return(
        <View style={styles.HourInfo}>
            <Text style={styles.Text}>{HourWeather.time}</Text>
            <Image source={weatherIcons[HourWeather.icon]} style={styles.Image}/>
            <Text style={styles.TextTemperature}>{HourWeather.temperature}°</Text>
            <Text style={styles.TextWet}>{HourWeather.wet}%</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    Image: {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 10,
        width: 35,
        height: 35
    },
    HourInfo: {
        marginTop: 0,
    },
    TextWet: {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        color: "rgb(207, 207, 207)",
        fontSize: 20  
    },
    TextTemperature: {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        color: "white",
        fontSize: 25
    },
    Text: {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        color: "white",
        fontSize: 20
    }
})