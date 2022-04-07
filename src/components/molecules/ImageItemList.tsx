import {View, StyleSheet, Image, ScrollView, useWindowDimensions} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    listContainer: {
        backgroundColor: theme.primaryColor,
        width: '95%',
        borderRadius: theme.borderRadius,
        flex: 1,
    },
    item: {
        marginHorizontal: 5,
        borderRadius: theme.borderRadius,
    }
});

const ImagesItemList = ({items, onPress}) => {
    const window = useWindowDimensions();
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    return (
        <>
            {
                items.length ? (
                    <View style={{...styles.container, height: (window.height / 4) + 20}}>
                        <ScrollView horizontal style={styles.listContainer} contentContainerStyle={styles.contentContainerStyle}>

                            {
                                items.map(item => (
                                    <TouchableOpacity key={item.id} onPress={() => onPress(item)}>
                                        <Image style={{...styles.item, height: window.height / 4, width: window.width / 4}} source={{uri: item.value}}/>
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    </View>
                ) : <View />
            }
        </>
    );
}

export default ImagesItemList;