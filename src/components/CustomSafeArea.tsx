// src/components/CustomSafeArea.tsx
import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomSafeAreaProps {
    children: ReactNode;
    backgroundColor?: string;
    style?: ViewStyle;
    statusBarColor?: 'dark-content' | 'dark-content';
    translucent?: boolean;
}

const CustomSafeArea = ({
    children,
    backgroundColor = '#fff',
    style,
    statusBarColor = 'dark-content',
    translucent = false,
}: CustomSafeAreaProps) => {
    return (
        <SafeAreaView
            edges={['top', 'left', 'right']} // Optional: control what areas are padded
            style={[styles.safeArea, { backgroundColor }, style]}
        >
            <StatusBar
                barStyle={statusBarColor}
                backgroundColor={backgroundColor}
                translucent={translucent}
            />
            <View style={styles.inner}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    inner: {
        flex: 1,
        // Optional padding for inner content
        // paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 0 : 0,
    },
});

export default CustomSafeArea;
