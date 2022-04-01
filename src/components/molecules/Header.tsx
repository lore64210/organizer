import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'green',
        alignItems: 'center'
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 30,
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