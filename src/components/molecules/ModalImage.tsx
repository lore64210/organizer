import { Image, Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Item, Theme } from '../../config/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContentContainer: {
      backgroundColor: theme.secondaryColor,
      width: '90%',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: theme.borderRadius,
    },
    image: {
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
      bottom: 0,
      marginTop: 20,
    },
  });

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  item: Item | null;
};

const ModalImage = ({ visible, setVisible, item }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);
  const dimensions = useWindowDimensions();

  const uri = typeof item?.value === 'string' ? item.value : null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContentContainer}>
          {uri ? (
            <Image
              style={[
                styles.image,
                {
                  height: dimensions.height / 1.4,
                  width: dimensions.width / 1.15,
                },
              ]}
              source={{ uri }}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.buttonsContainer}>
            <IconButton
              containerStyle={styles.button}
              name="check"
              onPress={() => setVisible(false)}
              accessibilityLabel={i18n.t('cancel')}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalImage;
