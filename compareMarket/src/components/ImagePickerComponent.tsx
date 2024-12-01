import { Image } from 'native-base';
import useImagePicker from '../hooks/useImagePicker';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { View, Text, Button } from 'react-native';

interface ImageUploadComponentProps {
    onImageSelected: (isImageSelected: boolean, imageData: string) => void;
}    

const ImagePickerComponent: React.FC<ImageUploadComponentProps> = ({onImageSelected}) => {
   const {images, openImagePicker} = useImagePicker();

    useEffect(() => {
        if(images.length>0){
            onImageSelected(true, images[0].uri ?? '');
        } else {
            onImageSelected(false, '');
        }
    }, [images, onImageSelected]);

    return (
        <View>
            {/* <Text>Image Picker Component</Text> */}
            <Button title="Select Image" onPress={ openImagePicker} />
            {images.length>0 && (
                <>
                <Image source={{uri: images[0].uri}} alt="Selected Image" 
                style= {{width: 200, height: 200, alignSelf: "center"}}/>
                </>
            )}
        </View>
    );
};

export default ImagePickerComponent;