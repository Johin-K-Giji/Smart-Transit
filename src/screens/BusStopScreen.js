import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import * as Location from 'expo-location';
import axios from 'axios';

const BusStopsScreen = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState('BusStop');
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);

  // Example bus stops data
  const busStops = [
    { id: '1', name: 'Main Square', location: 'City Center' },
    { id: '2', name: 'North Terminal', location: 'North District' },
    { id: '3', name: 'South Park', location: 'South Area' },
    { id: '4', name: 'East Side', location: 'East Suburbs' },
    { id: '5', name: 'West Avenue', location: 'West District' },
  ];

  const weatherIconMap = {
    Sunny: 'weather-sunny',
    'Partly cloudy': 'weather-partly-cloudy',
    Cloudy: 'weather-cloudy',
    Rain: 'weather-rainy',
    Thunderstorm: 'weather-lightning',
    Snow: 'weather-snowy',
    Fog: 'weather-fog',
  };

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        const locationResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (locationResponse.length > 0) {
          setLocationDetails(locationResponse[0]);
        }

        const weatherResponse = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=f3ff6d04c96747d9b68100825251201&q=${latitude},${longitude}&aqi=no`
        );
        setWeather(weatherResponse.data);
      } catch (error) {
        console.error('Error fetching location or weather:', error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  const renderBusStopItem = ({ item }) => (
    <View style={styles.busStopItem}>
      <View style={styles.busStopInfo}>
        <Text style={styles.busStopName}>{item.name}</Text>
        <Text style={styles.busStopLocation}>{item.location}</Text>
      </View>
      <TouchableOpacity style={styles.busStopAction}>
        <Text style={styles.busStopActionText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        navigation={navigation}
      />

      {/* Heading */}
      <Text style={styles.busStopsText}>Bus Stops</Text>

      {/* Bus Stops List */}
      <FlatList
        data={busStops}
        renderItem={renderBusStopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busStopsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#31473A', // Dark green background for the screen
  },
  busStopsList: {
    paddingHorizontal: 10,
    paddingBottom: 20, // Added padding at the bottom for better spacing
  },
  busStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', // White background for bus stop items
    borderRadius: 10, // Increased border radius for smoother corners
    marginVertical: 8, // Space between list items
    padding: 15, // Internal padding for each item
    shadowColor: '#000', // Shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android
  },
  busStopInfo: {
    flex: 1,
    marginRight: 10, // Space between text and action button
  },
  busStopName: {
    fontSize: 18, // Slightly larger font for bus stop name
    fontWeight: 'bold',
    color: '#000', // Black text for name
  },
  busStopLocation: {
    fontSize: 14,
    color: '#6F6F6F', // Grey text for location
    marginTop: 5, // Space between name and location
  },
  busStopAction: {
    paddingVertical: 8,
    paddingHorizontal: 15, // Adjusted padding for the button
    backgroundColor: '#4CAF50', // Bright green button color
    borderRadius: 8, // Rounded corners for the button
  },
  busStopActionText: {
    color: '#FFFFFF', // White text on the button
    fontWeight: 'bold',
    fontSize: 14,
  },
  busStopsText: {
    fontSize: 26, // Larger and bold heading
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for heading
    textAlign: 'center',
    marginTop: 200, // Space above the heading
    marginBottom: 10, // Space below the heading
    zIndex: 1, // Ensure the heading stays above other elements
  },
});

export default BusStopsScreen;
