import {StyleSheet, View} from 'react-native';
import theme from '../../config/theme';
import Header from './Header';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    }
});

const Layout = ({children, headerProps}) => (
    <View style={styles.container}>
        <Header {...headerProps} />
        {children}
    </View>
);

export default Layout;