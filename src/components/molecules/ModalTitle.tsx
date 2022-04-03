import {useEffect, useRef} from 'react';
import {useState} from 'react';
import {View, Modal, Text, StyleSheet, TextInput} from 'react-native';
import {IconButton} from '../atoms';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContentContainer: {
        backgroundColor: '#04293A',
        width: '90%',
        height: 200,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: 20,
        color: '#ECB365',
    },
    input: {
        color: 'white',
        backgroundColor: '#064663',
        width: '90%',
        padding: 10,
        borderRadius: 12,
        marginBottom: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
    },
    button: {
        position: 'relative',
        backgroundColor: '#064663',
        borderRadius: 100,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
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
            onShow={() => inputRef.current.focus()}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContentContainer}>
                    <Text style={styles.modalTitle}>Título del recordatorio:</Text>
                    <TextInput 
                        ref={(input) => inputRef.current = input}
                        style={styles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder="Ingrese un título..."
                        maxLength={30}
                        placeholderTextColor='#876b44'
                    />
                    <View style={styles.buttonsContainer}>
                        {
                            !!reminderTitle
                            ? <IconButton containerStyle={styles.button} name='ban' onPress={onClose} />
                            : <IconButton containerStyle={styles.button} name='arrow-left' onPress={onGoBack} />
                        }
                        <IconButton containerStyle={styles.button} name='check' onPress={saveChanges} color={!!title ? '#ECB365' : 'grey'} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalTitle;