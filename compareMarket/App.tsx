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
  TextInput,
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
  const [walmartResult, setWalmartResult] = useState<{name: string; price: string} | null>(null);

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

  const handleCheckWalmart = async () => {
    if (resultText) {
      try {
        const response = await fetch('http://localhost:8080/api/checkWalmart', {
          method: 'POST',
          body: JSON.stringify({text: resultText}),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        console.log('Walmart Result:', result);
        setWalmartResult(result);
      } catch (error) {
        console.error('Error checking Walmart:', error);
      }
    }
  }

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

              {resultText ? <TextInput
              style={styles.textInput}
              value={resultText}
              onChangeText={setResultText}
              multiline={true}
              scrollEnabled={true}
              textAlignVertical='top'
              /> : null}

              <Button title="Check Walmart" onPress={handleCheckWalmart} disabled={!resultText} />
              {walmartResult ? <TextInput 
              style={styles.textInput}
              value={`Product name: ${walmartResult.name}\n Price: ${walmartResult.price}`}
              multiline={true}
              scrollEnabled={true}
              textAlignVertical='top'
              /> : null}
              <Button title="Check Target" onPress={() => console.log('Check Target')}
              disabled={!resultText} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  textInput: {
    alignSelf: 'center',
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});


export default App;
