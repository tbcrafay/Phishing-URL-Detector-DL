import tensorflow as tf
from .base_inference import BaseInference

class CNNInference(BaseInference):
    def __init__(self, model_path, tokenizer):
        self.model = self.load_model(model_path)
        self.tokenizer = tokenizer
        self.max_len = 86

    def predict_score(self, url: str) -> float:
        seq = self.tokenizer.texts_to_sequences([url.lower().strip()])
        pad = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=self.max_len, padding='post', truncating='post')
        return float(self.model.predict(pad, verbose=0)[0][0])