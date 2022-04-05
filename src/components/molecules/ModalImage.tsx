import {View, Modal, Image, StyleSheet, useWindowDimensions} from 'react-native';
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
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: theme.borderRadius,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 20,
        borderRadius: theme.borderRadius,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        position: 'relative',
        backgroundColor: theme.primaryColor,
        borderRadius: theme.borderRadiusButton,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        marginTop: 20,
    }
});

const ModalImage = ({visible, setVisible, item}) => {

    const dimensions = useWindowDimensions();

    const onClose = () => {
        setVisible(false);
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContentContainer}>
                    {
                        item && <Image style={{...styles.image, height: dimensions.height / 1.25, width: dimensions.width / 1.25}} source={{uri: item.value}} />
                    }
                    <View style={styles.buttonsContainer}>
                        <IconButton containerStyle={styles.button} name='check' onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalImage;