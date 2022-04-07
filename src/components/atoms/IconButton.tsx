import {TouchableHighlight, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.primaryColor,
        borderRadius: theme.borderRadiusButton,
        borderColor: theme.backgroundColor,
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: theme.buttonSize,
        height: theme.buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const IconButton : React.FC<{
    name: any, 
    color?: string, 
    size?: number, 
    onPress?: () => void, 
    onPressIn?: () => void, 
    onPressOut?: () => void, 
    style?: any, 
    containerStyle?: any
}> = (props) => {

    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    const {
        name, 
        color = theme.textColor, 
        size = 20, 
        onPress = () => {}, 
        style = {}, 
        containerStyle = {}, 
        onPressIn = () => {}, 
        onPressOut = () => {}
    } = props;

    return (
        <TouchableHighlight 
            underlayColor={theme.backgroundColor} 
            onPress={onPress} 
            onPressIn={onPressIn} 
            onPressOut={onPressOut} 
            style={{...styles.container, ...containerStyle}}
        >
            <FontAwesome style={style} name={name} color={color} size={size}/>
        </TouchableHighlight>
    )
}

export default IconButton;