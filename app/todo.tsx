import { SafeAreaView, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
  Checkbox,
  Portal,
  Dialog,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loading } from '../components/ui/Loading';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TodoScreen() {
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await AsyncStorage.getItem('TODOS');
      if (data) setTodos(JSON.parse(data));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = async (data: Todo[]) => {
    await AsyncStorage.setItem('TODOS', JSON.stringify(data));
  };

  const addTodo = () => {
    if (!input.trim()) return;

    const newTodos = [
      ...todos,
      {
        id: Date.now().toString(),
        title: input,
        completed: false,
      },
    ];

    setTodos(newTodos);
    saveTodos(newTodos);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map(item =>
      item.id === id
        ? { ...item, completed: !item.completed }
        : item
    );

    setTodos(newTodos);
    saveTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const newTodos = todos.filter(item => item.id !== id);
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  const startEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditText(todo.title);
    setVisible(true);
  };

  async function saveEdit() {
    if (editId && editText.trim()) {
      const newTodos = todos.map(item =>
        item.id === editId ? { ...item, title: editText } : item
      );
      setTodos(newTodos);
      await saveTodos(newTodos);
    }
    closeEdit();
  }

  const closeEdit = () => {
    setVisible(false);
    setEditId(null);
    setEditText('');
  };

  if (isLoading) {
    return <Loading message="Memuat tugas kamu..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Surface style={{ padding: 16, borderRadius: 16, elevation: 4 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
            To-Do List
          </Text>

          <TextInput
            label="Tambah tugas"
            mode="outlined"
            value={input}
            onChangeText={setInput}
            style={{ marginBottom: 12 }}
          />

          <Button mode="contained" onPress={addTodo}>
            Tambah
          </Button>

          {/* LIST */}
          <View style={{ marginTop: 16 }}>
            {todos.map(item => (
              <Surface
                key={item.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 10,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox
                      status={item.completed ? 'checked' : 'unchecked'}
                      onPress={() => toggleTodo(item.id)}
                    />
                    <Text
                      style={{
                        textDecorationLine: item.completed
                          ? 'line-through'
                          : 'none',
                        opacity: item.completed ? 0.5 : 1,
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>

                    <View style={{ flexDirection: 'row' }}>
                      <IconButton
                        icon="pencil"
                        onPress={() => startEdit(item)}
                      />
                      <IconButton
                        icon="delete"
                        onPress={() => deleteTodo(item.id)}
                      />
                    </View>
                </View>
              </Surface>
            ))}
          </View>

        </Surface>

      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={closeEdit}>
          <Dialog.Title>Edit Tugas</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nama Tugas"
              value={editText}
              onChangeText={setEditText}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEdit}>Batal</Button>
            <Button onPress={saveEdit}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
