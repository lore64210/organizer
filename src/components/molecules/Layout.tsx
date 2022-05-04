import {useEffect, useRef} from 'react';
import {StyleSheet, Animated} from 'react-native';
import Header from './Header';
import { useSelector } from 'react-redux';
import { darkTheme, ligthTheme } from '../../config/theme';

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    }
});

const Layout = ({children, headerProps}) => {

    
    //@ts-ignore
    const {theme, startThemeAnimation, isDarkTheme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    const backgroundColor = useRef(new Animated.Value(1)).current;
    const opacityAnimation = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
        if (startThemeAnimation) {
            Animated.timing(
                backgroundColor, 
                {
                    toValue: isDarkTheme ? 0 : 1, 
                    duration: 1500 , 
                    useNativeDriver: false
                }
            ).start();
            Animated.sequence([
                Animated.timing(
                    opacityAnimation, 
                    {
                        toValue: 0, 
                        duration: 500, 
                        useNativeDriver: false
                    }
                ),
                Animated.timing(
                    opacityAnimation, 
                    {
                        toValue: 0, 
                        duration: 500, 
                        useNativeDriver: false
                    }
                ),
                Animated.timing(
                    opacityAnimation, 
                    {
                        toValue: 1, 
                        duration: 500, 
                        useNativeDriver: false
                    }
                ),
            ]).start();
        }
    }, [startThemeAnimation]);

    return (
        <Animated.View style={{...styles.container, opacity: opacityAnimation, backgroundColor: backgroundColor.interpolate({
                inputRange: [0, 1], 
                outputRange: [ligthTheme.backgroundColor, darkTheme.backgroundColor],
            })
        }}>
            <Header {...headerProps} />
            {children}
        </Animated.View>
    );
}

export default Layout;