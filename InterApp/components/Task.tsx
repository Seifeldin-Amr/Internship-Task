import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TaskProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string; 
  };
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
}

const CustomCheckbox: React.FC<{ checked: boolean; onToggle: () => void }> = ({ checked, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default function Task({ task, deleteTask, toggleTaskCompletion }: TaskProps): JSX.Element {
  return (
    <View style={styles.taskContainer}>
      <View style={styles.taskContent}>
        <CustomCheckbox
          checked={task.completed}
          onToggle={() => toggleTaskCompletion(task.id)}
        />
        <View style={styles.taskInfo}>
          <Text style={[styles.taskText, task.completed && styles.completedTask]}>
            {task.title}
          </Text>
          <Text style={styles.taskTime}>
            Added at: {task.createdAt}
          </Text>
        </View>
      </View>
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
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checked: {
    backgroundColor: 'green', 
    borderColor: 'green',
  },
  checkmark: {
    color: 'white', 
    fontSize: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
