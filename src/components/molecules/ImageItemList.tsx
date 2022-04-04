import {View, StyleSheet, Image, ScrollView, useWindowDimensions} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    listContainer: {
        backgroundColor: '#064663',
        width: '95%',
        borderRadius: 10,
        flex: 1,
    },
    item: {
        marginHorizontal: 5,
        borderRadius: 10,
    }
});

const ImagesItemList = ({items, onPress}) => {
    const window = useWindowDimensions();
    return (
        <>
            {
                items.length ? (
                    <View style={{...styles.container, height: (window.height / 3) + 20}}>
                        <ScrollView horizontal style={styles.listContainer} contentContainerStyle={styles.contentContainerStyle}>

                            {
                                items.map(item => (
                                    <TouchableOpacity key={item.id} onPress={() => onPress(item)}>
                                        <Image style={{...styles.item, height: window.height / 3, width: window.width / 3}} source={{uri: item.value}}/>
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