import {View, StyleSheet, Image} from 'react-native';

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: '25%',
    },
    listContainer: {
        height: '100%',
        flexDirection: 'row',
        backgroundColor: '#064663',
        width: '90%',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    item: {
        height: '90%',
        width: 100,
        marginLeft: 10,
        borderRadius: 10,
    }
});

const ImagesItemList = ({items}) => {
    return (
        <>
            {
                items.length ? (
                    <View style={styles.container}>
                        <View style={styles.listContainer}>
                            {
                                items.map(item => (
                                    <Image key={item.id} style={styles.item} source={{uri: item.value}} />
                                ))
                            }
                        </View>
                    </View>
                ) : <View />
            }
        </>
    );
}

export default ImagesItemList;