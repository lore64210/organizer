import {useRef, useEffect} from 'react';
import {View, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.primaryColor,
        borderRadius: theme.borderRadiusButton,
        position: 'absolute',
        right: 20,
        width: theme.buttonSize,
        height: theme.buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.backgroundColor,
    },
    icon: {
        fontSize: 20,
    }
});

export default (props) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);

    const {
        name,
        color = theme.textColor,
        size = 30, 
        onPress, style = {}, 
        containerStyle = {}, 
        position = 20,
        initialPosition = 20,
        showButton,
        horizontal = false,
    } = props;
    
    const showButtonsAnimation = useRef(new Animated.Value(initialPosition)).current;

    useEffect(() => {
        Animated
            .timing(
                showButtonsAnimation, 
                {
                    toValue: showButton ? position : initialPosition, 
                    duration: 500, 
                    useNativeDriver: false
                })
            .start();
    }, [showButton]);

    const containerStyleAux = !horizontal 
        ? {...styles.container, ...containerStyle, bottom: showButtonsAnimation}
        : {...styles.container, ...containerStyle, left: showButtonsAnimation}

    return (
        <Animated.View style={containerStyleAux}>
            <TouchableOpacity onPress={onPress}>
                <FontAwesome style={{...styles.icon, ...style}} name={name} color={color} size={size}/>
            </TouchableOpacity>
        </Animated.View>
    )
}