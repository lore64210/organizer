import {useRef, useEffect} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    itemListContainer: {
        alignItems: 'center',
    },
    textItemContainer: {
        backgroundColor: theme.primaryColor,
        width: '95%',
        marginVertical: 20,
        borderRadius: theme.borderRadius,
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