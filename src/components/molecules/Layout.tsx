import {useEffect, useRef} from 'react';
import {StyleSheet, Animated} from 'react-native';
import Header from './Header';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    }
});

const Layout = ({children, headerProps}) => {

    const opacityAnimation = useRef(new Animated.Value(1)).current;

    //@ts-ignore
    const {theme, startThemeAnimation} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    useEffect(() => {
        if (startThemeAnimation) {
            Animated.sequence([
                Animated.timing(
                    opacityAnimation, 
                    {
                        toValue: 0, 
                        duration: 200, 
                        useNativeDriver: false
                    }
                ),
                Animated.timing(
                    opacityAnimation, 
                    {
                        toValue: 1, 
                        duration: 200, 
                        useNativeDriver: false
                    }
                ),
            ]).start();
        }
    }, [startThemeAnimation]);

    return (
        <Animated.View style={{...styles.container, opacity: opacityAnimation}}>
            <Header {...headerProps} />
            {children}
        </Animated.View>
    );
}

export default Layout;