import {StyleSheet, View} from 'react-native';
import { Header } from '../molecules';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#041C32',
    }
});

const Layout = ({children, headerProps}) => (
    <View style={styles.container}>
        <Header {...headerProps} />
        {children}
    </View>
);

export default Layout;