import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';

const HomeScreen = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(null);

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        // Get current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        // Fetch city name using reverse geocoding
        const locationResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (locationResponse.length > 0) {
          const { city: currentCity } = locationResponse[0];
          setCity(currentCity || 'Unknown Location');
        }

        // Fetch weather data
        const weatherResponse = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=f3ff6d04c96747d9b68100825251201&q=${latitude},${longitude}&aqi=no`
        );
        setWeather(weatherResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  const buses = [
    { id: '1', name: 'Matha Super', route: 'ANG - EKM', time: 'Arrive in 5 Minutes' },
    { id: '2', name: 'Matha Super', route: 'ANG - EKM', time: 'Arrive in 5 Minutes' },
    { id: '3', name: 'Matha Super', route: 'ANG - EKM', time: 'Arrive in 5 Minutes' },
    { id: '4', name: 'Matha Super', route: 'ANG - EKM', time: 'Arrive in 5 Minutes' },
  ];

  const renderBusItem = ({ item }) => (
    <View style={styles.busItem}>
      <View style={styles.busIconContainer}>
        <Image
          source={require('../../assets/images/Main-logo.png')} // Replace with your bus icon
          style={styles.busIcon}
        />
      </View>
      <View style={styles.busInfo}>
        <Text style={styles.busName}>{item.name}</Text>
        <Text style={styles.busRoute}>{item.route}</Text>
        <Text style={styles.busTime}>{item.time}</Text>
      </View>
      <TouchableOpacity style={styles.busArrow}>
        <FontAwesome name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Weather and Location Section */}

      {/* SubContainer */}
      <View style={styles.subContainer}>
        <View style={styles.weatherContainer}>
          <View style={styles.weatherInfo}>
            {weather ? (
              <>
                <Text style={styles.temperature}>{Math.round(weather.current.temp_c)}</Text>
                <MaterialCommunityIcons
                  name="weather-sunny"
                  size={30}
                  color="black"
                />
              </>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
          <Image source={require('../../assets/images/Main-logo.png')} style={styles.logo} />
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Your Location is:</Text>
          {city ? (
            <Text style={styles.location}>{city}</Text>
          ) : (
            <Text>Fetching location...</Text>
          )}
        </View>

        {/* Transport Modes */}
        <View style={styles.transportModesContainer}>
          <View style={styles.transportModeWrapper}>
            <MaterialCommunityIcons name="train" size={30} color="black" />
          </View>
          <View style={styles.transportModeWrapper}>
            <MaterialCommunityIcons name="bus" size={30} color="black" />
          </View>
          <View style={styles.transportModeWrapper}>
            <MaterialCommunityIcons name="subway" size={30} color="black" />
          </View>
          <View style={styles.transportModeWrapper}>
            <MaterialCommunityIcons name="seat-recline-normal" size={30} color="black" />
          </View>
        </View>
      </View>

      {/* Bus List */}
      <FlatList
        data={buses}
        renderItem={renderBusItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#31473A',
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 30,
    marginRight: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  subContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '90%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 60,
  },
  locationContainer: {
    alignItems: 'center',
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  locationLabel: {
    fontSize: 14,
    color: '#6F6F6F',
  },
  location: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transportModesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  transportModeWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
  },
  busList: {
    backgroundColor: '#31473A',
    padding: 10,
    marginTop: 300, // Adjust the list's position to accommodate the subContainer
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    padding: 10,
  },
  busIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C1C1C1',
    borderRadius: 8,
  },
  busIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  busInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  busName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  busRoute: {
    fontSize: 14,
    color: '#6F6F6F',
  },
  busTime: {
    fontSize: 14,
    color: '#34A853', // Green for arrival time
  },
  busArrow: {
    backgroundColor: '#31473A',
    padding: 8,
    borderRadius: 8,
  },
});

export default HomeScreen;
