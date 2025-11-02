# Face-API.js Models

This directory should contain the face-api.js model files required for facial recognition.

## Required Models

Please download the following model files from the [face-api.js models repository](https://github.com/justadudewhohacks/face-api.js-models) and place them in this directory:

1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**
7. **face_recognition_model-shard2**
8. **ssd_mobilenetv1_model-weights_manifest.json**
9. **ssd_mobilenetv1_model-shard1**
10. **ssd_mobilenetv1_model-shard2**

## Quick Setup

You can download all models using:

```bash
# From the public/models directory
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/tiny_face_detector_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/tiny_face_detector_model-shard1
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_landmark_68_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_landmark_68_model-shard1
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-shard1
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-shard2
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/ssd_mobilenetv1_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/ssd_mobilenetv1_model-shard1
wget https://github.com/justadudewhohacks/face-api.js-models/raw/master/ssd_mobilenetv1_model-shard2
```

## Note

The application will automatically load these models when you access the camera or face registration features.

If models are not found, you'll see an error message in the application.