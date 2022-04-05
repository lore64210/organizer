import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import theme from '../../config/theme';

const styles = StyleSheet.create({
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
    return (
        <TouchableOpacity onPress={onItemPress} style={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    )
}