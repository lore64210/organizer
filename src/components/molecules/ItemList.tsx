import {useRef, useEffect, useState} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import theme from '../../config/theme';
import { IconButton } from '../atoms';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

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

    const [currentAudioPlaying, setcurrentAudioPlaying] = useState(null);
    const [sounds, setSounds] = useState<{id: string, sound: Sound, positionMillis: any, durationMillis: any}[]>([]);

    const textItemsRef = useRef({});

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

    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    const getMaximumDurationValue = (audio) => {
        const filteredSounds = sounds.filter(s => s.id === audio.id);
        return filteredSounds.length ? filteredSounds[0].durationMillis : 1
    }

    const onAudioControlSlideComplete = async (newPositionMillis, audioId) => {
        if (currentAudioPlaying) {
            const [{sound}] = sounds?.filter(sound => sound.id === audioId);
            console.log('pausing')
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
                    </View>
                ))
            }
        </View>
    );
}

export default ItemList;