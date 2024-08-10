import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Dimensions, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import Task from '../../components/Task';

interface TaskType {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate: Date | null;
  notificationId?: string;
}

export default function TodoScreen(): JSX.Element {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const screenHeight = Dimensions.get('window').height;

  const requestNotificationPermissions = async (): Promise<void> => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  };

  const scheduleNotification = async (task: TaskType): Promise<string | undefined> => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    const triggerDate = task.dueDate ? new Date(task.dueDate).getTime() / 1000 : Date.now() / 1000;
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Reminder for: ${task.title}`,
      },
      trigger: {
        seconds: Math.max(triggerDate - (Date.now() / 1000), 0),
        repeats: false,
      },
    });

    return notificationId;
  };

  useEffect(() => {
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, 
        shouldPlaySound: true, 
        shouldSetBadge: false, 
      }),
    });

    
    requestNotificationPermissions();

    
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      
    });

    
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const addTask = async (): Promise<void> => {
    if (taskTitle.trim()) {
      const newTask: TaskType = {
        id: Date.now().toString(),
        title: taskTitle,
        completed: false,
        createdAt: new Date().toLocaleString(),
        dueDate: dueDate,
      };

      const notificationId = await scheduleNotification(newTask);
      newTask.notificationId = notificationId || '';

      setTasks([...tasks, newTask]);
      setTaskTitle('');
      setDueDate(null);
      bottomSheetRef.current?.close();
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete?.notificationId) {
      console.log(`Canceling notification ID: ${taskToDelete.notificationId}`);
      await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
    }
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = async (id: string): Promise<void> => {
    const updatedTasks = await Promise.all(tasks.map(async task => {
      if (task.id === id) {
        if (!task.completed) {
          if (task.notificationId) {
            console.log(`Canceling notification ID: ${task.notificationId}`);
            await Notifications.cancelScheduledNotificationAsync(task.notificationId);
          }
          return { ...task, completed: true, notificationId: undefined };
        } else {
          let notificationId: string | undefined;
          if (task.dueDate) {
            console.log(`Scheduling notification for task ID: ${task.id}`);
            notificationId = await scheduleNotification({ ...task, completed: false });
          }
          return { ...task, completed: false, notificationId };
        }
      }
      return task;
    }));

    setTasks(updatedTasks);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <TouchableOpacity
            onPress={() => {
              bottomSheetRef.current?.expand(); // Open the bottom sheet
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // Start closed
          snapPoints={[screenHeight * 0.4, screenHeight * 0.6, screenHeight * 0.8]}
          enablePanDownToClose 
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1} 
              opacity={0.5} 
            />
          )}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>
                  {dueDate ? dueDate.toLocaleDateString() : 'Select Due Date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    setDueDate(selectedDate || dueDate);
                  }}
                />
              )}
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  {dueDate ? dueDate.toLocaleTimeString() : 'Select Time'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    const newDate = dueDate ? new Date(dueDate) : new Date();
                    newDate.setHours(selectedTime?.getHours() || 0);
                    newDate.setMinutes(selectedTime?.getMinutes() || 0);
                    setDueDate(newDate);
                  }}
                />
              )}
            </View>
            <TouchableOpacity onPress={addTask} style={styles.addTaskButton}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 60,
    height: 60,
  },
  input: {
    width: '100%',
    height: 150, 
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    textAlign: 'left',
    fontSize: 16,
    marginBottom: 10, 
  },
  dateButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 20,
    marginBottom: 10, 
  },
  dateButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  timeButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 20,
    marginBottom: 10, 
  },
  timeButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
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
    fontSize: 25,
  },
  sheetContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', 
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
  },
  addTaskButton: {
    backgroundColor: '#007bff',
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
