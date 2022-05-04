import {useEffect, useRef} from 'react';
import {useState} from 'react';
import {View, Modal, Text, StyleSheet, TextInput} from 'react-native';
import {IconButton} from '../atoms';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';

const createStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContentContainer: {
        backgroundColor: theme.secondaryColor,
        width: '90%',
        height: 200,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: theme.borderRadius,
    },
    modalTitle: {
        fontSize: 20,
        color: theme.textColor,
        fontFamily: 'Montserrat_400Regular'
    },
    input: {
        color: theme.textColor,
        backgroundColor: theme.primaryColor,
        width: '90%',
        padding: 10,
        borderRadius: theme.borderRadius,
        marginBottom: 30,
        fontFamily: 'Montserrat_400Regular',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        position: 'relative',
        width: 40,
        height: 40,
        left: 0,
    }
});

const ModalTitle = ({visible, setVisible, saveTitle, title: reminderTitle, goBack, cancelButton = false, modalTitle = i18n.t('organizerTitle')}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);

    const inputRef = useRef<TextInput>(null);

    const [title, setTitle] = useState(reminderTitle);

    useEffect(() => {
        setTitle(reminderTitle);
    }, [reminderTitle]);
    
    const saveChanges = () => {
        if (!!title) {
            saveTitle(title);
            setVisible(false);
        }
    }

    const onGoBack = () => {
        setVisible(false);
        goBack();
    }

    const onClose = () => {
        setTitle(reminderTitle);
        setVisible(false);
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onShow={() => {
                inputRef.current.focus();
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContentContainer}>
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <TextInput 
                        ref={inputRef}
                        style={styles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder={i18n.t('insertTitle')}
                        maxLength={30}
                        placeholderTextColor={theme.placeholderTextColor}
                        onSubmitEditing={saveChanges}
                    />
                    <View style={styles.buttonsContainer}>
                        {
                            cancelButton
                            ? <IconButton containerStyle={styles.button} name='close' onPress={onClose} />
                            : (
                                <>
                                    {
                                        !!reminderTitle
                                        ? <IconButton containerStyle={styles.button} name='close' onPress={onClose} />
                                        : <IconButton containerStyle={styles.button} name='arrow-left' onPress={onGoBack} />
                                    }
                                </>
                            )
                        }
                        <IconButton containerStyle={styles.button} name='check' onPress={saveChanges} color={!!title ? theme.textColor : 'grey'} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalTitle;