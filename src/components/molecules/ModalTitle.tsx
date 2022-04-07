import {useEffect, useRef} from 'react';
import {useState} from 'react';
import {View, Modal, Text, StyleSheet, TextInput} from 'react-native';
import theme from '../../config/theme';
import {IconButton} from '../atoms';

const styles = StyleSheet.create({
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
    },
    input: {
        color: theme.textColor,
        backgroundColor: theme.primaryColor,
        width: '90%',
        padding: 10,
        borderRadius: theme.borderRadius,
        marginBottom: 30,
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

const ModalTitle = ({visible, setVisible, saveTitle, title: reminderTitle, goBack}) => {

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
                    <Text style={styles.modalTitle}>Título del recordatorio:</Text>
                    <TextInput 
                        ref={inputRef}
                        style={styles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder="Ingrese un título..."
                        maxLength={30}
                        placeholderTextColor={theme.placeholderTextColor}
                    />
                    <View style={styles.buttonsContainer}>
                        {
                            !!reminderTitle
                            ? <IconButton containerStyle={styles.button} name='close' onPress={onClose} />
                            : <IconButton containerStyle={styles.button} name='arrow-left' onPress={onGoBack} />
                        }
                        <IconButton containerStyle={styles.button} name='check' onPress={saveChanges} color={!!title ? theme.textColor : 'grey'} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalTitle;