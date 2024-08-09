import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TaskProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
  };
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
}

export default function Task({ task, deleteTask, toggleTaskCompletion }: TaskProps): JSX.Element {
  return (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)}>
        <Text style={[styles.taskText, task.completed && styles.completedTask]}>
          {task.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(task.id)}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
