import {useRef, useEffect} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    itemListContainer: {
        alignItems: 'center',
    },
    itemContainer: {
        backgroundColor: theme.primaryColor,
        width: '95%',
        marginVertical: 20,
        borderRadius: theme.borderRadius,
    },
    textItem: {
        padding: 10,
        color: theme.textColor,
    }
});

const ItemList = ({items, actualItemTextId, changeItemText}) => {

    const textItemsRef = useRef({});

    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    return (
        <View style={styles.itemListContainer}>
            {
                items.map((item) => (
                    <View key={item.id} style={styles.itemContainer}>
                        {
                            {
                                text: (
                                    <TextInput 
                                        ref={input => textItemsRef.current[item.id] = input}
                                        multiline
                                        style={styles.textItem} 
                                        onChangeText={newText => changeItemText(newText, item.id)} 
                                        placeholderTextColor={theme.placeholderTextColor}
                                        placeholder='Nuevo reminder...'
                                    />
                                ),
                                audio: (
                                    <View>

                                    </View>
                                )
                            }[item.type]
                        }
                    </View>
                ))
            }
        </View>
    );
}

export default ItemList;