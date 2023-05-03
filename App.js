import React, { useState, useEffect } from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

const db = SQLite.openDatabase("bmiDB.db");

var results = '';

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
        tx.executeSql(
        `select date(itemDate) as itemDate, bmi, weight, height from items`, [],
        (_, { rows: { _array } }) => setItems(_array)
      );
    },
    (error) => {console.log(error)});
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.itemsContainer}>
      <Text style={styles.sectionHeading}>BMI History</Text>
        {items.map(({itemDate, bmi, weight, height}) => (
        <View>
          <Text style={styles.data}>{itemDate + ": " + bmi + "(W:" + weight + ", H: " + height + ")"}</Text>
        </View>
      ))}
    </View>
  );
}

export default function App() {
var Weight = '';
var Height = '';
var BMI = 0;
const [Content, setContent] = useState(false);
var Category = '';


  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, itemDate real, bmi real, weight real, height real);"
      );
    });
  }, []);

  function onSave() {
    BMI = ((Weight / (Height * Height))* 703).toFixed(1)


    if (BMI <= 18.4){
      Category = 'Underweight';
    } 
    else if (BMI <= 24.9){
      Category = 'Healthy';
    }
    else if (BMI <= 29.9){
      Category = 'Overweight';
    }
    else { Category = 'Obese'; }

    results = "Body Mass Index is " + BMI + "\t(" + Category + ")";

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (itemDate, bmi, weight, height) values (julianday('now'), ?, ?, ?)", [BMI, Weight, Height]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null
    );
    setContent(true);
  };

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.toolbar}>BMI Calculator</Text>
      <ScrollView style={styles.main}>
        <TextInput 
          style={styles.input} 
          placeholder={'Weight in Pounds'}
          onChangeText={(weight) => Weight = weight}
        >
        </TextInput>
        <TextInput 
          style={styles.input} 
          placeholder={'Height in Inches'}
          onChangeText={(height) => Height = height}
        >
        </TextInput>
        <Pressable style={styles.button} onPress={onSave}>
          <Text style={styles.buttonText}>
            Compute BMI
          </Text>
        </Pressable>
        <ScrollView style={styles.BMIInfoView}>
        {
          Content ? <Text style={styles.BMIInfo}>{results}</Text> : null
        }
        </ScrollView>
        <ScrollView>
          <Items
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: 'white',
    fontSize: 28,
    padding: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5
  },
  input: {
    backgroundColor: '#f5f5f5',
    fontSize: 24,
    padding: 5,
    margin: 5
  },
  button: {
    backgroundColor: '#34495e',
    margin: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    padding: 10,
    textAlign: 'center',
  },
  BMIInfoView: {
    marginBottom: 75,
    marginTop: 75,
  },
  BMIInfo: {
    fontSize: 28,
    textAlign: 'center',
  },
  assessment: {
    fontSize: 20,
  },
  sectionHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
  data: {
    fontSize: 20
  },
  itemsContainer: {
    marginLeft: 5
  }
});
