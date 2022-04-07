import {View, Text, StyleSheet} from 'react-native';
import { IconButton } from '../atoms';
import {useSelector, useDispatch} from 'react-redux';
import {CHANGE_THEME, START_THEME_ANIMATION} from '../../config/redux/actions';

const createStyles = (theme, isDarkTheme) => (StyleSheet.create({
    container: {
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        borderBottomColor: isDarkTheme ? theme.secondaryColor : theme.primaryColor,
        borderBottomWidth: 5,
    },
    title: {
        color: isDarkTheme ? theme.textColor : theme.primaryColor,
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 50,
        paddingBottom: 5,
    },
    themeButton: {
        bottom: 0,
        backgroundColor: theme.backgroundColor,
        width: 40,
        height: 40,
    }
}));

export default ({title, onTitlePress = () => {}}) => {

    const dispatch = useDispatch();

    //@ts-ignore
    const {isDarkTheme, theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });

    const styles = createStyles(theme, isDarkTheme);

    const changeTheme = () => {
        dispatch({type: START_THEME_ANIMATION, payload: true})
        setTimeout(() => {dispatch({type: CHANGE_THEME, payload: !isDarkTheme})}, 225);
    }

    return (
        <View style={styles.container}>
            <Text onPress={onTitlePress} style={styles.title}>{title}</Text>
            <IconButton 
                onPress={changeTheme} 
                name={isDarkTheme ? 'moon-o' : 'sun-o'} 
                containerStyle={styles.themeButton}
                color={isDarkTheme ? theme.textColor : theme.primaryColor}
            />
        </View>
    )
}