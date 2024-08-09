import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Task from '../../components/Task';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TodoScreen(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');

  const addTask = (): void => {
    if (taskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle,
        completed: false,
        createdAt: new Date().toLocaleString(),
      };
      setTasks([...tasks, newTask]);
      setTaskTitle('');
    }
  };

  const deleteTask = (id: string): void => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string): void => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Task
            task={item}
            deleteTask={deleteTask}
            toggleTaskCompletion={toggleTaskCompletion}
          />
        )}
      />
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    bottom: 1, 
    left: 10, 
    right: 10, 
  },
  input: {
    flex: 1,
    width: 50, 
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25, 
    paddingHorizontal: 15,
    paddingVertical: 0,
    textAlign: 'center', 
    fontSize: 16, 
    marginRight: 10, 
  },
  addButton: {
    backgroundColor: '#007bff', 
    width: 60, 
    height: 60,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff', 
    fontSize: 36, 
  },
});


