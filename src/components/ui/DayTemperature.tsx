import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import sun from "../../../assets/images/sun.png";
import cloudy from "../../../assets/images/cloudy.png";
import rainy from "../../../assets/images/rainy.png";
import { weather } from '@/types';
import { useEffect } from 'react';


const weatherIcons: Record<weather, any> = {
    солнечно: sun,
    облачно: cloudy,
    дождь: rainy
}

function getWeekDay(dateApi: string){
    const [year, month, day] = dateApi.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date()

    if (date.toDateString() === today.toDateString()) return "Сегодня"
    return date.toLocaleDateString("ru-Ru", {weekday: "short"})
}

export default function DayTemperature(prop: {
        date: string, 
        wet: number, 
        iconDay: weather, 
        iconNight: weather,
        dayTemperature: number,
        nighTemperature: number
    }){

    return(
        <View style={styles.HourInfo}>
            <Text style={styles.Text}>{getWeekDay(prop.date)}</Text>
            <Text style={styles.TextWet}>{prop.wet}%</Text>
            <Image source={weatherIcons[prop.iconDay]} style={styles.Image}/>
            <Image source={weatherIcons[prop.iconNight]} style={styles.Image}/>
            <Text style={styles.TextTemperature}>{prop.dayTemperature}°</Text>
            <Text style={styles.TextTemperature}>{prop.nighTemperature}°</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    Image: {
        alignSelf: "center",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 10,
        width: 25,
        height: 25
    },
    HourInfo: {
        marginTop: 10,
        display: "flex",
        flexDirection: "row",
    },
    TextWet: {
        alignSelf: "center",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        color: "rgb(207, 207, 207)",
        width: 30,
        fontSize: 15  
    },
    TextTemperature: {
        alignSelf: "center",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        color: "white",
        fontSize: 20,
        width: 50,
    },
    Text: {
        alignSelf: "center",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 15,
        textAlign: "center",
        color: "white",
        fontSize: 20,
        width: 80,
    }
})