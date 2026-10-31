import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gallery, fitContainer, useImageResolution } from 'react-native-zoom-toolkit';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Item, Theme } from '../../config/types';
import { confirm } from '../../utils/alerts';

const pageStyles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    title: {
      color: theme.textColor,
      fontSize: 18,
      fontFamily: 'Montserrat_700Bold',
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      paddingHorizontal: 6,
      paddingBottom: 24,
    },
    thumbCell: {
      width: '33.333%',
      padding: 3,
    },
    thumbInner: {
      aspectRatio: 1,
      borderRadius: theme.borderRadius,
      overflow: 'hidden',
      backgroundColor: theme.secondaryColor,
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    empty: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      textAlign: 'center',
      marginTop: 40,
    },
    viewer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    viewerTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    viewerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    counter: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_400Regular',
      fontSize: 14,
    },
  });

type GalleryImageProps = {
  uri: string;
};

const GalleryImage = ({ uri }: GalleryImageProps) => {
  const { width, height } = useWindowDimensions();
  const { resolution } = useImageResolution({ uri });

  const size = resolution
    ? fitContainer(resolution.width / resolution.height, { width, height })
    : { width, height };

  return (
    <View style={pageStyles.page}>
      <Image
        source={{ uri }}
        style={size}
        resizeMode="contain"
        resizeMethod="scale"
      />
    </View>
  );
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: Item[];
  onDelete: (item: Item) => void;
};

const GalleryModal = ({ visible, onClose, items, onDelete }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setViewerIndex(null);
      setCurrentIndex(0);
    }
  }, [visible]);

  const close = () => {
    setViewerIndex(null);
    onClose();
  };

  const renderItem = useCallback(
    (item: Item) => <GalleryImage uri={String(item.value)} />,
    [],
  );

  const deleteCurrent = async () => {
    const item = items[currentIndex];
    if (!item) {
      return;
    }

    const accepted = await confirm({
      title: i18n.t('deleteItemTitle'),
      message: i18n.t('deleteImageMessage'),
      confirmLabel: i18n.t('delete'),
      cancelLabel: i18n.t('cancel'),
    });
    if (!accepted) {
      return;
    }

    onDelete(item);
    if (items.length <= 1) {
      close();
      return;
    }
    setViewerIndex(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={viewerIndex === null ? close : () => setViewerIndex(null)}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {viewerIndex === null ? (
          <>
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
              <Text style={styles.title}>
                {i18n.t('imagesTitle', { count: items.length })}
              </Text>
              <Pressable
                onPress={close}
                style={styles.closeButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('cancel')}
              >
                <FontAwesome name="times" size={22} color={theme.textColor} />
              </Pressable>
            </View>

            <FlatList
              data={items}
              keyExtractor={item => item.id}
              numColumns={3}
              contentContainerStyle={styles.grid}
              renderItem={({ item, index }) => (
                <Pressable
                  style={styles.thumbCell}
                  onPress={() => {
                    setCurrentIndex(index);
                    setViewerIndex(index);
                  }}
                  accessibilityRole="imagebutton"
                >
                  <View style={styles.thumbInner}>
                    <Image
                      source={{ uri: String(item.value) }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>{i18n.t('noImages')}</Text>}
            />
          </>
        ) : (
          <View style={styles.viewer}>
            <Gallery
              data={items}
              keyExtractor={item => item.id}
              initialIndex={viewerIndex}
              maxScale={4}
              onIndexChange={setCurrentIndex}
              renderItem={renderItem}
            />

            <View
              style={[styles.viewerTop, { paddingTop: insets.top + 8 }]}
              pointerEvents="box-none"
            >
              <Pressable
                onPress={() => setViewerIndex(null)}
                style={styles.viewerButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('cancel')}
              >
                <FontAwesome name="chevron-left" size={18} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.counter} pointerEvents="none">
                {currentIndex + 1} / {items.length}
              </Text>
              <Pressable
                onPress={deleteCurrent}
                style={styles.viewerButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('delete')}
              >
                <FontAwesome name="trash" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default GalleryModal;
