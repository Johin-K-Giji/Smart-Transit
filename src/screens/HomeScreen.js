import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView, StatusBar, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../Firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import haversine from 'haversine-distance';

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedMode, setSelectedMode] = useState('HomeScreen');

  // Fetch bus data
  const fetchBuses = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'buses'));
      const busesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBuses(busesList);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 60000);
    return () => clearInterval(interval);
  }, [fetchBuses]);

  // Fetch user location and weather
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
          setLocationDetails({
            ...locationResponse[0],
            latitude,
            longitude,
          });
        }

        const weatherResponse = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=YOUR_WEATHER_API_KEY&q=${latitude},${longitude}&aqi=no`
        );
        setWeather(weatherResponse.data);
      } catch (error) {
        console.error('Error fetching weather/location:', error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  // Filter buses based on location and calculate distance
  useEffect(() => {
    if (locationDetails && locationDetails.latitude && locationDetails.longitude) {
      const relevantWords = Object.values(locationDetails)
        .join(' ')
        .toLowerCase()
        .replace(/,/g, '')
        .split(/\s+/);

      // Step 1: Filter buses based on relevant locations
      const filtered = buses.filter((bus) => {
        if (Array.isArray(bus.major_cities)) {
          const citiesArray = bus.major_cities.flatMap(city =>
            city.split(',').map(cityName => cityName.trim().toLowerCase())
          );
          return relevantWords.some(word => citiesArray.includes(word));
        }
        return false;
      });

      // Step 2: Calculate distance for filtered buses
      const userCoords = {
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
      };

      const updatedBuses = filtered
        .map((bus) => {
          if (bus.current_location?.latitude && bus.current_location?.longitude) {
            const busCoords = {
              latitude: bus.current_location.latitude,
              longitude: bus.current_location.longitude,
            };
            const distance = haversine(userCoords, busCoords) / 1000; // Convert meters to KM
            return { ...bus, distance };
          }
          return bus;
        })
        .filter((bus) => bus.distance !== undefined) // Ensure valid distances
        .sort((a, b) => a.distance - b.distance); // Step 3: Sort by nearest distance

      setFilteredBuses(updatedBuses);
    }
  }, [locationDetails, buses]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderBusItem = ({ item }) => (
    <View style={[styles.busItemContainer, getOccupancyStyles(item.occupancy)]}>
      <View style={styles.busItemContent}>
        <TouchableOpacity
          style={styles.busArrow}
          onPress={() => navigation.navigate('MapScreen', { busId: item.id, busName: item.bus_name })}
        >
          <FontAwesome name="map-marker" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.busInfo}>
          <Text style={styles.busName}>{item.bus_name}</Text>
          <Text style={styles.busText}>Bus Number: {item.bus_number}</Text>
          <Text style={styles.busText}>Route: {item.route}</Text>
          <Text style={styles.busText}>
            Distance: {typeof item.distance === 'number' ? item.distance.toFixed(2) + ' km' : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );

  const getOccupancyStyles = (occupancy) => {
    switch (occupancy) {
      case 'Overcrowded':
        return { backgroundColor: 'red' };
      case 'Fully Seated':
        return { backgroundColor: '#42a7eb' };
      case 'Less Busy':
        return { backgroundColor: 'green' };
      default:
        return { backgroundColor: 'gray' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#212121" />
      <Header
        weather={weather}
        locationDetails={locationDetails}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        navigation={navigation}
      />
      <Text style={styles.busStopsText}>Nearby Buses</Text>

      <FlatList
        data={filteredBuses}
        renderItem={renderBusItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.busList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  busStopsText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
    color: '#000',
  },
  busList: {
    padding: 10,
  },
  busItemContainer: {
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
  },
  busItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  busInfo: {
    flex: 1,
  },
  busName: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
  busText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '700',
  },
  busArrow: {
    padding: 10,
    marginRight: 30,
  },
});

export default HomeScreen;
