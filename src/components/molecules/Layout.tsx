import {StyleSheet, View} from 'react-native';
import Header from './Header';
import { useSelector } from 'react-redux';

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    }
});

const Layout = ({children, headerProps}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);
    
    return (
        <View style={styles.container}>
            <Header {...headerProps} />
            {children}
        </View>
    );
}

export default Layout;