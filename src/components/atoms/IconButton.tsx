import {TouchableHighlight, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#064663',
        borderRadius: 100,
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 20,
    }
});

const IconButton : React.FC<{name: any, color?: string, size?: number, onPress: () => void, style?: any, containerStyle?: any}> = (props) => {
    
    const {name, color = "#ECB365", size = 30, onPress, style = {}, containerStyle = styles.container} = props;

    return (
        <TouchableHighlight underlayColor="#041C32" onPress={onPress} style={containerStyle}>
            <FontAwesome style={{...styles.icon, ...style}} name={name} color={color} size={size}/>
        </TouchableHighlight>
    )
}

export default IconButton;