import {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Image, useWindowDimensions, Animated} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import { DraxProvider, DraxList } from 'react-native-drax';
import { item } from '../../config/types';
import { AnimatedIconButton } from '../atoms';
import { SET_CURRENT_REMINDER, UPDATE_REMINDER } from '../../config/redux/actions';

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
        bottom: '100%',
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
    const [imageToDelete, setImageToDelete] = useState('');
    const [imagesWidth, setImagesWidth] = useState({});
    const [imagesOpacity, setImagesOpacity] = useState({});

    const onDragEnd = (e) => {
        const {dragAbsolutePosition} = e;
        let {x: itemPositionX} = dragAbsolutePosition;
        if (itemPositionX > window.width - 50) {
            setTimeout(() => onItemDragEnd(e), 800);
            setImageToDelete(e.item.id);
        }
        setShowDeleteImageButton(false);
    }

    useEffect(() => {
        let newImagesWidth = {};
        let newImagesOpacity = {};
        items
            .map((i) => ({
                valueOpacity: new Animated.Value(1),
                valueHeight: new Animated.Value(window.width / 4 + 10), 
                key: i.id
            }))
            .forEach(i => {
                newImagesWidth = {
                    ...newImagesWidth,
                    [i.key]: i.valueHeight
                }
                newImagesOpacity = {
                    ...newImagesOpacity,
                    [i.key]: i.valueOpacity,
                }
            });
        setImagesWidth({...newImagesWidth})                
        setImagesOpacity({...newImagesOpacity})                
    }, [items]);

    useEffect(() => {
        if(imageToDelete && imagesWidth[imageToDelete] && imagesOpacity[imageToDelete]) {
            Animated.timing(imagesWidth[imageToDelete], {
                useNativeDriver: false, 
                toValue: 0, 
                duration: 750
            }).start();
            Animated.timing(imagesOpacity[imageToDelete], {
                useNativeDriver: false, 
                toValue: 0, 
                duration: 750
            }).start();
        }
    }, [imageToDelete]);
    
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
                                        <Animated.View style={{width: imagesWidth[item.id], opacity: imagesOpacity[item.id]}}>
                                            <TouchableOpacity onPress={() => onPress(item)}>
                                                {/*@ts-ignore */}
                                                <Image style={styles.item} source={{uri: item.value}}/>
                                            </TouchableOpacity>
                                        </Animated.View>
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
                                position={window.width/2 - 40}
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