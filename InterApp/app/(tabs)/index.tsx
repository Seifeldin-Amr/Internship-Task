import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import * as Notifications from 'expo-notifications';

// Rename Task type to TaskType
interface TaskType {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Import Task component if you have it in a separate file
import Task from '../../components/Task';

// Request Notification Permissions
const requestNotificationPermissions = async (): Promise<void> => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
};

// Schedule Notification
const scheduleNotification = async (task: TaskType): Promise<void> => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: `Don't forget to: ${task.title}`,
    },
    trigger: {
      seconds: 60, // Schedule for 1 minute from now; adjust as needed
      repeats: false,
    },
  });
};

export default function TodoScreen(): JSX.Element {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const addTask = async (): Promise<void> => {
    if (taskTitle.trim()) {
      const newTask: TaskType = {
        id: Date.now().toString(),
        title: taskTitle,
        completed: false,
        createdAt: new Date().toLocaleString(),
      };
      setTasks([...tasks, newTask]);
      setTaskTitle('');
      await scheduleNotification(newTask); // Schedule notification for the new task
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
}

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
