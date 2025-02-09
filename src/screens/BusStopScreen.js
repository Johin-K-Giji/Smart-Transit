import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../Firebase/firebase'; // Import Firebase configuration
import { collection, getDocs } from 'firebase/firestore'; // Firestore imports
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5

const BusStopsScreen = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState('BusStop');
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [busStops, setBusStops] = useState([]); // New state for bus stops fetched from Firestore
  const [userDistrict, setUserDistrict] = useState(''); // To store user district for comparison
  const [loading, setLoading] = useState(true); // New loading state
  const [darkMode, setDarkMode] = useState(true); // Dark mode state

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
    // Fetch bus stop data from Firebase Firestore
    const fetchBusStops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'busStops')); // Assuming 'busStops' is your Firestore collection
        const busStopsData = querySnapshot.docs.map((doc) => doc.data()); // Extract the data from the documents
        setBusStops(busStopsData); // Update the state with the fetched bus stops
      } catch (error) {
        console.error('Error fetching bus stops from Firestore:', error);
      }
    };

    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          setLoading(false); // Stop loader if permission is denied
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        const locationResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (locationResponse.length > 0) {
          const userLocationData = locationResponse[0];
          setLocationDetails(userLocationData);

          // Extract district from user location and set it
          const userDistrict = userLocationData.district || ''; // Assuming district info is in `subregion`
          setUserDistrict(userDistrict.toLowerCase()); // Convert to lowercase for comparison
        }

        const weatherResponse = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=f3ff6d04c96747d9b68100825251201&q=${latitude},${longitude}&aqi=no`
        );
        setWeather(weatherResponse.data);
      } catch (error) {
        console.error('Error fetching location or weather:', error);
      } finally {
        setLoading(false); // Stop loader once the data is fetched
      }
    };

    fetchBusStops();
    fetchLocationAndWeather();
  }, []);

  // Filter bus stops based on user location district
  const filteredBusStops = busStops.filter((busStop) => {
    const busStopCity = busStop.city ? busStop.city.toLowerCase() : ''; // Lowercase bus stop city
    console.log("BusStop",busStopCity);
    
    // Ensure locationDetails exists and extract relevantAddress
    if (locationDetails?.formattedAddress) {
      const { formattedAddress } = locationDetails;
  
      // Extract and convert relevant parts of the address to lowercase
      const addressParts = formattedAddress.split(','); // Split by commas
      const relevantAddress = addressParts.slice(0, 7).join(', ').toLowerCase(); // Use parts 2-7 as lowercase string
  
      // Split relevantAddress into individual words
      const relevantWords = relevantAddress.replace(/,/g, '').split(/\s+/); 
      console.log(relevantWords);
      
  
      // Check if any word in relevantAddress matches the busStopCity
      return relevantWords.some((word) => word === busStopCity);
    }
  
    return false; // Return false if locationDetails or formattedAddress is unavailable
  });

  const openMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url); // Opens the Google Maps URL
  };

  const renderBusStopItem = ({ item }) => (
    <View style={[styles.busStopItem, darkMode && styles.darkBusStopItem]}>
      <View style={styles.busStopInfo}>
        <Text style={[styles.busStopName, darkMode && styles.darkText]}>{item.name}</Text>
        <Text style={[styles.busStopLocation, darkMode && styles.darkText]}>{item.location}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.busStopAction, darkMode && styles.darkButton]} 
        onPress={() => openMap(item.latitude, item.longitude)} // Open the map when tapped
      >
        <Text style={styles.busStopActionText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );

  

  return (
    <View style={[styles.container, darkMode && styles.darkMode]}>
      <Header
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        navigation={navigation}
      />

  

      {/* Heading */}
      <Text style={[styles.busStopsText, darkMode && styles.darkText]}>Bus Stops</Text>

      {/* Show loader if data is loading */}
      {loading ? (
        <ActivityIndicator size="large" color={darkMode ? "#FFDD00" : "#000"} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBusStops} // Use filtered bus stops here
          renderItem={renderBusStopItem}
          keyExtractor={(item, index) => index.toString()} // Use index as key if no unique id is available
          contentContainerStyle={styles.busStopsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 40, 
  },
  darkMode: {
    backgroundColor: 'black', // Dark mode background
  },
  busStopsList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  busStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  darkBusStopItem: {
    backgroundColor: '#2C2C2C',
  },
  busStopInfo: {
    flex: 1,
    marginRight: 10,
  },
  busStopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  busStopLocation: {
    fontSize: 14,
    color: '#6F6F6F',
    marginTop: 5,
  },
  busStopAction: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  darkButton: {
    backgroundColor: '#FFDD00',
  },
  busStopActionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  busStopsText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 5,
    marginTop:10
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#31473A',
    padding: 5,
    borderRadius: 50,
  },
});

export default BusStopsScreen;
