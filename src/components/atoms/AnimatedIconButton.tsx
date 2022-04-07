import {useRef, useEffect} from 'react';
import {TouchableOpacity, Animated, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.primaryColor,
        borderRadius: theme.borderRadiusButton,
        position: 'absolute',
        right: 20,
        width: theme.buttonSize,
        height: theme.buttonSize,
        bottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.backgroundColor,
    },
    icon: {
        fontSize: 20,
    }
});

export default ({name, color = theme.textColor, size = 30, onPress, style = {}, containerStyle = {}, position = 20, showButton}) => {
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