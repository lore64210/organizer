import {StyleSheet, TouchableHighlight, View} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const createStyles = (theme, isDarkTheme) => StyleSheet.create({
    container: {
        backgroundColor: isDarkTheme ? theme.textColor : theme.primaryColor,
        borderRadius: 5,
        zIndex: -5,
    },
    emptyCheckbox: {
        borderRadius: 5,
        backgroundColor: theme.primaryColor,
        height: 20,
        width: 20,
    }
});

const Checkbox = ({isChecked, onPress, style = {}}) => {
    //@ts-ignore
    const {theme, isDarkTheme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme, isDarkTheme);
    
    return (            
        <TouchableHighlight 
            onPressIn={() => onPress(!isChecked)} 
            style={{...styles.container, ...style}} 
            underlayColor={theme.primaryColor}
        >
            {
                isChecked 
                    ? <FontAwesome name='check' color={isDarkTheme ? theme.primaryColor : theme.textColor} size={20}/>
                    : <View style={styles.emptyCheckbox} />
            }
        </TouchableHighlight>
    );
}

export default Checkbox;