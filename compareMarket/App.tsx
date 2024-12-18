import React from 'react';
import { useState } from 'react';
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

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [resultText, setResultText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [walmartResult, setWalmartResult] = useState<{name: string; price: string}[]>([]);
  const [targetResult, setTargetResult] = useState<{name: string; price: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handleImageSelected = (isImageSelected: boolean, imageData: string) => {
    console.log('Image Selected:', isImageSelected, imageData);
    setSelectedImage(imageData);
  };

  //send image to the server to be processed by the OCR
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

  //send the text to the server and get the current prices from Walmart
  const handleCheckWalmart = async () => {
    if (resultText) {
      setLoading(true);
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
    setLoading(false);
  }

  //send the text to the server and get the current prices from Target
  const handleCheckTarget = async () => {
    if (resultText) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/checkTarget', {
          method: 'POST',
          body: JSON.stringify({text: resultText}),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        console.log('Target Result:', result);

        setTargetResult(result);
      } catch (error) {
        console.error('Error checking Target:', error);
      }
    }
    setLoading(false);
  }
    
  //calculate the total price of the products
  const calculateTotal = (products: {name: string; price: string}[]) => {
    return products.reduce((total, product) => {
      return total + parseFloat(product.price);
    }, 0);
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
              {walmartResult.length>0 &&(
                <View>
                  {walmartResult.map((product, index) => (
                    <TextInput
                      key={index}
                      style={styles.textInput}
                      value={`Name: ${product.name}\nPrice: $${product.price}`}
                      multiline={true}
                      scrollEnabled={true}
                      textAlignVertical='top'
                      editable={false}
                    />
                  ))}
                  <Text style={{alignSelf: 'center'}}>Total: ${calculateTotal(walmartResult).toFixed(2)}</Text>  
                </View>
              )}
              <Button title="Check Target" onPress={
                handleCheckTarget
                } disabled={!resultText} />
                {!targetResult.length && resultText && (
                loading && <Text style={{alignSelf: 'center'}}>Loading...</Text>
                )}
              {targetResult.length>0 &&(
                <View>
                  {targetResult.map((product, index) => (
                    <TextInput
                      key={index}
                      style={styles.textInput}
                      value={`Name: ${product.name}\nPrice: $${product.price}`}
                      multiline={true}
                      scrollEnabled={true}
                      textAlignVertical='top'
                      editable={false}
                    />
                  ))}
                  <Text style={{alignSelf: 'center'}}>Total: ${calculateTotal(targetResult)}</Text>  
                </View>
              )}
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
