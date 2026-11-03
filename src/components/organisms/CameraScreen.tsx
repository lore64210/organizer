import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    camera: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 14,
      zIndex: 20,
    },
    topBarGlass: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: theme.borderRadiusLarge,
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}, 0 12px 30px ${theme.glassShadow}`,
      elevation: 8,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.textColor,
      fontFamily: 'Montserrat_700Bold',
      fontSize: 11,
      letterSpacing: 2,
    },
    controlButton: {
      position: 'relative',
      left: 0,
      right: 'auto',
      bottom: 0,
      width: 42,
      height: 42,
      backgroundColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
    },
    zoomRail: {
      position: 'absolute',
      right: 14,
      zIndex: 20,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: 30,
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}, 0 12px 30px ${theme.glassShadow}`,
      elevation: 8,
    },
    zoomSliderBox: {
      width: 44,
      height: 168,
      alignItems: 'center',
      justifyContent: 'center',
    },
    zoomSlider: {
      width: 158,
      height: 32,
      transform: [{ rotate: '-90deg' }],
    },
    zoomLabel: {
      color: theme.mutedColor,
      fontFamily: 'Montserrat_700Bold',
      fontSize: 9,
      letterSpacing: 0.5,
      marginTop: 2,
    },
    scannedPill: {
      position: 'absolute',
      left: 24,
      right: 24,
      alignItems: 'center',
      zIndex: 20,
    },
    scannedGlass: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}, 0 12px 30px ${theme.glassShadow}`,
      elevation: 8,
    },
    scannedText: {
      color: theme.textColor,
      fontFamily: 'Montserrat_700Bold',
      fontSize: 12,
    },
    bottomDock: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      zIndex: 20,
    },
    dockGlass: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.glassBackground,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}, 0 16px 36px ${theme.glassShadow}`,
      elevation: 10,
    },
    shutter: {
      position: 'relative',
      left: 0,
      right: 'auto',
      bottom: 0,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(236,179,101,0.14)',
      borderWidth: 1,
      borderColor: theme.accentColor,
      boxShadow: `inset 0 0 0 7px ${theme.glassBackground}`,
    },
    hint: {
      marginTop: 10,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      fontSize: 10,
      letterSpacing: 0.6,
      opacity: 0.82,
    },
    savingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: theme.backgroundColor,
    },
    savingText: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      fontSize: 13,
    },
  });

type Props = {
  navigation: any;
};

const CameraScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const dialog = useDialog();
  const { theme } = useAppSelector(state => state.themeReducer);
  const reminder = useAppSelector(state => state.remindersReducer.currentReminder);
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [dataScanned, setDataScanned] = useState<string | null>(null);
  const [dataScannedIcon, setDataScannedIcon] = useState<'qrcode' | 'barcode'>('qrcode');
  const [capturing, setCapturing] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const pausePreview = () => {
    cameraRef.current?.pausePreview().catch(() => {});
  };

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

  // Unmount the native camera surface before the screen leaves. The extra delay
  // gives Android time to release it; otherwise it can remain over the previous
  // screen as a black rectangle.
  useEffect(() => {
    if (!leaving) {
      return;
    }
    const timeout = setTimeout(() => navigation.goBack(), 350);
    return () => clearTimeout(timeout);
  }, [leaving, navigation]);

  // Handle the hardware back button and gestures through the same safe path.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (leaving) {
        return;
      }
      event.preventDefault();
      pausePreview();
      setSavingPhoto(false);
      setLeaving(true);
    });
    return unsubscribe;
  }, [navigation, leaving]);

  const changeZoom = (delta: number) => {
    setZoom(current => Math.min(1, Math.max(0, Math.round((current + delta) * 100) / 100)));
  };

  const closeCamera = () => {
    pausePreview();
    setSavingPhoto(false);
    setLeaving(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !reminder || capturing || leaving) {
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) {
        setCapturing(false);
        return;
      }

      await cameraRef.current?.pausePreview().catch(() => {});
      setSavingPhoto(true);

      const newImage: Item = {
        id: generateUUID(),
        value: await persistFile(photo.uri),
        type: 'image',
      };
      dispatch({
        type: SET_CURRENT_REMINDER,
        payload: { ...reminder, imageItems: [newImage, ...reminder.imageItems] },
      });
      setLeaving(true);
    } catch (error) {
      console.warn('Could not take picture', error);
      setSavingPhoto(false);
      setCapturing(false);
    }
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
    pausePreview();
    setSavingPhoto(false);
    setLeaving(true);
  };

  if (!permission?.granted) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {!leaving ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          zoom={zoom}
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={dataScanned ? undefined : handleBarCodeScanned}
        />
      ) : null}

      {!leaving ? (
        <>
          <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
            <View style={styles.topBarGlass}>
              <IconButton
                name="chevron-left"
                onPress={closeCamera}
                containerStyle={styles.controlButton}
                color={theme.textColor}
                elevated={false}
                accessibilityLabel={i18n.t('closeCamera')}
              />
              <Text style={styles.title}>{i18n.t('cameraTitle').toUpperCase()}</Text>
              <View style={styles.topActions}>
                <IconButton
                  name="flash"
                  onPress={() => setFlash(current => (current === 'on' ? 'off' : 'on'))}
                  containerStyle={styles.controlButton}
                  color={flash === 'on' ? theme.accentColor : theme.mutedColor}
                  elevated={false}
                  accessibilityLabel={i18n.t('toggleFlash')}
                />
                <IconButton
                  name="refresh"
                  onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                  containerStyle={styles.controlButton}
                  color={theme.textColor}
                  elevated={false}
                  accessibilityLabel={i18n.t('flipCamera')}
                />
              </View>
            </View>
          </View>

          <View style={[styles.zoomRail, { top: insets.top + 96 }]}>
            <IconButton
              name="plus"
              onPress={() => changeZoom(0.1)}
              containerStyle={styles.controlButton}
              color={theme.textColor}
              elevated={false}
              accessibilityLabel={i18n.t('zoomIn')}
            />
            <View style={styles.zoomSliderBox}>
              <Slider
                style={styles.zoomSlider}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                minimumTrackTintColor={theme.accentColor}
                maximumTrackTintColor={theme.insetColor}
                thumbTintColor={theme.textColor}
                onValueChange={setZoom}
                value={zoom}
              />
            </View>
            <IconButton
              name="minus"
              onPress={() => changeZoom(-0.1)}
              containerStyle={styles.controlButton}
              color={theme.textColor}
              elevated={false}
              accessibilityLabel={i18n.t('zoomOut')}
            />
            <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
          </View>

          {dataScanned ? (
            <View style={[styles.scannedPill, { bottom: insets.bottom + 152 }]}>
              <Pressable
                style={styles.scannedGlass}
                onPress={onCodeScannedButtonPress}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('useScannedCode')}
              >
                <FontAwesome name={dataScannedIcon} size={16} color={theme.accentColor} />
                <Text style={styles.scannedText}>{i18n.t('useScannedCode')}</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.dockGlass}>
              <IconButton
                containerStyle={styles.shutter}
                name="dot-circle-o"
                size={56}
                onPress={takePicture}
                color={theme.accentColor}
                elevated={false}
                disabled={capturing}
                accessibilityLabel={i18n.t('takePhoto')}
              />
            </View>
            <Text style={styles.hint}>{i18n.t('cameraHint')}</Text>
          </View>
        </>
      ) : (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={theme.accentColor} size="large" />
          <Text style={styles.savingText}>
            {i18n.t(savingPhoto ? 'savingPhoto' : 'closingCamera')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CameraScreen;
