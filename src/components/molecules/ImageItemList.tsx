import {useState} from 'react';
import {View, StyleSheet, Image, useWindowDimensions} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { DraxProvider, DraxList } from 'react-native-drax';
import { item } from '../../config/types';
import { AnimatedIconButton, IconButton } from '../atoms';

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
        backgroundColor: theme.deleteButtonColor,
        width: '100%',
        height: '100%',
        borderWidth: 0,
    },
    deleteButtonContainer: {
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: '10%',
    },
});

const ImagesItemList = ({items, onPress, orderImages, onItemDragEnd}) => {
    const window = useWindowDimensions();
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme, window);

    const [showDeleteImageButton, setShowDeleteImageButton] = useState(false);

    const onDragEnd = (e) => {
        onItemDragEnd(e);
        setShowDeleteImageButton(false);
    }
    
    return (
        <>
            {
                items.length ? (
                    <View style={styles.container}>
                        <View style={styles.listContainer}>
                            <DraxProvider>
                                <DraxList
                                    lockItemDragsToMainAxis
                                    keyboardDismissMode='on-drag'
                                    horizontal
                                    onItemDragEnd={onDragEnd}
                                    onItemDragStart={() => setShowDeleteImageButton(true)}
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
                        <View style={styles.deleteButtonContainer}>
                            <AnimatedIconButton 
                                name='trash' 
                                containerStyle={styles.deleteButton} 
                                showButton={showDeleteImageButton}
                                position={window.width - 210}
                                initialPosition={window.width}
                                color={theme.backgroundColor}
                                disableTouchable
                                horizontal
                            />
                        </View>
                    </View>
                ) : <View />
            }
        </>
    );
}

export default ImagesItemList;