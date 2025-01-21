import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Header = ({ weather, locationDetails, weatherIconMap, selectedMode, onModeChange, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // To manage menu toggle

  const renderLocation = () => {
    if (!locationDetails) return <Text>Fetching location...</Text>;

    const { formattedAddress } = locationDetails;

    // Extract the part of the address you need
    const addressParts = formattedAddress.split(','); // Split the address by commas
    const relevantAddress = addressParts.slice(2, 7).join(', '); // Join the first 5 parts (as per your requirement)

    return (
      <Text style={styles.locationDetail}>
        {relevantAddress || 'Unknown Location'}
      </Text>
    );
  };

  const transportModes = [
    { id: 'HomeScreen', label: 'Home', icon: 'home' },
    { id: 'BusStop', label: 'Bus Stops', icon: 'bus' },
    { id: 'Complaint', label: 'Complaint', icon: 'alert-circle' },
    { id: 'EmergencyCall', label: 'Emergency Call', icon: 'phone' }, // Emergency Call Icon
  ];

  const handleModeChange = (modeId) => {
    if (modeId === 'EmergencyCall') {
      handleEmergencyCall();
      return;
    }

    onModeChange(modeId);
    navigation.navigate(modeId); // Navigate to the corresponding screen
    setIsMenuOpen(false); // Close menu after selection
  };

  const handleEmergencyCall = () => {
    const phoneNumber = 'tel:1234567890'; // Replace with your emergency number
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Unable to make a call. Please check your device settings.');
    });
  };

  return (
    <View style={styles.subContainer}>
      {/* Hamburger Icon to toggle menu */}
      <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.hamburgerIconWrapper}>
        <MaterialCommunityIcons name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* Weather Info */}
      <View style={styles.weatherContainer}>
        <View style={styles.weatherInfo}>
          {weather ? (
            <>
              <Text style={styles.temperature}>{Math.round(weather.current.temp_c)}°C</Text>
              <MaterialCommunityIcons
                name={weatherIconMap[weather.current.condition.text] || 'weather-cloudy'}
                size={30}
                color="black"
              />
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </View>

      {/* Location Info */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>Your Location:</Text>
        {renderLocation()}
      </View>

      {/* Burger Menu Modal */}
      <Modal visible={isMenuOpen} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Option</Text>

            {transportModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.transportModeWrapper,
                  selectedMode === mode.id && styles.activeMode,
                ]}
                onPress={() => handleModeChange(mode.id)}
              >
                <MaterialCommunityIcons
                  name={mode.icon}
                  size={30}
                  color={selectedMode === mode.id ? '#FFFFFF' : '#000'}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    selectedMode === mode.id && styles.activeModeLabel,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMenuOpen(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 30,
    marginRight: 10,
    color: '#FDD300',
  },
  locationContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 5,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6F6F6F',
    marginBottom: 5,
  },
  locationDetail: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  hamburgerIconWrapper: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  transportModeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  activeMode: {
    backgroundColor: '#31473A',
  },
  modeLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
  },
  activeModeLabel: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Header;
