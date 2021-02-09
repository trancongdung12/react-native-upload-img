import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions,Image, ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
const UploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState('');
  const token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5YjE3ZDFjLTQwNDQtNDc0YS05OGEwLTIwZjNkYTNhNjc4YyIsImZpcnN0TmFtZSI6IkTFqW5nIiwibGFzdE5hbWUiOiJUcuG6p24gQ8O0bmciLCJlbWFpbCI6InN0cmluZ0BnbWFpbC5jb20iLCJzeXN0ZW1Sb2xlIjoidXNlciIsImJ1c2luZXNzUm9sZSI6bnVsbCwiYnVzaW5lc3NJZCI6bnVsbCwidHRsIjo2MDQ4MDAwMDAsImlhdCI6MTYxMjYyNTI0NH0.1U96HESSHUepot1hR6UBGrPMwPmgnvQshegF6mq2y8c"
  const uploadImageFunction = () => {
    const options = {
      title: 'selectYourPrescription',
      takePhotoButtonTitle:  'takePhoto',
      chooseFromLibraryButtonTitle:  'chooseFromLibrary',
      cancelButtonTitle:  'cancel',
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
        path: 'images',
      },
      maxWidth: 500,
      maxHeight: 500,     
      permissionDenied: {
        title:  'appName',
        text:  'permissionWarning',
        okTitle:  'later',
        reTryTitle:  'openSettings',
      },
      quality: 1,
    };
    console.log('run');
    ImagePicker.showImagePicker(options, async response => {
      if (response.didCancel) {
        console.log(1);
      } else if (response.error) {
        console.log(response.error);
      } else if (response.customButton) {
        console.log(3);
      } else {
        setLoading(true);
        console.log(response);
        const dataResponse = await imageUpload (
          {
            type: response.type,
            uri: response.uri,
            fileName: response.fileName,
          },
          token,
        );
        const { url } = dataResponse;
        console.log(dataResponse);
        setLoading(false);
        console.log('onSave -> images', url);
        setImages(url);
      }
    });
  };
  function getHeaderAndContentType(extension) {
    let mimeType;
    if (extension.includes('jpg') || extension.includes('jpeg')) {
      mimeType = 'image/jpeg';
    }
    if (extension.includes('png')) {
      mimeType = 'image/png';
    }
    return mimeType;
  }
  const imageUpload = async (data, token) =>{
    console.log("upload");
    try {
      let extension = 'png';
      if (data.path) {
        extension = data.path.split('.').pop();
      } else {
        extension = data.uri.split('.').pop();
      }
      const { url, name, mimeType } = getHeaderAndContentType(extension);
  
      const fileName = `${name}${Date.now()}.${extension}`;
      console.log('st 1');
      const upload = await fetch('https://proxibox-pharma-api-staging.enouvo.com/api/v1/signedUrlS3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          type: data.type,
          key: fileName,
        }),
      }).then(response => 
        response.json().then(jsonObj => {return jsonObj  })
    );
      
      let source = data.uri;
      const result = await RNFetchBlob.fetch(
        'PUT',
        upload.uploadUrl,
        {
          'Content-Type': data.type,
        },
        RNFetchBlob.wrap(source),
      );
      return { url: upload.url, uri: data.uri };
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <View style={styles.body}>
      {loading && <ActivityIndicator size="small" color="#0000ff" />}
      <Text style={{ textAlign: 'center', fontSize: 20, paddingBottom: 10 }}>
        Pick Images from Camera & Gallery
      </Text>
      <View style={styles.ImageSections}>
        <View>
          <Text style={{ textAlign: 'center' }}>Base 64 String</Text>
        </View>
        <View>
          <Image style={{width:100, height: 100}} source={{uri: images ? images : 'https://cf.shopee.vn/file/b44a7452bcdc15f557c9db2c5b0e322d'}} />
        </View>
      </View>

      <View style={styles.btnParentSection}>
        <TouchableOpacity onPress={() =>uploadImageFunction()} style={styles.btnSection}>
          <Text style={styles.btnText}>Choose File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UploadImage;

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    height: Dimensions.get('screen').height - 20,
    width: Dimensions.get('screen').width,
  },
  ImageSections: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  images: {
    width: 150,
    height: 150,
    borderColor: 'black',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  btnParentSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  btnSection: {
    width: 225,
    height: 50,
    backgroundColor: '#DCDCDC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginBottom: 10,
  },
  btnText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
