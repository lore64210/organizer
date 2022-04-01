import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#064663',
        marginVertical: 15,
        marginHorizontal: 10,
        minHeight: 50,
        borderRadius: 10,
        justifyContent: 'center',
    },
    title: {
        color: '#ECB365',
        paddingHorizontal: 10,
    }
})

export default ({item, onItemPress}) => {
    return (
        <TouchableOpacity onPress={onItemPress} style={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    )
}