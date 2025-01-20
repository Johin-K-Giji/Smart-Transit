import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, Text, Vibration } from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';

const MapScreen = () => {
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [arrivalTime, setArrivalTime] = useState(0);
  const [busMarker, setBusMarker] = useState(null);
  const [path, setPath] = useState([]); // To store the path for the bus
  const averageSpeed = 40; // Average bus speed in km/h

  // Create a reference for the MapView component
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

  // Fetch bus location and update in real-time
  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buses'));
        const busData = querySnapshot.docs[0]?.data();
        if (busData && busData.current_location) {
          const newBusLocation = busData.current_location;
          setBusLocation(newBusLocation);

          // Update the bus marker
          setBusMarker(new AnimatedRegion({
            latitude: newBusLocation.latitude,
            longitude: newBusLocation.longitude,
          }));

          // Calculate distance and arrival time
          if (userLocation) {
            const dist = haversine(userLocation, newBusLocation) / 1000; // Convert meters to km
            setDistance(dist.toFixed(2)); // Round to 2 decimal places
            setArrivalTime((dist / averageSpeed).toFixed(2)); // Time in hours
          }

          // Check if the bus is within 200 meters of the user and trigger vibration alert
          const userDistance = haversine(userLocation, newBusLocation) / 1000; // Convert meters to km
          if (userDistance <= 0.2) { // 200 meters distance
            Vibration.vibrate();
            Alert.alert('Alert', 'The bus is within 200 meters!');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch bus location.');
      }
    };

    const interval = setInterval(fetchBusLocation, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userLocation]);

  // Move the map to the bus location
  useEffect(() => {
    if (busLocation && userLocation) {
      mapView.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  }, [busLocation]);

  // Update the path dynamically with user and bus location
  const pathCoordinates = userLocation && busLocation ? [
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    { latitude: busLocation.latitude, longitude: busLocation.longitude }
  ] : [];

  // Format the distance (in meters if less than 1km)
  const formattedDistance = distance < 1 ? `${(distance * 1000).toFixed(0)} meters` : `${distance} km`;

  // Format the arrival time (in minutes if less than 1 hour)
  const formattedArrivalTime = arrivalTime < 1 ? `${(arrivalTime * 60).toFixed(0)} minutes` : `${arrivalTime} hours`;

  return (
    <View style={styles.container}>
      {userLocation && busLocation ? (
        <>
          <MapView
            style={styles.map}
            ref={mapView} // Set the ref here
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            followsUserLocation
          >
            {/* Bus Marker */}
            <Marker.Animated
              coordinate={busMarker}
              title="Bus Location"
              description="This is the moving bus."
            >
              <View style={styles.busMarker} />
            </Marker.Animated>

            {/* User Marker */}
            <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}>
              <View style={styles.userMarker} />
            </Marker>

            {/* Polyline for path */}
            <Polyline
              coordinates={pathCoordinates}
              strokeColor="red"
              strokeWidth={4}
            />
          </MapView>

          {/* Display distance and arrival time */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Distance: {formattedDistance}</Text>
            <Text style={styles.infoText}>Arrival Time: {formattedArrivalTime}</Text>
          </View>
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
});

export default MapScreen;
