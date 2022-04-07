import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
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
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    return (
        <TouchableOpacity onPress={onItemPress} style={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    )
}