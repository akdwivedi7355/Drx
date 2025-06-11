import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const LoadingScreen = () => {
    const waveAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    
    const circleAnimations = useMemo(() => (
        Array(8).fill(0).map(() => new Animated.Value(0))
    ), []);

    useEffect(() => {
        // Wave animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Progress animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Logo scale and fade animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();

        // Circular animations
        circleAnimations.forEach((anim, index) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 2000,
                        delay: index * 250,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    })
                ])
            ).start();
        });

        return () => {
            // Cleanup animations
            circleAnimations.forEach(anim => anim.stopAnimation());
            waveAnim.stopAnimation();
            scaleAnim.stopAnimation();
            fadeAnim.stopAnimation();
            progressAnim.stopAnimation();
        };
    }, []);

    const renderCircles = () => {
        return circleAnimations.map((anim, index) => {
            const angle = (index * 360) / 8;
            const radius = 100;
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);

            return (
                <Animated.View
                    key={index}
                    style={[
                        styles.circle,
                        {
                            transform: [
                                { translateX: x },
                                { translateY: y },
                                {
                                    scale: anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 1]
                                    })
                                }
                            ],
                            opacity: anim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.4, 1, 0.4]
                            })
                        }
                    ]}
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.circleContainer]}>
                {renderCircles()}
            </Animated.View>

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [
                            { scale: scaleAnim },
                            {
                                translateY: waveAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -20]
                                })
                            }
                        ],
                        opacity: fadeAnim
                    }
                ]}
            >
                {/* <Text style={styles.logo}>A</Text> */}
                <View style={styles.textContainer}>
                    <Text style={styles.appName}>AarogyaRx</Text>
                    <Text style={styles.tagline}>Your Health Partner</Text>
                </View>
            </Animated.View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <Animated.View 
                        style={[
                            styles.progressFill,
                            {
                                transform: [{
                                    scaleX: progressAnim
                                }],
                                opacity: fadeAnim
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleContainer: {
        position: 'absolute',
        width: 400,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#38bdf8',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 20,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    logo: {
        fontSize: 40,
        fontWeight: '800',
        color: '#38bdf8',
        marginRight: 12,
    },
    textContainer: {
        justifyContent: 'center',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#f8fafc',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 100,
        width: 400,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#1e293b',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#38bdf8',
        transform: [{ scaleX: 0 }],
        transformOrigin: 'left',
    },
});

export default LoadingScreen;

