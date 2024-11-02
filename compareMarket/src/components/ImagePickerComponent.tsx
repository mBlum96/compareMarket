import useImagePicker from '../hooks/useImagePicker';
import React from 'react';
import { View, Text, Button } from 'react-native';


const ImagePickerComponent : React.FC = () => {
    const { openImagePicker, images } = useImagePicker();
    return (
        <View>
            <Text>Image Picker Component</Text>
            <Button title="Select Image" onPress={openImagePicker} />
        </View>
    );
};

export default ImagePickerComponent;