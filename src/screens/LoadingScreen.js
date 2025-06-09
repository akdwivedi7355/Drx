import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
    const spinAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [spinAnim, fadeAnim]);

    const rotate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.hexagonContainer, { transform: [{ rotate }] }]}>
                {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (i * 360) / 6;
                    const x = 60 * Math.cos((angle * Math.PI) / 180);
                    const y = 60 * Math.sin((angle * Math.PI) / 180);

                    return (
                        <View
                            key={i}
                            style={[
                                styles.hex,
                                {
                                    left: x + width / 2 - 30,
                                    top: y + 200,
                                },
                            ]}
                        />
                    );
                })}
            </Animated.View>

            <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
                Arogya Health Platform
            </Animated.Text>
            <Text style={styles.subText}>Optimizing system modules...</Text>
        </View>
    );
};

export default LoadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hexagonContainer: {
        position: 'absolute',
        width: width,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hex: {
        width: 20,
        height: 20,
        backgroundColor: '#38bdf8',
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        borderRadius: 4,
        shadowColor: '#38bdf8',
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 4,
    },
    text: {
        fontSize: 20,
        color: '#f8fafc',
        fontWeight: '600',
        marginTop: 240,
    },
    subText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 10,
    },
});

