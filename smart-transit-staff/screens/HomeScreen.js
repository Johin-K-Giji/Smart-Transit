import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [businessName, setBusinessName] = useState('My Business');
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [staffName, setStaffName] = useState('John Doe');

  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      Alert.alert('Location Accessed', 'Your current location has been fetched.');
    } else {
      Alert.alert('Permission Denied', 'Unable to access location services.');
    }
  };

  const handleShareLocation = async () => {
    if (location) {
      const message = `Business Name: ${businessName}\nPhone: ${phoneNumber}\nStaff: ${staffName}\nLocation: Latitude ${location.coords.latitude}, Longitude ${location.coords.longitude}`;
      if (Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(null, { message });
      } else {
        Alert.alert('Sharing Not Supported', message);
      }
    } else {
      Alert.alert('No Location', 'Please fetch your location first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Staff Name"
        value={staffName}
        onChangeText={setStaffName}
      />
      <Button title="Get Current Location" onPress={handleGetLocation} />
      {location && (
        <Text style={styles.locationText}>
          Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
        </Text>
      )}
      <Button title="Share Location" onPress={handleShareLocation} style={styles.shareButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  locationText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  shareButton: {
    marginTop: 20,
  },
});
