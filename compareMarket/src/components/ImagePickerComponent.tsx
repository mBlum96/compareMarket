import { Image } from 'native-base';
import useImagePicker from '../hooks/useImagePicker';
import React from 'react';
import { View, Text, Button } from 'react-native';


const ImagePickerComponent : React.FC = () => {
    const { openImagePicker, images } = useImagePicker();
    return (
        <View>
            <Text>Image Picker Component</Text>
            <Button title="Select Image" onPress={ openImagePicker} />
            {images.length>0 && (
                <>
                {console.log("images exist", images)}
                <Image source={{uri: images[0].uri}} alt="Selected Image" 
                style= {{width: 200, height: 200}}/>
                </>
            )}
        </View>
    );
};

export default ImagePickerComponent;