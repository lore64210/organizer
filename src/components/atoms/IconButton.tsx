import {TouchableHighlight, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.primaryColor,
        borderRadius: theme.borderRadiusButton,
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: theme.buttonSize,
        height: theme.buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const IconButton : React.FC<{name: any, color?: string, size?: number, onPress: () => void, style?: any, containerStyle?: any}> = (props) => {
    
    const {name, color = "#ECB365", size = 20, onPress, style = {}, containerStyle = {}} = props;

    return (
        <TouchableHighlight underlayColor="#041C32" onPress={onPress} style={{...styles.container, ...containerStyle}}>
            <FontAwesome style={style} name={name} color={color} size={size}/>
        </TouchableHighlight>
    )
}

export default IconButton;