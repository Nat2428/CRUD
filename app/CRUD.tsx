import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, StatusBar } from "react-native";
import {
    Button,
    Chip,
    Dialog,
    FAB,
    IconButton,
    Portal,
    Searchbar,
    Surface,
    Text,
    TextInput,
    Provider as PaperProvider,
    MD3DarkTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Student = {
    id: string;
    name: string;
    grade: string;
    major: string;
};

// warna neon tiap jurusan
const MAJOR_COLORS: Record<string, string> = {
    "RPL": "#818cf8",      // Indigo
    "Animasi": "#f472b6",  // Pink
    "Broadcasting": "#fbbf24", // Amber
    "TKJ": "#34d399",      // Emerald
    "TE": "#a78bfa",       // Violet
};

const MAJOR_ICONS: Record<string, string> = {
    "RPL": "code-tags",
    "Animasi": "palette",
    "Broadcasting": "broadcast",
    "TKJ": "lan",
    "TE": "lightning-bolt",
};

// tema gelap
const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#60a5fa',
        background: '#121212',
        surface: '#1e1e1e',
        onSurface: '#e2e8f0',
        elevation: {
            level1: '#1e1e1e',
            level2: '#2d2d2d',
            level3: '#333333',
        }
    }
};

// fungsi utamanya
export default function StudentPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [major, setMajor] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    const majors = ["RPL", "Animasi", "Broadcasting", "TKJ", "TE"];

    async function loadStudents() {
        try {
            const stored = await AsyncStorage.getItem("students_data");
            if (stored) {
                setStudents(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load students:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStudents();
    }, []);

    async function saveToStorage(data: Student[]) {
        try {
            await AsyncStorage.setItem("students_data", JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save students:", error);
        }
    }

    async function handleSave() {
        if (!name.trim() || !grade || !major) {
            alert("Harap isi semua field!");
            return;
        }

        let updatedStudents: Student[];

        if (editMode && currentStudent) {
            updatedStudents = students.map((s) =>
                s.id === currentStudent.id ? { ...s, name, grade, major } : s
            );
        } else {
            const newStudent: Student = {
                id: Date.now().toString(),
                name,
                grade,
                major,
            };
            updatedStudents = [...students, newStudent];
        }

        setStudents(updatedStudents);
        await saveToStorage(updatedStudents);
        closeDialog();
    }

    async function handleDelete() {
        if (!currentStudent) return;
        const updatedStudents = students.filter((s) => s.id !== currentStudent.id);
        setStudents(updatedStudents);
        await saveToStorage(updatedStudents);
        setDeleteDialogVisible(false);
        setCurrentStudent(null);
    }

    function openAddDialog() {
        setEditMode(false);
        setCurrentStudent(null);
        setName("");
        setGrade("");
        setMajor("");
        setDialogVisible(true);
    }

    function openEditDialog(student: Student) {
        setEditMode(true);
        setCurrentStudent(student);
        setName(student.name);
        setGrade(student.grade);
        setMajor(student.major);
        setDialogVisible(true);
    }

    function openDeleteDialog(student: Student) {
        setCurrentStudent(student);
        setDeleteDialogVisible(true);
    }

    function closeDialog() {
        setDialogVisible(false);
        setName("");
        setGrade("");
        setMajor("");
        setEditMode(false);
        setCurrentStudent(null);
    }

    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.major.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStudents = students.length;
    const majorCounts = students.reduce((acc, s) => {
        acc[s.major] = (acc[s.major] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <PaperProvider theme={darkTheme}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <Text variant="headlineSmall" style={{color: '#fff'}}>Loading system...</Text>
                    </View>
                </SafeAreaView>
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={darkTheme}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#121212" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <Surface style={styles.header} elevation={2}>
                        <View>
                            <Text variant="headlineLarge" style={styles.headerTitle}>
                            Data Siswa
                            </Text>
                            <Text variant="bodyMedium" style={styles.headerSubtitle}>
                                Dashboard Admin Sekolah
                            </Text>
                        </View>
                    </Surface>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <Surface style={styles.statCard} elevation={2}>
                            <Text variant="displaySmall" style={styles.statNumber}>
                                {totalStudents}
                            </Text>
                            <Text variant="bodySmall" style={styles.statLabel}>
                                Total Siswa
                            </Text>
                        </Surface>

                        <Surface style={styles.statCard} elevation={2}>
                            <Text variant="displaySmall" style={styles.statNumber}>
                                {majors.length}
                            </Text>
                            <Text variant="bodySmall" style={styles.statLabel}>
                                Jurusan
                            </Text>
                        </Surface>
                    </View>

                    {/* Major Distribution */}
                    <View style={styles.sectionContainer}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Kategori Jurusan
                        </Text>
                        <View style={styles.chipContainer}>
                            {majors.map((m) => (
                                <Chip
                                    key={m}
                                    icon={MAJOR_ICONS[m]}
                                    style={[styles.majorChip, { borderColor: MAJOR_COLORS[m] }]}
                                    textStyle={{ color: MAJOR_COLORS[m], fontWeight: "700" }}
                                    mode="outlined"
                                >
                                    {m}: {majorCounts[m] || 0}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    {/* bar nyari */}
                    <Searchbar
                        placeholder="Cari Siswa..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={{color: '#fff'}}
                        iconColor="#94a3b8"
                        placeholderTextColor="#64748b"
                        elevation={1}
                    />

                    {/* list siswa */}
                    <View style={styles.listHeader}>
                        <Text variant="titleLarge" style={styles.listTitle}>
                            Siswa ({filteredStudents.length})
                        </Text>
                    </View>

                    {filteredStudents.length === 0 ? (
                        <Surface style={styles.emptyState} elevation={0}>
                            <Text variant="titleMedium" style={styles.emptyText}>
                                {searchQuery ? "Data tidak ditemukan" : "Kosong"}
                            </Text>
                            <Text variant="bodySmall" style={styles.emptySubtext}>
                                Klik tombol + untuk menambahkan data
                            </Text>
                        </Surface>
                    ) : (
                        filteredStudents.map((student) => (
                            <Surface key={student.id} style={styles.studentCard} elevation={1}>
                                <View style={{ width: 4, backgroundColor: MAJOR_COLORS[student.major] }} />
                                <View style={styles.cardContent}>
                                    <View style={styles.studentInfo}>
                                        <Text variant="titleLarge" style={styles.studentName}>
                                            {student.name}
                                        </Text>
                                        <View style={styles.detailsRow}>
                                            <Chip icon="school" style={[styles.majorChip, {backgroundColor: '#2d3748', height: 32}]}>
                                                Kelas {student.grade}
                                            </Chip>
                                            <Text style={[styles.detailText, {color: MAJOR_COLORS[student.major]}]}>
                                                {student.major}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <IconButton
                                            icon="pencil"
                                            iconColor="#60a5fa"
                                            size={20}
                                            onPress={() => openEditDialog(student)}
                                            style={styles.iconBtn}
                                        />
                                        <IconButton
                                            icon="delete"
                                            iconColor="#ef4444"
                                            size={20}
                                            onPress={() => openDeleteDialog(student)}
                                            style={styles.iconBtn}
                                        />
                                    </View>
                                </View>
                            </Surface>
                        ))
                    )}
                </ScrollView>

                {/* FAB */}
                <FAB
                    icon="plus"
                    style={styles.fab}
                    color="#fff"
                    onPress={openAddDialog}
                    label="Input Data"
                />

                {/* nambah/edit */}
                <Portal>
                    <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
                        <Dialog.Title style={styles.dialogTitle}>
                            {editMode ? "Update Data" : "Input Siswa Baru"}
                        </Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label="Nama Lengkap"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                left={<TextInput.Icon icon="account" />}
                                style={styles.input}
                                textColor="#fff"
                            />

                            <Text variant="labelLarge" style={styles.majorLabel}>
                                Pilih Kelas:
                            </Text>
                            <View style={styles.majorSelector}>
                                {["X", "XI"].map((g) => (
                                    <Chip
                                        key={g}
                                        selected={grade === g}
                                        onPress={() => setGrade(g)}
                                        style={[
                                            styles.majorOptionChip,
                                            grade === g && { backgroundColor: "#3b82f6" },
                                        ]}
                                        textStyle={{ color: grade === g ? "#fff" : "#94a3b8" }}
                                        mode={grade === g ? "flat" : "outlined"}
                                        showSelectedOverlay
                                    >
                                        {g}
                                    </Chip>
                                ))}
                            </View>

                            <Text variant="labelLarge" style={styles.majorLabel}>
                                Pilih Jurusan:
                            </Text>
                            <View style={styles.majorSelector}>
                                {majors.map((m) => (
                                    <Chip
                                        key={m}
                                        selected={major === m}
                                        onPress={() => setMajor(m)}
                                        icon={MAJOR_ICONS[m]}
                                        style={[
                                            styles.majorOptionChip,
                                            major === m && {
                                                backgroundColor: MAJOR_COLORS[m] + "40", // 40 = opacity
                                                borderColor: MAJOR_COLORS[m]
                                            },
                                        ]}
                                        textStyle={{ 
                                            color: major === m ? MAJOR_COLORS[m] : '#94a3b8',
                                            fontWeight: major === m ? "bold" : "normal"
                                        }}
                                        mode={major === m ? "flat" : "outlined"}
                                        showSelectedOverlay
                                    >
                                        {m}
                                    </Chip>
                                ))}
                            </View>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={closeDialog} textColor="#94a3b8">Cancel</Button>
                            <Button mode="contained" onPress={handleSave} buttonColor="#60a5fa">
                                {editMode ? "Update" : "Simpan"}
                            </Button>
                        </Dialog.Actions>
                    </Dialog>

                    {/* hapus */}
                    <Dialog
                        visible={deleteDialogVisible}
                        onDismiss={() => setDeleteDialogVisible(false)}
                        style={styles.dialog}
                    >
                        <Dialog.Title style={{color: '#ef4444'}}>⚠️ Hapus Data</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyLarge" style={{color: '#e2e8f0'}}>
                                Hapus data <Text style={{ fontWeight: "bold", color: '#fff' }}>{currentStudent?.name}</Text> permanen?
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setDeleteDialogVisible(false)} textColor="#94a3b8">
                                Batal
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor="#ef4444"
                                onPress={handleDelete}
                            >
                                Hapus
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </SafeAreaView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        padding: 24,
        borderRadius: 16,
        marginBottom: 20,
        backgroundColor: "#1e1e1e",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#333',
    },
    headerTitle: {
        fontWeight: "bold",
        marginBottom: 4,
        color: "#fff",
    },
    headerSubtitle: {
        color: "#94a3b8",
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: 'center',
    },
    statNumber: {
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        color: "#e2e8f0",
        opacity: 0.9,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 12,
        color: "#e2e8f0",
        marginLeft: 4,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    majorChip: {
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    searchBar: {
        marginBottom: 24,
        borderRadius: 12,
        backgroundColor: "#1e1e1e",
        borderWidth: 1,
        borderColor: '#333',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 4,
    },
    emptyState: {
        padding: 40,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: "#1e1e1e",
        borderWidth: 1,
        borderColor: '#333',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94a3b8',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    emptySubtext: {
        color: '#64748b',
    },
    studentCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: "#1e1e1e",
        overflow: 'hidden',
        flexDirection: 'row',
    },
    // cardLeftBorder removed from here
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    detailText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: "row",
    },
    iconBtn: {
        margin: 0,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#3b82f6",
        borderRadius: 16,
    },
    dialog: {
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: '#fff',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#121212',
    },
    majorLabel: {
        marginBottom: 12,
        marginTop: 8,
        color: '#e2e8f0',
    },
    majorSelector: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    majorOptionChip: {
        borderRadius: 8,
        backgroundColor: '#121212',
    },
});