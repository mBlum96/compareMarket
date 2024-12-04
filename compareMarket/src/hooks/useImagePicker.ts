import { Alert } from 'react-native';
import {Asset, ImagePickerResponse, launchImageLibrary} from 'react-native-image-picker';
import {useState} from 'react';

const useImagePicker = () => {

    const options = {
        mediaType: 'photo' as const,
        selectionLimit: 1,
    };

    const [images, setImages] = useState<Asset[]>([]);
    const [error, setError] = useState<string | null>(null);

    const openImagePicker = () => {
        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if(response.didCancel){
                console.log('User cancelled image picker');
            } else if(response.errorCode){
                console.error(response.errorMessage);
                setError(response.errorMessage || 'An error occurred');
                Alert.alert('Error', response.errorMessage);
            }
            else if(response.assets && response.assets.length>0){
                const selectedImage = response.assets[0];
                setImages([selectedImage]);
            }
        });
    };

    return {images,error, openImagePicker};
};


export default useImagePicker;