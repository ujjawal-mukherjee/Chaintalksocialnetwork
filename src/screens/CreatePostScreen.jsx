import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CreatePostScreen = () => {
  const { createPost } = useContext(chatAppContext);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant media permissions to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
      base64: false, // Explicitly disable base64
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      console.log("Selected image:", result.assets[0]); // Debug image object
    }
  };

  const uploadToPinata = async (image) => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();

    // Handle base64 or file URI
    let fileUri = image.uri;
    let fileType = image.mimeType || 'image/jpeg';
    let fileName = fileUri.split('/').pop() || 'photo.jpg';

    // If uri is a base64 data URL, convert to Blob
    if (fileUri.startsWith('data:image')) {
      const base64String = fileUri.split(',')[1];
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: fileType });
      formData.append('file', blob, fileName);
    } else {
      // Handle file URI
      fileUri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      fileType = fileExtension === 'jpg' ? 'image/jpeg' : `image/${fileExtension}`;
      fileName = image.fileName || `photo.${fileExtension}`;

      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2OWZjZjE4Yi04YzIxLTQxNTMtODQ3NS0xMTI2ODUxZjY4NjciLCJlbWFpbCI6InVqamF3YWxrdW1hcm11a2hlcmplZTMzNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMzZiNmEwNTRlMGMyOTRiNjNkYzgiLCJzY29wZWRLZXlTZWNyZXQiOiJlMTdkOTU2N2JmYWU1MjRmN2Y3Y2MyYzRhOTk4N2ZhZWQ1NTZlYTY3NjY0NzFjNjI4ZGFmNzQzMmVhMjg3NmFlIiwiZXhwIjoxNzc3MTg3NjkyfQ.mCuTmFcV0b7zGWVX6h1gJSE3vFkd_prv-TwKrv_VrgQ`, // Replace with valid JWT
        },
        body: formData,
      });
      const data = await res.json();
      console.log('Pinata response:', JSON.stringify(data, null, 2)); // Debug response
      if (!res.ok) throw new Error(data.error?.details || data.error || 'Upload failed');
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (err) {
      console.error('Pinata upload error:', err);
      throw new Error(`Image upload failed: ${err.message}`);
    }
  };

  const handlePost = async () => {
    if (content.trim() === '') {
      Alert.alert('Validation', 'Post content cannot be empty.');
      return;
    }
    setUploading(true);
    try {
      let imageUrl = '';
      if (image) imageUrl = await uploadToPinata(image);
      await createPost(content, imageUrl);
      setContent('');
      setImage(null);
      Alert.alert('Success', 'Post created successfully.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePost = () => {
    navigation.navigate('GeneratePost');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.headerSection, { backgroundColor: colors.surface }]}>
            <View style={[styles.headerGradient, { backgroundColor: colors.primary + '20' }]} />
            <Text style={[styles.heading, { color: colors.text }]}>
              Create<Text style={[styles.highlight, { color: colors.primary }]}> Post</Text>
            </Text>
            <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
              Share your thoughts!
            </Text>
          </View>

          <View style={[styles.contentSection, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={content}
              onChangeText={setContent}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.imagePicker, { backgroundColor: colors.primary }]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add-photo-alternate" size={20} color="#fff" />
                <Text style={styles.imagePickerText}>
                  {image ? 'Change' : 'Add'} Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: colors.secondary }]}
                onPress={handleGeneratePost}
                activeOpacity={0.8}
              >
                <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Post</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.postButton,
                  { backgroundColor: colors.primary },
                  uploading && styles.postButtonDisabled,
                ]}
                onPress={handlePost}
                disabled={uploading}
                activeOpacity={0.8}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="#fff" />
                    <Text style={styles.postButtonText}>Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={[styles.removeImage, { backgroundColor: colors.error }]}
                  onPress={() => setImage(null)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  mainContent: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highlight: {
    fontWeight: 'bold',
  },
  subHeading: {
    fontSize: 16,
  },
  contentSection: {
    padding: 20,
    borderRadius: 16,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreatePostScreen;