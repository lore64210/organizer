import {useRef, useEffect} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import theme from '../../config/theme';
import { IconButton } from '../atoms';
import Slider from '@react-native-community/slider';

const styles = StyleSheet.create({
    itemListContainer: {
        alignItems: 'center',
    },
    itemContainer: {
        backgroundColor: theme.primaryColor,
        width: '95%',
        marginVertical: 20,
        borderRadius: theme.borderRadius,
    },
    textItem: {
        padding: 10,
        color: theme.textColor,
    },
    audioItem: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    audioButton: {
        position: 'relative',
        left: 0,
        bottom: 0,
    },
    audioSlider: {
        height: 10,
        width: '80%'
    },
});

const ItemList = ({items, actualItemTextId, changeItemText}) => {

    const textItemsRef = useRef({});

    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    return (
        <View style={styles.itemListContainer}>
            {
                items.map((item) => (
                    <View key={item.id} style={styles.itemContainer}>
                        {
                            {
                                text: (
                                    <TextInput 
                                        ref={input => textItemsRef.current[item.id] = input}
                                        multiline
                                        style={styles.textItem} 
                                        onChangeText={newText => changeItemText(newText, item.id)} 
                                        placeholderTextColor={theme.placeholderTextColor}
                                        placeholder='Nuevo reminder...'
                                    />
                                ),
                                audio: (
                                    <View style={styles.audioItem}>
                                        <IconButton name='play' containerStyle={styles.audioButton} />
                                        <View style={styles.audioSlider}>
                                            <Slider
                                                style={{width: '100%', height: '100%'}}
                                                minimumValue={0}
                                                maximumValue={1}
                                                minimumTrackTintColor={theme.primaryColor}
                                                maximumTrackTintColor={theme.backgroundColor}
                                                thumbTintColor={theme.textColor}
                                                //onValueChange={setZoom}
                                                //value={zoom}
                                            />
                                        </View>
                                    </View>
                                )
                            }[item.type]
                        }
                    </View>
                ))
            }
        </View>
    );
}

export default ItemList;