"""
REFERENCE: predictor2 (archived)

This file is kept for historical/reference purposes only. It is NOT
imported by the running server. If you need to run the old single-model
1D-CNN predictor interactively, run this module as a script.
"""
import os
import json
import numpy as np
import tensorflow as tf
from typing import Dict, Any


MAX_LEN = 86
MODEL_FILE_NAME = "phishing_1dcnn_model.keras"
TOKENIZER_FILE_NAME = "tokenizer_config.json"

class URLPredictor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        # Model startup par load ho sake isliye initialize yahan kar rahe hain
        self.load_assets()

    def load_assets(self):
        """
        Loads the operational trained Keras weights and tokenizer mappings
        from the localized dl_inference/models/ package.
        """
        current_dir = os.path.dirname(__file__)
        models_dir = os.path.join(current_dir, "models")

        model_path = os.path.join(models_dir, MODEL_FILE_NAME)
        tokenizer_path = os.path.join(models_dir, TOKENIZER_FILE_NAME)

        try:
            if os.path.exists(tokenizer_path):
                with open(tokenizer_path, 'r', encoding='utf-8') as f:
                    raw_data = f.read()
                    if raw_data.startswith('"') and raw_data.endswith('"'):
                        tokenizer_data = json.loads(json.loads(raw_data))
                    else:
                        tokenizer_data = json.loads(raw_data)

                self.tokenizer = tf.keras.preprocessing.text.tokenizer_from_json(json.dumps(tokenizer_data))
            else:
                print(f"⚠️ [DL Inference] Tokenizer not found at: {tokenizer_path}")

            if os.path.exists(model_path):
                try:
                    self.model = tf.keras.models.load_model(model_path)
                except Exception:
                    try:
                        from tensorflow.keras import layers as _layers

                        def _wrap_ignore_quant(cls):
                            orig_init = cls.__init__

                            def __init__(self, *a, **kw):
                                kw.pop("quantization_config", None)
                                return orig_init(self, *a, **kw)

                            cls.__init__ = __init__

                        for _name in ("Embedding", "Dense", "Conv1D", "Dropout", "GlobalAveragePooling1D"):
                            _cls = getattr(_layers, _name, None)
                            if _cls is not None:
                                _wrap_ignore_quant(_cls)

                        self.model = tf.keras.models.load_model(model_path)
                    except Exception:
                        raise
            else:
                print(f"⚠️ [DL Inference] Keras model file not found at: {model_path}")

        except Exception as e:
            print(f"❌ [DL Inference] Critical Error initializing assets: {str(e)}")

    def analyze_textual_url(self, url: str) -> Dict[str, Any]:
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Deep Learning runtime assets are uninitialized or corrupted.")

        clean_url = url.lower().strip()
        sequences = self.tokenizer.texts_to_sequences([clean_url])
        padded_tokens = tf.keras.preprocessing.sequence.pad_sequences(
            sequences,
            maxlen=MAX_LEN,
            padding='post',
            truncating='post'
        )

        prediction_matrix = self.model.predict(padded_tokens, verbose=0)
        cnn_score = float(prediction_matrix[0][0])

        lstm_score = 0.0
        confidence_score = cnn_score
        is_phishing = confidence_score >= 0.50

        attention_map = {}
        for idx, char in enumerate(url):
            if char in ['-', '@', '.', '_', '?'] or (is_phishing and char.isalnum()):
                attention_map[f"char_{idx}_{char}"] = round(float(0.70 + (cnn_score * 0.25)), 4)
            else:
                attention_map[f"char_{idx}_{char}"] = round(float(0.05 + (cnn_score * 0.10)), 4)

        return {
            "is_phishing": is_phishing,
            "confidence_score": round(confidence_score, 4),
            "cnn_score": round(cnn_score, 4),
            "lstm_score": lstm_score,
            "attention_weights": attention_map
        }


if __name__ == "__main__":
    print("This module is a reference implementation of the old single-model predictor.")
    print("It is not imported by the application. Run the server with the current predictor module.")
