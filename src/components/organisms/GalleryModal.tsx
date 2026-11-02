import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sortable from 'react-native-sortables';
import { Gallery, fitContainer, useImageResolution, type GalleryRefType } from 'react-native-zoom-toolkit';
import GlassBackdrop from '../atoms/GlassBackdrop';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Item, Theme } from '../../config/types';
import { useDialog } from '../../providers/DialogProvider';
import { useOverlay } from '../../providers/OverlayProvider';
import { moveItem } from '../../utils/reorder';

const GRID_COLUMNS = 3;
const GRID_GAP = 6;
const GRID_PADDING = 8;
const TOP_BAR_HEIGHT = 64;

const pageStyles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const overlayStyles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: theme.glassBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.glassBorder,
      boxShadow: `inset 0 1px 0 ${theme.glassHighlight}`,
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
    scroll: {
      flex: 1,
    },
    gridContent: {
      padding: GRID_PADDING,
      paddingBottom: 24,
    },
    thumbCell: {
      padding: 3,
    },
    thumbTouchable: {
      flex: 1,
    },
    thumbInner: {
      flex: 1,
      borderRadius: theme.borderRadiusSmall,
      borderCurve: 'continuous',
      overflow: 'hidden',
      backgroundColor: theme.secondaryColor,
      borderWidth: 1,
      borderColor: theme.glassBorder,
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    removeBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.deleteButtonColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      textAlign: 'center',
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
      backgroundColor: 'rgba(8,20,30,0.45)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    },
    viewerButtonDisabled: {
      opacity: 0.35,
    },
    viewerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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

type GalleryOverlayProps = {
  children: ReactNode;
  glass: boolean;
};

/**
 * Full-screen animated container. The blur lives outside the BlurTargetView
 * (the overlay host renders it), so the app behind the gallery is sampled.
 */
const GalleryOverlay = ({ children, glass }: GalleryOverlayProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[overlayStyles.fill, { opacity, transform: [{ translateY }] }]}
    >
      {glass ? <GlassBackdrop /> : null}
      {children}
    </Animated.View>
  );
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: Item[];
  onDelete: (item: Item) => void;
  onReorder: (items: Item[]) => void;
};

const GalleryModal = ({ visible, onClose, items, onDelete, onReorder }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dialog = useDialog();
  const { showOverlay, hideOverlay } = useOverlay();
  const overlayId = useId();

  const thumbSize =
    (width - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const scrollableRef = useAnimatedRef<Reanimated.ScrollView>();

  const galleryRef = useRef<GalleryRefType>(null);
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

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerIndex(index);
  };

  const renderItem = useCallback(
    (item: Item) => <GalleryImage uri={String(item.value)} />,
    [],
  );

  const confirmDelete = async (item: Item): Promise<boolean> => {
    const accepted = await dialog.confirm({
      title: i18n.t('deleteImageTitle'),
      message: i18n.t('deleteImageMessage'),
      confirmLabel: i18n.t('delete'),
      cancelLabel: i18n.t('cancel'),
      destructive: true,
    });
    if (!accepted) {
      return false;
    }
    onDelete(item);
    return true;
  };

  const deleteFromGrid = async (item: Item) => {
    const deleted = await confirmDelete(item);
    if (deleted && items.length <= 1) {
      close();
    }
  };

  const deleteCurrent = async () => {
    const item = items[currentIndex];
    if (!item) {
      return;
    }
    const deleted = await confirmDelete(item);
    if (!deleted) {
      return;
    }
    if (items.length <= 1) {
      close();
      return;
    }
    setViewerIndex(null);
  };

  const moveImage = (direction: -1 | 1) => {
    const to = currentIndex + direction;
    if (to < 0 || to >= items.length) {
      return;
    }
    onReorder(moveItem(items, currentIndex, to));
    setCurrentIndex(to);
    galleryRef.current?.setIndex(to);
  };

  // Handlers always read the latest render while the portal node is only
  // rebuilt when the visible gallery content changes.
  const handlersRef = useRef({
    close,
    openViewer,
    deleteFromGrid,
    deleteCurrent,
    moveImage,
    onReorder,
  });
  handlersRef.current = {
    close,
    openViewer,
    deleteFromGrid,
    deleteCurrent,
    moveImage,
    onReorder,
  };

  useEffect(() => {
    if (!visible) {
      hideOverlay(overlayId);
      return;
    }

    showOverlay(
      overlayId,
      <GalleryOverlay glass={viewerIndex === null}>
        <GestureHandlerRootView style={styles.root}>
          {viewerIndex === null ? (
            <>
              <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.title}>
                  {i18n.t('imagesTitle', { count: items.length })}
                </Text>
                <Pressable
                  onPress={() => handlersRef.current.close()}
                  style={styles.closeButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={i18n.t('cancel')}
                >
                  <FontAwesome name="times" size={22} color={theme.textColor} />
                </Pressable>
              </View>

              {items.length ? (
                <Reanimated.ScrollView
                  ref={scrollableRef}
                  style={styles.scroll}
                  contentContainerStyle={[
                    styles.gridContent,
                    {
                      paddingTop:
                        insets.top + TOP_BAR_HEIGHT + GRID_PADDING,
                    },
                  ]}
                >
                  <Sortable.Grid
                    data={items}
                    columns={GRID_COLUMNS}
                    rowGap={GRID_GAP}
                    columnGap={GRID_GAP}
                    keyExtractor={item => item.id}
                    scrollableRef={scrollableRef}
                    onDragEnd={({ data }) => handlersRef.current.onReorder(data)}
                    renderItem={({ item, index }) => (
                      <View
                        style={[styles.thumbCell, { width: thumbSize, height: thumbSize }]}
                      >
                        <Sortable.Touchable
                          style={styles.thumbTouchable}
                          onTap={() => handlersRef.current.openViewer(index)}
                        >
                          <View style={styles.thumbInner}>
                            <Image
                              source={{ uri: String(item.value) }}
                              style={styles.thumbImage}
                              resizeMode="cover"
                            />
                          </View>
                        </Sortable.Touchable>

                        <Sortable.Touchable
                          style={styles.removeBadge}
                          onTap={() => handlersRef.current.deleteFromGrid(item)}
                        >
                          <FontAwesome name="times" size={12} color="#FFFFFF" />
                        </Sortable.Touchable>
                      </View>
                    )}
                  />
                </Reanimated.ScrollView>
              ) : (
                <View style={[styles.emptyWrapper, { paddingTop: insets.top + TOP_BAR_HEIGHT }]}>
                  <Text style={styles.empty}>{i18n.t('noImages')}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.viewer}>
              <Gallery
                ref={galleryRef}
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
                <View style={styles.viewerActions}>
                  <Pressable
                    onPress={() => handlersRef.current.moveImage(-1)}
                    disabled={currentIndex === 0}
                    style={[
                      styles.viewerButton,
                      currentIndex === 0 && styles.viewerButtonDisabled,
                    ]}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={i18n.t('moveImageLeft')}
                  >
                    <FontAwesome name="arrow-left" size={16} color="#FFFFFF" />
                  </Pressable>
                  <Pressable
                    onPress={() => handlersRef.current.moveImage(1)}
                    disabled={currentIndex >= items.length - 1}
                    style={[
                      styles.viewerButton,
                      currentIndex >= items.length - 1 && styles.viewerButtonDisabled,
                    ]}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={i18n.t('moveImageRight')}
                  >
                    <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
                  </Pressable>
                  <Pressable
                    onPress={() => handlersRef.current.deleteCurrent()}
                    style={styles.viewerButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={i18n.t('delete')}
                  >
                    <FontAwesome name="trash" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </GestureHandlerRootView>
      </GalleryOverlay>,
    );
  }, [
    visible,
    viewerIndex,
    currentIndex,
    items,
    theme,
    insets,
    thumbSize,
    showOverlay,
    hideOverlay,
    overlayId,
  ]);

  useEffect(() => () => hideOverlay(overlayId), [hideOverlay, overlayId]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (viewerIndex !== null) {
        setViewerIndex(null);
      } else {
        onClose();
      }
      return true;
    });
    return () => subscription.remove();
  }, [visible, viewerIndex, onClose]);

  return null;
};

export default GalleryModal;
