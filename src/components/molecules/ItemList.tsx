import {useRef, useEffect, useState} from 'react';
import {View, StyleSheet, TextInput, Animated, useWindowDimensions} from 'react-native';
import { IconButton, Checkbox } from '../atoms';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { useSelector } from 'react-redux';
import { DraxProvider, DraxList } from 'react-native-drax';
import { item } from '../../config/types';

const createStyles = (theme) => StyleSheet.create({
    itemListContainer: {
        alignItems: 'flex-end',
        marginRight: '2.5%',
    },
    checkbox: {
        position: 'absolute',
        left: '2.5%',
        top: 35,
    },
    itemContainer: {
        backgroundColor: theme.primaryColor,
        marginVertical: 20,
        borderRadius: theme.borderRadius,
        flexDirection: 'row',
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
    reorderIcon: {
        position: 'relative',
        top: 0,
        left: 0,
        width: 30,
    },
});

const ItemList = ({
    items, 
    actualItemTextId, 
    changeItemText, 
    checksEnabled, 
    changeItemCheck, 
    orderItemList, 
    onItemDragEnd, 
    onItemDragStart,
    reminderHasImages,
}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    const [currentAudioPlaying, setcurrentAudioPlaying] = useState(null);
    const [sounds, setSounds] = useState<{id: string, sound: Sound, positionMillis: any, durationMillis: any}[]>([]);
    const [itemsHeight, setItemsHeight] = useState({});
    const [itemsOpacity, setItemsOpacity] = useState({});
    const [itemToDelete, setItemToDelete] = useState('');

    const window = useWindowDimensions();

    const textItemsRef = useRef({});
    
    const showChecksAnimation = useRef(new Animated.Value(window.width * 0.95)).current;

    useEffect(() => {
        Animated
            .timing(
                showChecksAnimation, 
                {
                    toValue: checksEnabled ?  window.width * 0.86 : window.width * 0.95, 
                    duration: 250, 
                    useNativeDriver: false,
                })
            .start();
    }, [checksEnabled]);

    useEffect(() => {
        let newItemsHeight = {};
        let newItemsOpacity = {};
        items
            .map(i => ({key: [i.id], valueHeight: new Animated.Value(100), valueOpacity: new Animated.Value(1)}))
            .forEach(i => {
                newItemsHeight = {...newItemsHeight, [i.key]: i.valueHeight};
                newItemsOpacity = {...newItemsOpacity, [i.key]: i.valueOpacity};
            });
        setItemsHeight(newItemsHeight);
        setItemsOpacity(newItemsOpacity);
    }, [items.length]);

    useEffect(() => {
        if (itemToDelete && itemsHeight[itemToDelete] && itemsOpacity[itemToDelete]) {
            Animated.timing(itemsHeight[itemToDelete], {
                toValue: 0,
                useNativeDriver: false,
                duration: 750,
            }).start();
            Animated.timing(itemsOpacity[itemToDelete], {
                toValue: 0,
                useNativeDriver: false,
                duration: 750,
            }).start();
        }
    }, [itemToDelete]);

    const handleOnItemDragEnd = (e) => {
        const {dragAbsolutePosition} = e;
        let {x: itemPositionX, y: itemPositionY} = dragAbsolutePosition;
        itemPositionY = reminderHasImages ? itemPositionY + window.height / 4 + 20 : itemPositionY;
        if (itemPositionY < window.height - 75 
            && itemPositionY > window.height - 175
            && itemPositionX < window.width / 2 + 75
            && itemPositionX > window.width / 2 - 25) {
                setTimeout(() => onItemDragEnd(e), 800);
                setItemToDelete(e.item.id);
            }
    }

    // ------------- LOGICA PARA AUDIOS ----------------------------------------------------------------------
    
    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    useEffect(() => {
        const newSounds = items
            .filter(i => i.type === 'audio')
            .map(async i => {
                const getSound = async () => {
                    const {sound} = await Audio.Sound.createAsync({uri: i.value}, {}, (status) => onPlaybackStatusUpdate(status, i.id));
                    return sound;
                };
                const newSound = await getSound();
                return {sound: newSound, id: i.id, positionMillis: 0, durationMillis: 1}
            });
        Promise.all(newSounds).then(setSounds);
    }, [items.length]);

    const onAudioButtonPress = (audioId) => {
        if (!currentAudioPlaying) {
            playAudio(audioId);
        } else if (currentAudioPlaying === audioId) {
            pauseAudio(audioId);
        }
    }

    const playAudio = async (audioId) => {
        if (sounds?.length) {
            setcurrentAudioPlaying(audioId);
            const [{sound, positionMillis}] = sounds.filter(sound => sound.id === audioId);
            await sound.playFromPositionAsync(positionMillis);
        }
    }

    const pauseAudio = async (audioId) => {
        setcurrentAudioPlaying(null);
        const [{sound}] = sounds?.filter(sound => sound.id === audioId);
        await sound.pauseAsync();
    }

    const onPlaybackStatusUpdate = async (playbackStatus, id) => {
        setSounds((prevSounds) => prevSounds.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    positionMillis: playbackStatus.positionMillis,
                    durationMillis: playbackStatus.durationMillis,
                }
            }
            return s;
        }));
        if (playbackStatus.didJustFinish) {
            setSounds((prevSounds) => prevSounds.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        positionMillis: 0,
                    }
                }
                return s;
            }));
            setcurrentAudioPlaying(null);
        }
    }
    
    const getMaximumDurationValue = (audio) => {
        const filteredSounds = sounds.filter(s => s.id === audio.id);
        return filteredSounds.length ? filteredSounds[0].durationMillis : 1
    }

    const onAudioControlSlideComplete = async (newPositionMillis, audioId) => {
        if (currentAudioPlaying) {
            const [{sound}] = sounds?.filter(sound => sound.id === audioId);
            await sound.pauseAsync();
            await sound.playFromPositionAsync(newPositionMillis);
        }
        setSounds(sounds.map(s => {
            if (s.id === audioId) {
                return {...s, positionMillis: newPositionMillis};
            }
            return s;
        }));
    }

    const getAudioControlValue = (audio) => {
        const filteredSounds = sounds.filter(s => s.id === audio.id);
        return filteredSounds.length ? filteredSounds[0].positionMillis : 0
    }

    // ----------------------------------------------------------------------------------------

    return (
        <DraxProvider>
            <DraxList
                style={{flex: 1}}
                keyboardDismissMode='on-drag'
                onItemDragEnd={handleOnItemDragEnd}
                onItemDragStart={onItemDragStart}
                data={items}
                renderItemContent={({item}) => (
                    <View key={item.id}>
                        <Animated.View 
                            style={{
                                ...styles.itemListContainer, 
                                opacity: itemsOpacity[item.id], 
                                height: itemToDelete === item.id ? itemsHeight[item.id] : 'auto',
                            }}
                        >
                            <Checkbox 
                                style={styles.checkbox}
                                isChecked={item.checked} 
                                onPress={(checked) => changeItemCheck(checked, item.id)}
                            />
                            <Animated.View style={{...styles.itemContainer, width: showChecksAnimation}}>
                                <IconButton name='reorder' containerStyle={styles.reorderIcon} size={15} />
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
                                                value={item.value}
                                            />
                                        ),
                                        audio: (
                                            <View style={styles.audioItem}>
                                                <IconButton 
                                                    name={currentAudioPlaying === item.id ? 'pause' : 'play'} 
                                                    containerStyle={styles.audioButton} 
                                                    color={!currentAudioPlaying || currentAudioPlaying === item.id ? theme.textColor : 'grey'}
                                                    onPress={() => onAudioButtonPress(item.id)}
                                                />
                                                <View style={styles.audioSlider}>
                                                    <Slider
                                                        style={{width: '100%', height: '100%'}}
                                                        minimumValue={0}
                                                        maximumValue={getMaximumDurationValue(item)}
                                                        minimumTrackTintColor={theme.textColor}
                                                        maximumTrackTintColor={theme.backgroundColor}
                                                        thumbTintColor={theme.textColor}
                                                        onSlidingComplete={newPositionMillis => onAudioControlSlideComplete(newPositionMillis, item.id)}
                                                        value={getAudioControlValue(item)}
                                                    />
                                                </View>
                                            </View>
                                        )
                                    }[item.type]
                                }
                            </Animated.View>
                        </Animated.View>
                    </View>
                )}
                onItemReorder={({ fromIndex, toIndex }) => {
                    const newData = [...items];
                    newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
                    orderItemList(newData);
                }}
                keyExtractor={(item : item) => item.id}
            />
        </DraxProvider>
    );
}

export default ItemList;