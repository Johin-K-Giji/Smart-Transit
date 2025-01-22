import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, Text, Vibration, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';
import * as Speech from 'expo-speech';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCZNsXmvcKmBuJ9JCqlk2a2hk8jGx_Dv_k'; // Add your Google Maps API key here

const MapScreen = () => {
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [arrivalTime, setArrivalTime] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const averageSpeed = 40; // Average bus speed in km/h
  const mapView = useRef(null);

  // Fetch user's current location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user location.');
      }
    };

    fetchUserLocation();
  }, []);

  // Fetch bus location and calculate distance
  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buses'));
        const busData = querySnapshot.docs[0]?.data();
        if (busData && busData.current_location) {
          setBusLocation(busData.current_location);

          // Calculate distance and estimated time
          if (userLocation) {
            const dist = haversine(userLocation, busData.current_location) / 1000; // Convert to km
            setDistance(dist.toFixed(2)); // Keep 2 decimal places

            const time = dist / averageSpeed; // Time in hours
            setArrivalTime(time < 1 ? (time * 60).toFixed(0) : time.toFixed(2)); // Minutes if <1 hour

            // Trigger alert if within 200 meters
            if (dist <= 0.2 && !showAlert) {
              setShowAlert(true);
              Vibration.vibrate();
              Speech.speak('The bus is within 200 meters of your location!');
            }
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch bus location.');
      }
    };

    const interval = setInterval(fetchBusLocation, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userLocation, showAlert]);

  const acknowledgeAlert = () => {
    setShowAlert(false);
    Speech.stop(); // Stop voice alert
  };

  return (
    <View style={styles.container}>
      {userLocation && busLocation ? (
        <>
          <MapView
            ref={mapView}
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
          >
            {/* User Marker */}
            <Marker coordinate={userLocation}>
              <View style={styles.userMarker} />
            </Marker>

            {/* Bus Marker */}
            <Marker coordinate={busLocation}>
              <View style={styles.busMarker} />
            </Marker>

            {/* Directions */}
            <MapViewDirections
              origin={userLocation}
              destination={busLocation}
              apikey={GOOGLE_MAPS_API_KEY} // Google Maps API key
              strokeWidth={4}
              strokeColor="blue"
              onError={(error) => console.error('Error fetching directions:', error)}
            />
          </MapView>

          {/* Info Container */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Distance: {distance < 1 ? `${(distance * 1000).toFixed(0)} meters` : `${distance} km`}</Text>
            <Text style={styles.infoText}>Arrival Time: {arrivalTime} {arrivalTime < 1 ? 'minutes' : 'hours'}</Text>
          </View>

          {/* Alert Message */}
          {showAlert && (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>The bus is within 200 meters!</Text>
              <Button title="OK" onPress={acknowledgeAlert} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.loader}>
          <Text>Loading map...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 15,
    height: 15,
    backgroundColor: 'blue',
    borderRadius: 7.5,
    borderColor: 'white',
    borderWidth: 2,
  },
  busMarker: {
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 10,
  },
  alertText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MapScreen;
