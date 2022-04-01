import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#04293A',
        alignItems: 'center'
    },
    title: {
        color: '#ECB365',
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    red: {
        color: 'red',
    },
});
  

export default ({title}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}