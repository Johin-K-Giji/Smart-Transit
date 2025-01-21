import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import Header from '../components/Header';
import { db } from '../Firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [selectedMode, setSelectedMode] = useState('HomeScreen'); // Default mode is 'home'
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  
  const weatherIconMap = {
    Sunny: 'weather-sunny',
    'Partly cloudy': 'weather-partly-cloudy',
    Cloudy: 'weather-cloudy',
    Rain: 'weather-rainy',
    Thunderstorm: 'weather-lightning',
    Snow: 'weather-snowy',
    Fog: 'weather-fog',
  };

  // Fetch buses every minute
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buses'));
        const busesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBuses(busesList);
      } catch (error) {
        console.error('Error fetching buses:', error);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 60000); // Re-fetch buses every 1 minute
    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  // Fetch location and weather data

  console.log(locationDetails);
  
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
        console.error(error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  // Filter buses based on the user's location
  useEffect(() => {
    if (locationDetails) {
      const { formattedAddress } = locationDetails;
  
      // Extract and convert the relevant part of the address to lowercase
      const addressParts = formattedAddress.split(','); // Split the address by commas
      const relevantAddress = addressParts.slice(2, 7).join(', ').toLowerCase(); // Join parts 2 to 7 and convert to lowercase
  
      // Log relevant address for debugging
      console.log('Relevant Address (lowercase):', relevantAddress);
  
      const filtered = buses.filter((bus) => {
        if (Array.isArray(bus.major_cities)) {
          // Flatten the cities array and trim whitespace
          const citiesArray = bus.major_cities.flatMap(city =>
            city.split(',').map(cityName => cityName.trim().toLowerCase())
          );
  
          // Check if any word in the relevant address matches a city
          const relevantWords = relevantAddress.split(/\s+/); // Split address into words
          const matches = relevantWords.some(word => citiesArray.includes(word));
  
          // Log matching result
          console.log(`Bus major cities: ${citiesArray}`);
          console.log(`Relevant words: ${relevantWords}`);
          console.log(`Matches found: ${matches}`);
  
          return matches; // Include bus if there's a match
        }
        return false;
      });
  
      // Log filtered buses
      console.log('Filtered Buses:', filtered);
      setFilteredBuses(filtered);
    }
  }, [locationDetails, buses]);
  
  
  

  

  const renderBusItem = ({ item }) => {
    const occupancyStyles = getOccupancyStyle(item.occupancy);
    const statusStyles = getBusStatusStyle(item.bus_status);
  
    return (
      <View style={[styles.busItem, occupancyStyles.background]}>
        <View style={styles.busIconContainer}>
          <Image source={require('../../assets/images/Main-logo.png')} style={styles.busIcon} />
        </View>
        <View style={styles.busInfo}>
          <Text style={[styles.busName, occupancyStyles.text]}>{item.bus_name}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Bus Number: {item.bus_number}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Route: {item.route}</Text>
          <Text style={[styles.busText, occupancyStyles.text]}>Status: <Text style={statusStyles.statusText}>{item.bus_status}</Text></Text>
          <Text style={[styles.seatStatus, occupancyStyles.text]}>
            {item.occupancy}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.busArrow}
          onPress={() => navigation.navigate('MapScreen', { bus: item })}
        >
          <FontAwesome name="map-marker" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const getOccupancyStyle = (occupancy) => {
    switch (occupancy) {
      case 'Overcrowded':
        return {
          background: { backgroundColor: '#D32F2F' }, // Red background
          text: { color: '#FFFFFF' } // White text
        };
      case 'Fully Seated':
        return {
          background: { backgroundColor: '#4CAF50' }, // Green background
          text: { color: '#FFFFFF' } // White text
        };
      case 'Less Busy':
        return {
          background: { backgroundColor: '#2196F3' }, // Blue background
          text: { color: '#FFFFFF' } // White text
        };
      default:
        return {
          background: { backgroundColor: '#FFFFFF' }, // Default white background
          text: { color: '#000' } // Default black text
        };
    }
  };

  const getBusStatusStyle = (status) => {
    switch (status) {
      case 'Running':
        return {
          statusText: { color: '#388E3C' } // Dark green text
        };
      case 'Breakdown':
        return {
          statusText: { color: '#B71C1C' } // Dark red text
        };
      case 'Delayed':
        return {
          statusText: { color: '#D84315' } // Dark orange text
        };
      default:
        return {
          statusText: { color: '#FF6F00' } // Dark yellow text
        };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        weather={weather}
        locationDetails={locationDetails}
        weatherIconMap={weatherIconMap}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        navigation={navigation} // Pass navigation prop to Header
      />

      <Text style={styles.busStopsText}>Buses</Text>

      <FlatList
        data={filteredBuses}
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
    paddingTop: 190, // Space for header
  },
  busStopsText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  busList: {
    backgroundColor: '#31473A',
    padding: 10,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8, // Reduced size for a cuter look
    marginVertical: 8, // Reduced margin for a more compact view
    padding: 12, // Reduced padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  busIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C1C1C1',
    borderRadius: 8, // Rounded for cuteness
    marginRight: 12,
  },
  busIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  busInfo: {
    flex: 1,
    marginRight: 12,
  },
  busName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  busText: {
    fontSize: 14,
    marginVertical: 4,
  },
  seatStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  busArrow: {
    backgroundColor: '#31473A',
    padding: 8,
    borderRadius: 50,
  },
});

export default HomeScreen;
