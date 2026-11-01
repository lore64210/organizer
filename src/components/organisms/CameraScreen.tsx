import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
  type CameraType,
  type FlashMode,
} from 'expo-camera';
import Slider from '@react-native-community/slider';
import i18n from '../../config/i18n';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import { SET_CURRENT_REMINDER } from '../../config/redux/actions';
import type { Item, Theme } from '../../config/types';
import { IconButton } from '../atoms';
import { useDialog } from '../../providers/DialogProvider';
import { persistFile } from '../../utils/files';
import generateUUID from '../../utils/uuidUtil';

const BARCODE_TYPES: BarcodeType[] = [
  'qr',
  'ean13',
  'ean8',
  'code128',
  'code39',
  'upc_a',
  'upc_e',
  'pdf417',
  'aztec',
  'datamatrix',
];

const createStyles = (theme: Theme, window: ReturnType<typeof useWindowDimensions>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    overlay: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      left: 0,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme.glassBackground,
      borderTopWidth: 1,
      borderTopColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}`,
    },
    button: {
      position: 'relative',
      right: 0,
      left: 0,
      bottom: 0,
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}`,
    },
    takePictureButton: {
      width: 70,
      height: 70,
    },
    zoomBar: {
      left: '55%',
      bottom: '25%',
      position: 'absolute',
      transform: [{ rotate: '-90deg' }],
      width: 200,
      height: 30,
    },
    scannedButtonContainer: {
      position: 'absolute',
      bottom: 110,
      left: window.width / 2 - 25,
    },
    scannedButton: {
      width: 50,
      height: 50,
      position: 'relative',
      left: 0,
      bottom: 0,
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}`,
    },
  });

type Props = {
  navigation: any;
};

const CameraScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const dialog = useDialog();
  const theme = useAppSelector(state => state.themeReducer.theme);
  const reminder = useAppSelector(state => state.remindersReducer.currentReminder);
  const window = useWindowDimensions();
  const styles = createStyles(theme, window);

  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [dataScanned, setDataScanned] = useState<string | null>(null);
  const [dataScannedIcon, setDataScannedIcon] = useState<'qrcode' | 'barcode'>('qrcode');

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      return;
    }
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
      return;
    }
    if (!permission.granted) {
      dialog.notify({ title: i18n.t('cameraPermission') });
      navigation.goBack();
    }
  }, [permission]);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (!photo?.uri || !reminder) {
      return;
    }
    const newImage: Item = {
      id: generateUUID(),
      value: await persistFile(photo.uri),
      type: 'image',
    };
    dispatch({
      type: SET_CURRENT_REMINDER,
      payload: { ...reminder, imageItems: [newImage, ...reminder.imageItems] },
    });
    navigation.goBack();
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setDataScannedIcon(type === 'qr' ? 'qrcode' : 'barcode');
    setDataScanned(data);
  };

  const onCodeScannedButtonPress = () => {
    if (!dataScanned || !reminder) {
      return;
    }
    const newItem: Item = {
      id: generateUUID(),
      value: dataScanned,
      type: 'text',
      checked: false,
    };
    dispatch({
      type: SET_CURRENT_REMINDER,
      payload: { ...reminder, items: [newItem, ...reminder.items] },
    });
    navigation.goBack();
  };

  if (!permission?.granted) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={zoom}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={dataScanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.zoomBar}>
            <Slider
              style={{ width: '100%', height: '100%' }}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor={theme.accentColor}
              maximumTrackTintColor={theme.insetColor}
              thumbTintColor={theme.textColor}
              onValueChange={setZoom}
              value={zoom}
            />
          </View>

          {dataScanned ? (
            <View style={styles.scannedButtonContainer}>
              <IconButton
                containerStyle={styles.scannedButton}
                name={dataScannedIcon}
                onPress={onCodeScannedButtonPress}
                elevated={false}
                accessibilityLabel={i18n.t('newItemPlaceholder')}
              />
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <IconButton
              containerStyle={styles.button}
              name="flash"
              onPress={() => setFlash(current => (current === 'on' ? 'off' : 'on'))}
              color={flash === 'on' ? theme.accentColor : theme.mutedColor}
              elevated={false}
              accessibilityLabel={i18n.t('cameraPermission')}
            />
            <IconButton
              size={50}
              containerStyle={{ ...styles.button, ...styles.takePictureButton }}
              name="dot-circle-o"
              onPress={takePicture}
              color={theme.accentColor}
              elevated={false}
              accessibilityLabel={i18n.t('cameraPermission')}
            />
            <IconButton
              containerStyle={styles.button}
              name="refresh"
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              elevated={false}
              accessibilityLabel={i18n.t('cameraPermission')}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

export default CameraScreen;
