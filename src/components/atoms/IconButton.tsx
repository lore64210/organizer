import {TouchableOpacity, View, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#064663',
        borderRadius: 100,
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 20,
    }
});

export default ({name, color = "#ECB365", size = 30, onPress}) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <FontAwesome style={styles.icon} name={name} color={color} size={size}/>
        </TouchableOpacity>
    )
}