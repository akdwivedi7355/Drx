/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import {
    getpatientListwithoutdoctor,
} from '../api/api';
import { TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

const iconMap = {
    Prescriptions: { icon: 'clipboard-outline', name: 'Prescription', color: '#4F46E5' },
    Diagnostic: { icon: 'flask-outline', name: 'Diagnostic', color: '#059669' },
    MedicalBill: { icon: 'cash-outline', name: 'Medical Bill', color: '#B45309' },
    Discard: { icon: 'trash-outline', name: 'Discard', color: '#DC2626' },
};

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const navigation = useNavigation();

    // Add sortedPatients computed value
    const sortedPatients = React.useMemo(() => {
        return [...patients].sort((a, b) => {
            const tokenA = parseInt(a.tokenNo, 10);
            const tokenB = parseInt(b.tokenNo, 10);
            return tokenA - tokenB;
        });
    }, [patients]);

    useFocusEffect(
        React.useCallback(() => {
            fetchPatients(0, false);
        }, [])
    );

    const fetchPatients = async (pageIndex = 0, append = false) => {
        try {
            setLoading(true);
            const res = await getpatientListwithoutdoctor(
                searchText,
                '10',
                (pageIndex * 10).toString()
            );

            if (res.status && res.data) {
                if (res.data.length < 10) setHasMoreData(false);
                setPatients(prev => append ? [...prev, ...res.data] : res.data);
            } else {
                setHasMoreData(false);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchText) {
            setPage(0);
            setHasMoreData(true);
            fetchPatients(0, false);
        }
    }, [searchText]);

    const handleLoadMore = () => {
        if (!loading && hasMoreData) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPatients(nextPage, true);
        }
    };

    const toggleExpand = id => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const handleNavigate = (patientId, tab) => {
        const patient = patients.find(p => p.regId === patientId);

        console.log('Navigating to tab:', tab, 'for patient:', patient);

        if (!patient) {
            console.warn('Patient not found!');
            return;
        }

        switch (tab) {
            case 0:
                navigation.navigate('PrescriptionSubmission', { patient });
                break;
            case 1:
                navigation.navigate('DiagnosticSubmission', { patient });
                break;
            case 2:
                navigation.navigate('MedicalBillSubmission', { patient });
                break;
            case 3:
                navigation.navigate('MedicalBillSubmission', { patient });
                break;
            case 6:
                navigation.navigate('PatientTabs', { patientId, initialTab: 0 });
                break;
            default:
                console.warn('Unhandled tab value:', tab);
        }
    };

    const renderPatientItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleNavigate(item.regId, 6)}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.leftSection}>
                        <View style={styles.tokenContainer}>
                            <Text style={styles.tokenText}>{item.tokenNo}</Text>
                        </View>
                        <View style={styles.mainInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name} numberOfLines={1}>{item.patientName}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <View style={styles.detailsRow}>
                                    <Text style={styles.uhid}>UHID: {item.uhidNo}</Text>
                                    <Text style={styles.dot}>•</Text>
                                    <Text style={styles.regTime}>{item.regDate} {item.regTime}</Text>
                                </View>
                                <View style={styles.detailsRow}>
                                    <Text style={styles.gender}>{item.gender}</Text>
                                    <Text style={styles.age}>{item.age}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => toggleExpand(item.regId)}
                    >
                        <Icon
                            name={expandedId === item.regId ? "chevron-up-circle" : "chevron-down-circle"}
                            size={20}
                            color="#4F46E5"
                        />
                    </TouchableOpacity>
                </View>
                {expandedId === item.regId && (
                    <View style={styles.bottomTabs}>
                        {Object.keys(iconMap).map((label, i) => (
                            <TouchableOpacity
                                key={label}
                                style={styles.tabButton}
                                onPress={() => handleNavigate(item.regId, i)}
                            >
                                <Icon name={iconMap[label].icon} size={18} color={iconMap[label].color} />
                                <Text style={[styles.tabText, { color: iconMap[label].color }]}>
                                    {iconMap[label].name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />

            <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                    <Icon name="search" size={20} color="#6B7280" />
                    <TextInput
                        mode="flat"
                        placeholder="Search patients..."
                        value={searchText}
                        onChangeText={setSearchText}
                        style={styles.searchInput}
                        theme={{ colors: { primary: '#4F46E5' } }}
                    />
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Patient Registration')}
                    style={styles.addButton}
                >
                    <Icon name="person-add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sortedPatients}
                keyExtractor={(item) => item?.regId?.toString() || Math.random().toString()}
                renderItem={renderPatientItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="people-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No patients found</Text>
                    </View>
                }
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator color="#4F46E5" style={{ marginVertical: 16 }} />
                    ) : !hasMoreData && patients.length > 0 ? (
                        <Text style={styles.footerText}>No more records</Text>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 36,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'transparent',
        height: 36,
        marginLeft: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 4,
        fontSize: 13,
    },
    listContainer: {
        padding: 8,
    },
    cardContainer: {
        marginBottom: 6,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    card: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tokenContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    tokenText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    mainInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    gender: {
        fontSize: 11,
        color: '#6B7280',
        marginHorizontal: 4,
    },
    age: {
        fontSize: 11,
        color: '#6B7280',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    uhid: {
        fontSize: 11,
        color: '#6B7280',
    },
    dot: {
        fontSize: 11,
        color: '#6B7280',
        marginHorizontal: 4,
    },
    regTime: {
        fontSize: 11,
        color: '#6B7280',
    },
    expandButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    bottomTabs: {
        flexDirection: 'row',
        padding: 6,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        padding: 4,
        margin: 2,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    footerText: {
        textAlign: 'center',
        color: '#6B7280',
        paddingVertical: 12,
        fontSize: 13,
    },
});