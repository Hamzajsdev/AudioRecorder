import React, {useState, useEffect} from 'react';
import {
  View,
  Button,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import play from './src/icons/play.png';
import pouse from './src/icons/pouse.png';

const YourComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    AudioRecord.init({});
  }, []);

  useEffect(() => {
    let timerId;
    if (isRecording) {
      timerId = setInterval(() => {
        setRecordingDuration(prevDuration => prevDuration + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => clearInterval(timerId);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!isRecording) {
        setIsRecording(true);
        const filePath = await AudioRecord.start();
        setAudioPath(filePath);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        const audioFile = await AudioRecord.stop();
        setAudioPath(audioFile);
        handleSend([{audio: audioFile, duration: recordingDuration}]);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleSend = (newMessages = []) => {
    if (newMessages.length > 0) {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessages),
      );
    }
  };

  const renderAudio = ({currentMessage}) => {
    if (currentMessage.audio) {
      return (
        <TouchableOpacity onPress={() => playAudio(currentMessage.audio)}>
          <View style={styles.audioPlayContent}>
            <View style={styles.recordVoice}>
              <Image
                source={isPlaying ? pouse : play}
                style={styles.iconAudio}
              />
              <Text style={styles.recordText}>
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
              </Text>
            <Text style={styles.durationText}>
              {formatDuration(recordingDuration)}
            </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const playAudio = audioFile => {
    const sound = new Sound(audioFile, '', error => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      sound.play(success => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
      });
    });
  };

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
            marginLeft: -30,
          },
          right: {
            backgroundColor: '#0084FF',
          },
        }}
      />
    );
  };

  const formatDuration = durationInSeconds => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  return (
    <View style={{flex: 1}}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        renderBubble={renderBubble}
        renderMessageAudio={renderAudio}
        textInputStyle={{color: 'black'}}
        wrapperStyle={{padding: 40}}
      />
      {isRecording && (
        <Text style={{alignSelf: 'center', color: 'red'}}>
          Recording: {formatDuration(recordingDuration)}
        </Text>
      )}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
};

export default YourComponent;

const styles = StyleSheet.create({
  recordVoice: {
    width: 340,
    height: 48,
    backgroundColor: '#0084FF',
    borderRadius: 12,
    alignItems: 'center',
    paddingLeft: 15,
    flexDirection: 'row',
    gap: 12,
  },
  recordText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  audioPlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconAudio: {
    width: 18,
    height: 18,
  },
  durationText:{
    marginLeft:140
  }
});
