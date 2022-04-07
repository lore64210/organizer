import {StyleSheet, TouchableHighlight, View} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.textColor,
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
    return (
             
        <TouchableHighlight 
            onPressIn={() => onPress(!isChecked)} 
            style={{...styles.container, ...style}} 
            underlayColor={theme.primaryColor}
        >
            {
                isChecked 
                    ? <FontAwesome name='check' color={theme.primaryColor} size={20}/>
                    : <View style={styles.emptyCheckbox} />
            }
        </TouchableHighlight>
    );
}

export default Checkbox;