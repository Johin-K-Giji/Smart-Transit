import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../Firebase/firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 

const BusStopsScreen = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState('BusStop');
  const [weather, setWeather] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'busStops'));
        const busStopsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          latitude: parseFloat(doc.data().latitude),  // Convert to number
          longitude: parseFloat(doc.data().longitude), // Convert to number
        }));
        setBusStops(busStopsData);
      } catch (error) {
        console.error('Error fetching bus stops from Firestore:', error);
      }
    };

    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;
        setUserLocation({ latitude, longitude });

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
      } finally {
        setLoading(false);
      }
    };

    fetchBusStops();
    fetchLocationAndWeather();
  }, []);

  // Function to calculate distance using the Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Sort bus stops by distance
  const sortedBusStops = userLocation
    ? [...busStops].map((busStop) => ({
        ...busStop,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, busStop.latitude, busStop.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
    : busStops;

  const openMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const renderBusStopItem = ({ item }) => (
    <View style={[styles.busStopItem, darkMode && styles.darkBusStopItem]}>
      <View style={styles.busStopInfo}>
        <Text style={[styles.busStopName, darkMode && styles.darkText]}>{item.name}</Text>
        <Text style={[styles.busStopLocation, darkMode && styles.darkText]}>Distance: {item.distance.toFixed(2)} km</Text>
      </View>
      <TouchableOpacity 
        style={[styles.busStopAction, darkMode && styles.darkButton]} 
        onPress={() => openMap(item.latitude, item.longitude)}
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
        navigation={navigation}
      />

      <Text style={[styles.busStopsText, darkMode && styles.darkText]}>Nearest Bus Stops</Text>

      {loading ? (
        <ActivityIndicator size="large" color={darkMode ? "#FFDD00" : "#000"} style={styles.loader} />
      ) : (
        <FlatList
          data={sortedBusStops} 
          renderItem={renderBusStopItem}
          keyExtractor={(item) => item.id} 
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
    backgroundColor: 'black',
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
});

export default BusStopsScreen;
