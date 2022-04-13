import {useRef, useEffect} from 'react';
import {StyleSheet, Text, Animated} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.primaryColor,
        marginVertical: 15,
        marginHorizontal: 10,
        minHeight: 50,
        borderRadius: theme.borderRadius,
        justifyContent: 'center',
    },
    title: {
        color: theme.textColor,
        paddingHorizontal: 10,
    }
})

export default ({item, onItemPress}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);

    const heightAnimationRef = useRef(new Animated.Value(100)).current;
    const opacityAnimationRef = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (item.hide) {
            Animated.timing(heightAnimationRef, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false,
            }).start();
            Animated.timing(opacityAnimationRef, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [item]);

    return (
        <Animated.View style={{minHeight: 50, height: heightAnimationRef, opacity: opacityAnimationRef}}>
            <TouchableOpacity onPress={onItemPress} style={styles.container}>
                <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}