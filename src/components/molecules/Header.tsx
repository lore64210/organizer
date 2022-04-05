import {View, Text, StyleSheet} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        borderBottomColor: theme.secondaryColor,
        borderBottomWidth: 5,
    },
    title: {
        color: theme.textColor,
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 50,
        paddingBottom: 5,
    },
});

export default ({title, onTitlePress = () => {}}) => {
    return (
        <View style={styles.container}>
            <Text onPress={onTitlePress}  style={styles.title}>{title}</Text>
        </View>
    )
}