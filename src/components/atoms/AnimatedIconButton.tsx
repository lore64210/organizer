import {useRef, useEffect} from 'react';
import {TouchableOpacity, Animated, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#064663',
        borderRadius: 100,
        position: 'absolute',
        right: 20,
        width: 50,
        height: 50,
        bottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 20,
    }
});

export default ({name, color = "#ECB365", size = 30, onPress, style = {}, containerStyle = {}, position = 20, showButton}) => {
    const showButtonsAnimation = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated
            .timing(
                showButtonsAnimation, 
                {
                    toValue: showButton ? position : 20, 
                    duration: 500, 
                    useNativeDriver: false
                })
            .start();
    }, [showButton]);

    return (
        <Animated.View style={{...styles.container, ...containerStyle, bottom: showButtonsAnimation}}>
            <TouchableOpacity onPress={onPress}>
                <FontAwesome style={{...styles.icon, ...style}} name={name} color={color} size={size}/>
            </TouchableOpacity>
        </Animated.View>
    )
}