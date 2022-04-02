import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#041C32',
        alignItems: 'center',
        borderBottomColor: '#04293A',
        borderBottomWidth: 5,
    },
    title: {
        color: '#ECB365',
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 50,
        paddingBottom: 5,
    },
    separator: {
       
    },
});

export default ({title}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}