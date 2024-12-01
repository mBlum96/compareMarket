/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Button,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import ImagePickerComponent from './src/components/ImagePickerComponent';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type SectionProps = PropsWithChildren<{
  title: string;
}>;


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [imagesUploaded, setImagesUploaded] = useState(false);
  const [resultText, setResultText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handleImageSelected = (isImageSelected: boolean, imageData: string) => {
    console.log('Image Selected:', isImageSelected, imageData);
    setImagesUploaded(isImageSelected);
    setSelectedImage(imageData);
  };

  const handleUpload = async () => {
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: selectedImage,
          name: 'photo.jpg',
          type: 'image/jpeg',
        });

        const response = await fetch('http://localhost:8080/api/sendImageToProcess', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = await response.json();
        setResultText(result.text);
      } catch (error) {
        console.error('Error sending image:', error);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <NativeBaseProvider>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
            <View
              style={{
                backgroundColor: isDarkMode ? Colors.black : Colors.white,
              }}>
              <ImagePickerComponent
                onImageSelected={handleImageSelected}
              />
              <Button title="Upload Image" onPress={handleUpload} disabled={!selectedImage} />

              {resultText ? <Text>{resultText}</Text> : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}


export default App;
