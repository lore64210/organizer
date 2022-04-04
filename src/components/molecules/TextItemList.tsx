import {useRef, useEffect} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';

const styles = StyleSheet.create({
    itemListContainer: {
        alignItems: 'center',
    },
    textItemContainer: {
        backgroundColor: "#064663",
        width: '90%',
        marginVertical: 20,
        borderRadius: 10,
    },
    textItem: {
        padding: 10,
    }
});

const TextItemsList = ({items, actualItemTextId, changeItemText}) => {

    const textItemsRef = useRef({});

    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    return (
        <View style={styles.itemListContainer}>
            {
                items.map((itemText) => (
                    <View key={itemText.id} style={styles.textItemContainer}>
                        <TextInput 
                            ref={input => textItemsRef.current[itemText.id] = input}
                            multiline
                            style={styles.textItem} 
                            onChangeText={(newText) => changeItemText(newText, itemText.id)} 
                            placeholderTextColor='#876b44'
                            placeholder='Nuevo reminder...'
                        />
                    </View>
                ))
            }
        </View>
    );
}

export default TextItemsList;