import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IndexPage() {
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");

  async function storeData() {
    const data = { nama, umur, kelas, jurusan };
    await AsyncStorage.setItem("userData", JSON.stringify(data));
  }

  async function removeData() {
    await AsyncStorage.removeItem("userData");
    setNama("");
    setUmur("");
    setKelas("");
    setJurusan("");
  }

  async function getData() {
    const value = await AsyncStorage.getItem("userData");
    if (value !== null) {
      const data = JSON.parse(value);
      setNama(data.nama || "");
      setUmur(data.umur || "");
      setKelas(data.kelas || "");
      setJurusan(data.jurusan || "");
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: "bold" }}>
        Data Siswa
      </Text>

      <Text>Nama</Text>
      <TextInput
        placeholder="Masukkan nama"
        value={nama}
        onChangeText={setNama}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Umur</Text>
      <TextInput
        placeholder="Masukkan umur"
        value={umur}
        onChangeText={setUmur}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
        keyboardType="numeric"
      />

      <Text>Kelas</Text>
      <TextInput
        placeholder="Masukkan kelas"
        value={kelas}
        onChangeText={setKelas}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Jurusan</Text>
      <TextInput
        placeholder="Masukkan jurusan"
        value={jurusan}
        onChangeText={setJurusan}
        style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
      />

      <View style={{ gap: 10 }}>
        <Button title="Simpan" onPress={storeData} />
        <Button title="Ambil" onPress={getData} />
        <Button title="Hapus" onPress={removeData} />
      </View>
    </SafeAreaView>
  );
}
