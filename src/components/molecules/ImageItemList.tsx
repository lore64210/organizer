import {View, StyleSheet, Image, useWindowDimensions} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { DraxProvider, DraxList, DraxView } from 'react-native-drax';
import { item } from '../../config/types';
import { IconButton } from '../atoms';

const createStyles = (theme, window) => StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
        height: (window.height / 4) + 20,
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.primaryColor,
        width: '95%',
        borderRadius: theme.borderRadius,
        flex: 1,
    },
    item: {
        marginHorizontal: 5,
        borderRadius: theme.borderRadius,
        height: window.height / 4,
        width: window.width / 4,
    },
    deleteButton: {
        backgroundColor: 'red'
    }
});

const ImagesItemList = ({items, onPress, orderImages, onItemDragEnd, onItemDragStart}) => {
    const window = useWindowDimensions();
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme, window);
    
    return (
        <>
            {
                items.length ? (
                    <View style={styles.container}>
                        <View style={styles.listContainer}>
                            <DraxProvider>
                                <DraxList
                                    keyboardDismissMode='on-drag'
                                    horizontal
                                    onItemDragEnd={onItemDragEnd}
                                    onItemDragStart={onItemDragStart}
                                    data={items}
                                    renderItemContent={({item}) => (
                                        <TouchableOpacity onPress={() => onPress(item)}>
                                            <Image style={styles.item} source={{uri: item.value}}/>
                                        </TouchableOpacity>
                                    )}
                                    onItemReorder={({ fromIndex, toIndex }) => {
                                        const newData = [...items];
                                        newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
                                        orderImages(newData);
                                    }}
                                    keyExtractor={(item : item) => item.id}
                                />
                            </DraxProvider>
                        </View>
                    </View>
                ) : <View />
            }
        </>
    );
}

export default ImagesItemList;